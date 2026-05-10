import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé.' });
  }

  const supabase = await serverSupabaseClient(event);

  // Récupérer le corps de la requête
  const body = await readBody(event);
  if (!body || !body.title || !body.ingredients) {
    throw createError({ statusCode: 400, statusMessage: 'Données de recette invalides.' });
  }

  // 1. Sauvegarder la recette
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      user_id: user.id,
      title: body.title,
      servings: body.servings || 2,
      prep_time: body.prep_time || null,
      tags: body.tags || [],
      in_shopping_list: false // Par défaut, non ajouté à la liste de courses
    })
    .select('id')
    .single();

  if (recipeError || !recipe) {
    console.error('Erreur Supabase (Recipes):', recipeError);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la sauvegarde de la recette.' });
  }

  // 2. Préparer et sauvegarder les ingrédients
  const ingredientsToInsert = body.ingredients.map((ing: any) => ({
    user_id: user.id,
    recipe_id: recipe.id,
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit
  }));

  const { error: ingredientsError } = await supabase
    .from('ingredients')
    .insert(ingredientsToInsert);

  if (ingredientsError) {
    console.error('Erreur Supabase (Ingredients):', ingredientsError);
    // Dans l'idéal, on ferait un rollback ici, mais gardons les choses simples
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la sauvegarde des ingrédients.' });
  }

  return { success: true, recipeId: recipe.id, message: 'Recette sauvegardée avec succès.' };
});
