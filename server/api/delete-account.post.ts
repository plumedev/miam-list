import { serverSupabaseClient } from '#supabase/server';
import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  // On récupère le client lié à la session courante pour garantir l'identité
  const supabaseAuth = await serverSupabaseClient(event);
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user || !user.id) {
    throw createError({ statusCode: 401, statusMessage: 'Session utilisateur invalide' });
  }

  // On utilise supabaseAdmin (service_role) pour avoir les droits d'administration sur Auth
  const supabaseAdmin = createClient(config.public.supabaseUrl, config.supabaseServiceKey);
  
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  
  if (error) {
    console.error('Erreur Supabase lors de la suppression du compte:', error);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la suppression du compte.' });
  }
  
  return { success: true };
});
