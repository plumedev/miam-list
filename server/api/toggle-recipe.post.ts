import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non autorisé.' });

  const body = await readBody(event);
  
  if (!body || !body.id || typeof body.in_shopping_list !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres manquants ou invalides.' });
  }

  const supabase = serverSupabaseServiceRole(event);

  const { error } = await supabase
    .from('recipes')
    .update({ in_shopping_list: body.in_shopping_list })
    .eq('id', body.id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Erreur Supabase (Update Recipe):', error);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la mise à jour de la recette.' });
  }

  return { success: true };
});
