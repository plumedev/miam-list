import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body || !body.id || typeof body.in_shopping_list !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres manquants ou invalides.' });
  }

  const supabase = await serverSupabaseClient(event);

  const { error } = await supabase
    .from('recipes')
    .update({ in_shopping_list: body.in_shopping_list })
    .eq('id', body.id);

  if (error) {
    console.error('Erreur Supabase (Update Recipe):', error);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la mise à jour de la recette.' });
  }

  return { success: true };
});
