import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Identifiants Supabase manquants.' });
  }

  const body = await readBody(event);
  if (!body || !body.recipeId || typeof body.newServings !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres invalides.' });
  }

  const supabase = createClient(config.public.supabaseUrl, config.supabaseServiceKey);

  // 1. Récupérer la recette actuelle pour avoir les portions d'origine
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('servings')
    .eq('id', body.recipeId)
    .single();

  if (recipeError || !recipe) {
    throw createError({ statusCode: 404, statusMessage: 'Recette introuvable.' });
  }

  const currentServings = recipe.servings || 1;
  const ratio = body.newServings / currentServings;

  // 2. Mettre à jour la recette
  const { error: updateRecipeError } = await supabase
    .from('recipes')
    .update({ servings: body.newServings })
    .eq('id', body.recipeId);

  if (updateRecipeError) {
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la mise à jour de la recette.' });
  }

  // 3. Récupérer les ingrédients
  const { data: ingredients, error: ingredientsError } = await supabase
    .from('ingredients')
    .select('*')
    .eq('recipe_id', body.recipeId);

  if (!ingredientsError && ingredients) {
    // 4. Mettre à jour chaque ingrédient avec la nouvelle proportion
    const updates = ingredients.map(ing => {
      if (ing.quantity != null) {
        return supabase
          .from('ingredients')
          .update({ quantity: parseFloat((ing.quantity * ratio).toFixed(2)) })
          .eq('id', ing.id);
      }
      return Promise.resolve();
    });

    await Promise.all(updates);
  }

  return { success: true };
});
