import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  
  // Récupération explicite du token depuis le header (inséré par notre frontend)
  const authHeader = getHeader(event, 'Authorization');
  let userId = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    // Vérification infaillible du token auprès de Supabase
    const { data } = await supabase.auth.getUser(token);
    userId = data.user?.id;
  }

  // Fallback sur le cookie si le header manque (utile pour le SSR)
  if (!userId) {
    const user = await serverSupabaseUser(event);
    userId = user?.id || (user as any)?.value?.id;
  }
  
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé (Token invalide ou introuvable).' });
  }

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
    user_id: userId,
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
