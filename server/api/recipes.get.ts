import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur Supabase (Fetch Recipes):', error);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la récupération des recettes.' });
  }

  return recipes;
});
