import { GoogleGenAI, Type } from '@google/genai';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  if (!config.geminiApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Clé API Gemini non configurée.' });
  }

  // Récupération de l'image (form-data)
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Aucune image trouvée.' });
  }

  const imageFile = formData.find(item => item.name === 'image');
  if (!imageFile || !imageFile.data) {
    throw createError({ statusCode: 400, statusMessage: 'Image invalide.' });
  }

  // Initialisation de Gemini
  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  // Conversion en base64
  const base64Image = imageFile.data.toString('base64');
  const mimeType = imageFile.type || 'image/jpeg';

  const prompt = "Extrais le nom, le nombre de personnes et les ingrédients (quantité et unité). Convertis les fractions en décimales.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Flash est le plus rapide et le moins cher pour ce type de tâche multimodale
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            servings: { type: Type.INTEGER },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) {
        throw new Error("Gemini n'a renvoyé aucun texte.");
    }
    
    // Le SDK renvoie la réponse JSON sous forme de chaîne, on doit la parser
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error('Erreur OCR Gemini:', error);
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de l\'analyse de l\'image: ' + error.message });
  }
});
