import { serverSupabaseServiceRole, serverSupabaseUser, serverSupabaseSession } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const session = await serverSupabaseSession(event);
  
  // Extraction robuste de l'ID utilisateur pour pallier toute différence de version Nuxt Supabase
  const userId = user?.id || (user as any)?.value?.id || session?.user?.id;
  
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé (ID introuvable).' });
  }

  const supabase = serverSupabaseServiceRole(event);

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
