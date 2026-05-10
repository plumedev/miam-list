import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non autorisé.' });

  const supabase = serverSupabaseServiceRole(event);

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur Supabase (Fetch Recipes):', error);
    throw createError({ statusCode: 500, statusMessage: `Erreur Supabase: ${error?.message || 'Inconnue'}` });
  }

  return recipes;
});
