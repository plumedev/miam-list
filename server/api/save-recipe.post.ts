import { serverSupabaseServiceRole, serverSupabaseUser, serverSupabaseSession } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const session = await serverSupabaseSession(event);
  const userId = user?.id || (user as any)?.value?.id || session?.user?.id;
  
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé.' });
  }

  // Utilisation de la clé Service Role pour l'insertion afin d'éviter le blocage RLS strict
  const supabase = serverSupabaseServiceRole(event);

  // Récupérer le corps de la requête
  const body = await readBody(event);
  if (!body || !body.title || !body.ingredients) {
    throw createError({ statusCode: 400, statusMessage: 'Données de recette invalides.' });
  }

  // 1. Sauvegarder la recette
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      user_id: userId,
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
    throw createError({ statusCode: 500, statusMessage: `Erreur Supabase: ${recipeError?.message || 'Erreur inconnue'}` });
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
