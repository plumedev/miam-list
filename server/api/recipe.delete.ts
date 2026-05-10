import { serverSupabaseServiceRole, serverSupabaseUser, serverSupabaseSession } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const session = await serverSupabaseSession(event);
  const userId = user?.id || (user as any)?.value?.id || session?.user?.id;
  
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé.' });
  }

  const query = getQuery(event);
  const id = query.id as string;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID de recette manquant.' });
  }

  const supabase = serverSupabaseServiceRole(event);

  // 1. Supprimer d'abord les ingrédients pour éviter les problèmes de clé étrangère
  const { error: ingredientsError } = await supabase
    .from('ingredients')
    .delete()
    .eq('recipe_id', id)
    .eq('user_id', userId);

  if (ingredientsError) {
    console.error('Erreur Supabase (Delete Recipe Ingredients):', ingredientsError);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la suppression des ingrédients liés.' });
  }

  // 2. Supprimer la recette
  const { error: recipeError } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (recipeError) {
    console.error('Erreur Supabase (Delete Recipe):', recipeError);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la suppression de la recette.' });
  }

  return { success: true, message: 'Recette supprimée avec succès.' };
});
