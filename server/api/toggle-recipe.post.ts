import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Identifiants Supabase manquants.' });
  }

  const body = await readBody(event);
  if (!body || !body.id || typeof body.in_shopping_list !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres invalides.' });
  }

  const supabase = createClient(config.public.supabaseUrl, config.supabaseServiceKey);

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
