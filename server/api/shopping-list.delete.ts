import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Identifiants Supabase manquants.' });
  }

  const supabase = createClient(config.public.supabaseUrl, config.supabaseServiceKey);

  // On désélectionne simplement toutes les recettes
  const { error: updateError } = await supabase
    .from('recipes')
    .update({ in_shopping_list: false })
    .neq('title', 'impossible_string_123'); // Bypass pour affecter toutes les lignes

  if (updateError) {
    console.error('Erreur Supabase (Clear Shopping List):', updateError);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors du nettoyage de la liste.' });
  }

  return { success: true, message: 'Liste de courses vidée avec succès.' };
});
