import { serverSupabaseServiceRole, serverSupabaseUser, serverSupabaseSession } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const session = await serverSupabaseSession(event);
  const userId = user?.id || (user as any)?.value?.id || session?.user?.id;
  
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé.' });
  }

  const supabase = serverSupabaseServiceRole(event);

  // On désélectionne simplement toutes les recettes
  const { error: updateError } = await supabase
    .from('recipes')
    .update({ in_shopping_list: false })
    .eq('user_id', userId)
    .neq('title', 'impossible_string_123'); // Bypass pour affecter toutes les lignes

  if (updateError) {
    console.error('Erreur Supabase (Clear Shopping List):', updateError);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors du nettoyage de la liste.' });
  }

  return { success: true, message: 'Liste de courses vidée avec succès.' };
});
