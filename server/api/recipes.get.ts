import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Identifiants Supabase manquants.' });
  }

  const supabase = createClient(config.public.supabaseUrl, config.supabaseServiceKey);

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur Supabase (Fetch Recipes):', error);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la récupération des recettes.' });
  }

  return recipes;
});
