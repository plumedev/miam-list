import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  
  const authHeader = getHeader(event, 'Authorization');
  let userId = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const { data } = await supabase.auth.getUser(token);
    userId = data.user?.id;
  }

  if (!userId) {
    const user = await serverSupabaseUser(event);
    userId = user?.id || (user as any)?.value?.id;
  }
  
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé (ID introuvable).' });
  }

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur Supabase (Fetch Recipes):', error);
    throw createError({ statusCode: 500, statusMessage: `Erreur Supabase: ${error?.message || 'Inconnue'}` });
  }

  return recipes;
});
