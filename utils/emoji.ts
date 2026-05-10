export function getIngredientEmoji(name: string): string {
  if (!name) return '🛒';
  const lowerName = name.toLowerCase();
  
  const emojiMap: Record<string, string[]> = {
    '🥩': ['viande', 'boeuf', 'veau', 'steak', 'porc', 'lardon', 'saucisse', 'chorizo', 'haché'],
    '🍗': ['poulet', 'dinde', 'volaille', 'filet de poulet', 'escalope'],
    '🐟': ['poisson', 'saumon', 'cabillaud', 'thon', 'crevette', 'scampi'],
    '🧀': ['fromage', 'parmesan', 'mozzarella', 'cheddar', 'gouda', 'feta', 'ricotta', 'mascarpone', 'emmental', 'chèvre', 'fromage râpé'],
    '🥛': ['lait', 'crème', 'beurre', 'yaourt', 'babeurre'],
    '🥚': ['oeuf', 'œufs', 'oeufs', 'œuf'],
    '🧅': ['oignon', 'échalote', 'ciboule'],
    '🧄': ['ail', 'gousse d\'ail'],
    '🍅': ['tomate', 'cerise', 'concentré de tomate', 'purée de tomate', 'passata'],
    '🥔': ['pomme de terre', 'patate', 'grenaille'],
    '🥕': ['carotte', 'carottes'],
    '🥒': ['concombre', 'courgette', 'cornichon'],
    '🥑': ['avocat', 'guacamole'],
    '🥦': ['brocoli', 'chou', 'chou-fleur'],
    '🍄': ['champignon', 'paris', 'pleurote'],
    '🍋': ['citron', 'lime', 'zeste'],
    '🌿': ['herbe', 'persil', 'basilic', 'coriandre', 'ciboulette', 'thym', 'romarin', 'menthe', 'origan', 'aneth', 'herbes', 'romarin'],
    '🌶️': ['piment', 'épice', 'curry', 'paprika', 'cumin', 'pâte de curry', 'pimenté', 'ras el hanout'],
    '🫑': ['poivron', 'poivrons'],
    '🧂': ['sel', 'poivre', 'bouillon', 'gros sel', 'sauce soja', 'sauce'],
    '🍯': ['miel', 'sucre', 'sirop', 'cassonade', 'confiture'],
    '🌾': ['riz', 'pâte', 'pates', 'farine', 'blé', 'semoule', 'quinoa', 'nouille', 'spaghetti', 'penne', 'macaroni'],
    '🍞': ['pain', 'baguette', 'chapelure', 'bun', 'tortilla', 'wrap', 'brioche'],
    '🥜': ['noix', 'cacahuète', 'amande', 'noisette', 'pécan', 'pignon', 'sésame', 'cajou'],
    '🍎': ['pomme', 'poire', 'fruit', 'fraise'],
    '🍌': ['banane'],
    '🥗': ['salade', 'laitue', 'mâche', 'roquette', 'épinard'],
    '🍷': ['vin', 'vinaigre', 'balsamique', 'mirin'],
    '🫒': ['olive', 'huile d\'olive', 'huile'],
    '🌭': ['knacki', 'saucisse de strasbourg', 'hot-dog'],
    '🍔': ['burger', 'hamburger'],
    '🍟': ['frite', 'frites'],
    '🍕': ['pizza', 'pâte à pizza'],
    '🍫': ['chocolat', 'cacao'],
    '🧅': ['oignon', 'oignons'],
  };

  for (const [emoji, keywords] of Object.entries(emojiMap)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return emoji;
    }
  }

  // Fallback si rien n'est trouvé
  return '🛒';
}
