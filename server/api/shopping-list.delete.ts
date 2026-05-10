import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non autorisé.' });

  const supabase = serverSupabaseServiceRole(event);

  // On désélectionne simplement toutes les recettes
  const { error: updateError } = await supabase
    .from('recipes')
    .update({ in_shopping_list: false })
    .eq('user_id', user.id)
    .neq('title', 'impossible_string_123'); // Bypass pour affecter toutes les lignes

  if (updateError) {
    console.error('Erreur Supabase (Clear Shopping List):', updateError);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors du nettoyage de la liste.' });
  }

  return { success: true, message: 'Liste de courses vidée avec succès.' };
});
