import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Identifiants Supabase manquants.' });
  }

  const supabase = createClient(config.public.supabaseUrl, config.supabaseServiceKey);

  // 1. Vider la table des ingrédients
  const { error: errorIngredients } = await supabase
    .from('ingredients')
    .delete()
    .not('id', 'is', null); // Condition qui fonctionne aussi bien avec des IDs numéritiques qu'avec des UUIDs

  if (errorIngredients) {
    console.error('Erreur Supabase (Delete Ingredients):', errorIngredients);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la suppression des ingrédients.' });
  }

  // 2. Vider la table des recettes (optionnel mais plus propre pour réinitialiser la session)
  const { error: errorRecipes } = await supabase
    .from('recipes')
    .delete()
    .not('id', 'is', null);

  if (errorRecipes) {
    console.error('Erreur Supabase (Delete Recipes):', errorRecipes);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la suppression des recettes.' });
  }

  return { success: true, message: 'Liste de courses vidée avec succès.' };
});
