<template>
  <div class="pb-24">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Mes Recettes</h1>
      <UButton color="neutral" variant="ghost" icon="i-heroicons-arrow-path" @click="() => refresh()" :loading="pending" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm" />
    </div>
    
    <p class="text-sm text-gray-500 mb-6">Sélectionnez les recettes que vous souhaitez ajouter à votre liste de courses.</p>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-32 w-full rounded-[24px]" />
      <USkeleton class="h-32 w-full rounded-[24px]" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 text-red-500 p-4 rounded-2xl text-sm mb-4">
      Erreur de chargement des recettes.
    </div>

    <!-- Empty -->
    <div v-else-if="!recipes || recipes.length === 0" class="text-center py-16 bg-white dark:bg-gray-800 rounded-[24px] shadow-sm">
      <div class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full mx-auto flex items-center justify-center mb-4">
        <UIcon name="i-heroicons-book-open" class="w-8 h-8 text-gray-300" />
      </div>
      <h3 class="font-bold text-lg mb-1">Aucune recette</h3>
      <p class="text-gray-500 text-sm mb-6">Scannez des fiches pour remplir votre carnet.</p>
      <UButton to="/" color="primary" variant="soft" class="rounded-xl font-semibold">Scanner maintenant</UButton>
    </div>

    <!-- List -->
    <div v-else class="space-y-4">
      <div 
        v-for="recipe in recipes" 
        :key="recipe.id" 
        class="bg-white dark:bg-gray-800 rounded-[24px] p-5 shadow-sm border border-gray-100 dark:border-gray-800 relative transition-all"
        :class="{'ring-2 ring-primary-500': recipe.in_shopping_list}"
      >
        <div class="flex justify-between items-start mb-3">
          <div class="pr-12">
            <h3 class="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-2">{{ recipe.title }}</h3>
            <div class="flex items-center gap-3 text-sm text-gray-500 font-medium">
              <div class="flex items-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 px-1">
                <UButton color="neutral" variant="ghost" icon="i-heroicons-minus" size="2xs" @click="updateServings(recipe, -1)" :disabled="recipe.servings <= 1 || recipe.isUpdatingServings" />
                <span class="w-5 text-center font-bold text-[13px]">{{ recipe.servings }}</span>
                <UButton color="neutral" variant="ghost" icon="i-heroicons-plus" size="2xs" @click="updateServings(recipe, 1)" :disabled="recipe.isUpdatingServings" />
              </div>
              <span v-if="recipe.prep_time" class="flex items-center gap-1"><UIcon name="i-heroicons-clock" class="w-4 h-4" /> {{ recipe.prep_time }}</span>
            </div>
          </div>
          
          <div class="absolute top-4 right-4 flex flex-col gap-2 items-center">
            <UCheckbox 
              v-model="recipe.in_shopping_list" 
              color="primary" 
              :ui="{ base: 'w-6 h-6', rounded: 'rounded-full' }"
              @change="toggleList(recipe)"
            />
            <UButton 
              icon="i-heroicons-trash" 
              color="red" 
              variant="ghost" 
              size="sm" 
              class="rounded-full mt-2" 
              @click="deleteRecipe(recipe.id)"
            />
          </div>
        </div>
        
        <div class="flex flex-wrap gap-1.5 mt-3" v-if="recipe.tags && recipe.tags.length > 0">
          <UBadge 
            v-for="tag in recipe.tags" 
            :key="tag" 
            color="neutral" 
            variant="soft" 
            class="text-[10px] uppercase font-bold"
          >
            {{ tag }}
          </UBadge>
        </div>
      </div>
    </div>
    
    <!-- Float Action Button to go to list if items selected -->
    <div v-if="selectedCount > 0" class="fixed bottom-[80px] left-0 right-0 px-4 max-w-md mx-auto z-40 transition-all">
      <UButton 
        to="/shopping-list"
        size="xl" 
        color="primary" 
        class="w-full justify-center rounded-2xl py-4 font-bold text-base shadow-lg shadow-primary-500/40"
      >
        Générer la liste ({{ selectedCount }})
      </UButton>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white dark:bg-gray-900 rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-800">
        <div class="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 class="font-bold text-lg text-gray-900 dark:text-white">Supprimer la recette</h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" class="-my-1" @click="isDeleteModalOpen = false" />
        </div>
        
        <div class="p-5">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Voulez-vous vraiment supprimer définitivement cette recette et ses ingrédients de votre carnet ? Cette action est irréversible.
          </p>
        </div>
        
        <div class="flex justify-end gap-3 p-5 bg-gray-50 dark:bg-gray-800/50">
          <UButton color="neutral" variant="soft" @click="isDeleteModalOpen = false">Annuler</UButton>
          <UButton color="red" :loading="isDeleting" @click="executeDelete">Supprimer</UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const toast = useToast()

const { data: recipes, pending, error, refresh } = await useFetch<any[]>('/api/recipes')

const selectedCount = computed(() => {
  if (!recipes.value) return 0
  return recipes.value.filter(r => r.in_shopping_list).length
})

async function toggleList(recipe: any) {
  try {
    await $fetch('/api/toggle-recipe', {
      method: 'POST',
      body: { id: recipe.id, in_shopping_list: recipe.in_shopping_list }
    })
  } catch (err) {
    console.error(err)
    // Revert visually on error
    recipe.in_shopping_list = !recipe.in_shopping_list
    toast.add({ title: 'Erreur', description: 'Impossible de mettre à jour la recette', color: 'error' })
  }
}

const isDeleteModalOpen = ref(false)
const recipeToDelete = ref<string | null>(null)
const isDeleting = ref(false)

function deleteRecipe(id: string) {
  recipeToDelete.value = id
  isDeleteModalOpen.value = true
}

async function executeDelete() {
  if (!recipeToDelete.value) return

  isDeleting.value = true
  try {
    await $fetch(`/api/recipe?id=${recipeToDelete.value}`, {
      method: 'DELETE'
    })
    
    toast.add({ title: 'Recette supprimée', color: 'success', icon: 'i-heroicons-trash' })
    refresh()
  } catch (err) {
    console.error(err)
    toast.add({ title: 'Erreur', description: 'Impossible de supprimer la recette', color: 'red' })
  } finally {
    isDeleting.value = false
    isDeleteModalOpen.value = false
    recipeToDelete.value = null
  }
}
async function updateServings(recipe: any, delta: number) {
  const newServings = recipe.servings + delta
  if (newServings < 1) return

  recipe.isUpdatingServings = true
  
  try {
    await $fetch('/api/update-servings', {
      method: 'POST',
      body: { recipeId: recipe.id, newServings }
    })
    
    // Mise à jour locale
    recipe.servings = newServings
    toast.add({ title: 'Quantités adaptées', description: `Ingrédients recalculés pour ${newServings} pers.`, color: 'success' })
  } catch (err) {
    console.error(err)
    toast.add({ title: 'Erreur', description: 'Impossible de modifier les portions', color: 'error' })
  } finally {
    recipe.isUpdatingServings = false
  }
}
</script>
