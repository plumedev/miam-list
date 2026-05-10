<template>
  <div class="pb-20">
    <!-- Fausse barre de recherche -->
    <div class="mb-6 relative">
      <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-gray-400" />
      </div>
      <input 
        type="text" 
        placeholder="Rechercher une recette scannée..." 
        class="w-full bg-white dark:bg-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm shadow-sm border-none focus:ring-2 focus:ring-primary-500 outline-none" 
        disabled 
      />
    </div>

    <!-- Bannière promotionnelle / Info -->
    <div class="bg-[#FFF8DD] dark:bg-[#332A00] rounded-[24px] p-6 mb-8 relative overflow-hidden">
      <div class="relative z-10 w-2/3">
        <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 tracking-wider uppercase">OCR intelligent</p>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          Générez votre<br>liste en 1 clic
        </h2>
        <UButton 
          color="white" 
          size="sm" 
          class="rounded-full px-6 font-semibold text-xs text-gray-900"
        >
          En savoir plus
        </UButton>
      </div>
      <!-- Éléments décoratifs -->
      <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-[#FFDF8D] dark:bg-[#665400] rounded-full opacity-50"></div>
      <div class="absolute right-4 top-4 text-4xl">📸</div>
    </div>
    
    <!-- Section Scanner -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">Nouvelle recette</h3>
    </div>

    <!-- État : Upload -->
    <div v-if="!scanResult" class="bg-white dark:bg-gray-800 rounded-[24px] p-8 text-center shadow-sm relative overflow-hidden border border-gray-100 dark:border-gray-800">
      <div class="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
        <UIcon name="i-heroicons-camera" class="w-8 h-8 text-primary-500" />
      </div>
      <h2 class="text-lg font-bold mb-2 text-gray-900 dark:text-white">Scanner une liste</h2>
      <p class="text-sm text-gray-500 mb-6">
        Uploadez la photo des ingrédients d'une de vos fiches HelloFresh.
      </p>
      
      <!-- Inputs cachés -->
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        class="hidden" 
        ref="cameraInput" 
        @change="onFileSelected"
      />
      <input 
        type="file" 
        accept="image/*" 
        class="hidden" 
        ref="galleryInput" 
        @change="onFileSelected"
      />
      
      <!-- Boutons visibles -->
      <div class="flex flex-col gap-3">
        <UButton 
          size="lg" 
          color="primary" 
          icon="i-heroicons-camera"
          class="w-full justify-center rounded-2xl py-3.5 font-semibold text-base shadow-lg shadow-primary-500/30"
          :loading="isLoading"
          @click="cameraInput?.click()"
        >
          Prendre une photo
        </UButton>
        
        <UButton 
          size="lg" 
          color="neutral" 
          variant="soft"
          icon="i-heroicons-photo"
          class="w-full justify-center rounded-2xl py-3.5 font-semibold text-base"
          :loading="isLoading"
          @click="galleryInput?.click()"
        >
          Parcourir la galerie
        </UButton>
      </div>
    </div>

    <!-- État : Résultat de l'OCR -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div class="space-y-5 mb-6">
        <!-- Nom -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom de la recette</label>
          <UInput v-model="scanResult.title" size="lg" class="font-semibold text-lg" variant="none" padded />
        </div>

        <div class="flex gap-4">
          <!-- Personnes -->
          <div class="flex-1">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Personnes</label>
            <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-1 w-max border border-gray-100 dark:border-gray-800">
              <UButton color="neutral" variant="ghost" icon="i-heroicons-minus" @click="updateServings(-1)" :disabled="scanResult.servings <= 1" />
              <span class="font-bold text-base w-6 text-center">{{ scanResult.servings }}</span>
              <UButton color="neutral" variant="ghost" icon="i-heroicons-plus" @click="updateServings(1)" />
            </div>
          </div>
          
          <!-- Temps -->
          <div class="flex-1">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Temps estimé</label>
            <UInput v-model="scanResult.prep_time" placeholder="ex: 30 min" size="xl" icon="i-heroicons-clock" class="bg-gray-50 dark:bg-gray-900 rounded-xl" variant="none" />
          </div>
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Catégories</label>
          <div class="flex flex-wrap gap-2">
            <UBadge 
              v-for="(tag, index) in scanResult.tags" 
              :key="index" 
              color="primary" 
              variant="soft" 
              class="capitalize text-xs font-bold px-3 py-1 rounded-lg"
            >
              {{ tag }}
            </UBadge>
            <span v-if="!scanResult.tags || scanResult.tags.length === 0" class="text-sm text-gray-400 italic">Aucune catégorie détectée</span>
          </div>
        </div>
      </div>
      
      <div class="border-t border-gray-100 dark:border-gray-800 pt-6 mb-6">
        <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 text-primary-500" />
          Ingrédients
        </h4>
        <div class="space-y-0">
          <div 
            v-for="(ingredient, index) in scanResult.ingredients" 
            :key="index" 
            class="flex justify-between items-center py-4 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-lg border border-gray-100 dark:border-gray-800">
                {{ getIngredientEmoji(ingredient.name) }}
              </div>
              <span class="font-medium text-gray-900 dark:text-white capitalize text-[15px]">{{ ingredient.name }}</span>
            </div>
            <span class="text-sm font-bold text-gray-500 dark:text-gray-400">
              {{ ingredient.quantity }} {{ ingredient.unit || '' }}
            </span>
          </div>
        </div>
      </div>

      <div class="space-y-3 mt-8">
        <UButton 
          size="lg"
          class="w-full justify-center rounded-2xl py-3.5 font-semibold text-base shadow-lg shadow-primary-500/30"
          color="primary" 
          :loading="isSaving"
          @click="saveRecipe"
        >
          Enregistrer la recette
        </UButton>
        <UButton 
          size="lg"
          class="w-full justify-center rounded-2xl py-3.5 font-semibold text-base text-gray-500 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
          color="gray" 
          variant="ghost" 
          @click="resetScan" 
          :disabled="isSaving"
        >
          Annuler
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const cameraInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const scanResult = ref<any>(null)
const originalScanResult = ref<any>(null)

function updateServings(delta: number) {
  if (!scanResult.value || !originalScanResult.value) return
  
  const newServings = Math.max(1, scanResult.value.servings + delta)
  scanResult.value.servings = newServings
  
  const ratio = newServings / originalScanResult.value.servings
  
  scanResult.value.ingredients.forEach((ing: any, idx: number) => {
    const origQuant = originalScanResult.value.ingredients[idx]?.quantity
    if (origQuant != null) {
      // Arrondir à 2 décimales si nécessaire pour éviter les nombres infinis
      ing.quantity = parseFloat((origQuant * ratio).toFixed(2))
    }
  })
}

// Fonction de compression d'image dans le navigateur (réduit les tokens et accélère l'upload)
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = event => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1024
        const MAX_HEIGHT = 1024
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Export en JPEG qualité 80%
        canvas.toBlob(blob => {
          if (blob) resolve(blob)
          else reject(new Error('Erreur de compression'))
        }, 'image/jpeg', 0.8)
      }
      img.onerror = error => reject(error)
    }
    reader.onerror = error => reject(error)
  })
}

async function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  
  const file = target.files[0]
  isLoading.value = true
  
  try {
    // Compression avant l'envoi
    const compressedBlob = await compressImage(file)
    
    const formData = new FormData()
    formData.append('image', compressedBlob, 'image.jpg')
    
    const data = await $fetch('/api/scan-recipe', {
      method: 'POST',
      body: formData
    })
    
    // On copie le résultat pour pouvoir calculer les proportions plus tard
    scanResult.value = JSON.parse(JSON.stringify(data))
    originalScanResult.value = JSON.parse(JSON.stringify(data))
    
    // Initialiser les tags si l'IA ne l'a pas fait
    if (!scanResult.value.tags) scanResult.value.tags = []
  } catch (error) {
    console.error('Erreur lors du scan:', error)
    const toast = useToast()
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de l\'analyse de l\'image.',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
  } finally {
    isLoading.value = false
    if (cameraInput.value) cameraInput.value.value = ''
    if (galleryInput.value) galleryInput.value.value = ''
  }
}

async function saveRecipe() {
  if (!scanResult.value) return
  
  isSaving.value = true
  
  try {
    await $fetch('/api/save-recipe', {
      method: 'POST',
      body: {
        title: scanResult.value.title,
        servings: scanResult.value.servings,
        prep_time: scanResult.value.prep_time,
        tags: scanResult.value.tags,
        ingredients: scanResult.value.ingredients
      }
    })
    
    const toast = useToast()
    toast.add({
      title: 'Recette sauvegardée !',
      description: 'Retrouvez-la dans l\'onglet "Mes Recettes".',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
    
    resetScan()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    alert('Une erreur est survenue lors de la sauvegarde.')
  } finally {
    isSaving.value = false
  }
}

function resetScan() {
  scanResult.value = null
  originalScanResult.value = null
}
</script>
