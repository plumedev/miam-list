import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Identifiants Supabase manquants.' });
  }

  const supabase = createClient(config.public.supabaseUrl, config.supabaseServiceKey);

  // Récupérer tous les ingrédients de la base de données
  const { data: ingredients, error } = await supabase
    .from('ingredients')
    .select('*');

  if (error || !ingredients) {
    console.error('Erreur Supabase (Fetch Ingredients):', error);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la récupération de la liste.' });
  }

  // Regrouper par nom d'ingrédient
  const shoppingListMap = new Map();

  ingredients.forEach(ing => {
    // On met en minuscule et on retire les espaces pour éviter les doublons
    const rawName = ing.name || '';
    const normalizedName = rawName.trim().toLowerCase();
    
    if (shoppingListMap.has(normalizedName)) {
      const existing = shoppingListMap.get(normalizedName);
      
      // On additionne les quantités
      // Si la quantité n'est pas un nombre (null), on considère 0 pour le calcul
      const qty = parseFloat(ing.quantity) || 0;
      existing.quantity += qty;
      
      // On essaie de garder l'unité si elle existe
      if (!existing.unit && ing.unit) {
        existing.unit = ing.unit.trim();
      }
    } else {
      shoppingListMap.set(normalizedName, {
        id: ing.id, // On garde un ID de référence (le premier trouvé)
        name: rawName, // Nom d'affichage original (avec majuscule potentielle)
        quantity: parseFloat(ing.quantity) || 0,
        unit: ing.unit ? ing.unit.trim() : ''
      });
    }
  });

  // Convertir la Map en tableau et trier par nom alphabétique
  return Array.from(shoppingListMap.values()).sort((a, b) => a.name.localeCompare(b.name));
});
