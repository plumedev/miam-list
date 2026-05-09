<template>
  <div class="pb-24">
    <!-- Header -->
    <div class="flex items-center mb-6">
      <UButton color="neutral" variant="ghost" icon="i-heroicons-chevron-left" class="mr-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm" to="/" />
      <h1 class="text-lg font-bold text-primary-500">View Cart</h1>
      <div class="ml-auto flex gap-2">
        <UButton 
          color="red" 
          variant="ghost" 
          icon="i-heroicons-trash" 
          @click="clearList" 
          :loading="isClearing" 
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm text-red-500" 
        />
        <UButton 
          color="neutral" 
          variant="ghost" 
          icon="i-heroicons-arrow-path" 
          @click="() => refresh()" 
          :loading="pending" 
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm" 
        />
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 text-red-500 p-4 rounded-2xl text-sm mb-4">
      Erreur de chargement.
    </div>

    <!-- Loading -->
    <div v-else-if="pending" class="space-y-4">
      <USkeleton class="h-20 w-full rounded-[20px]" />
      <USkeleton class="h-20 w-full rounded-[20px]" />
      <USkeleton class="h-20 w-full rounded-[20px]" />
    </div>

    <!-- Empty -->
    <div v-else-if="!shoppingList || shoppingList.length === 0" class="text-center py-16">
      <div class="w-24 h-24 bg-white dark:bg-gray-800 rounded-[24px] mx-auto flex items-center justify-center shadow-sm mb-4">
        <UIcon name="i-heroicons-shopping-bag" class="w-10 h-10 text-gray-300" />
      </div>
      <h3 class="font-bold text-lg mb-1 text-gray-900 dark:text-white">Panier vide</h3>
      <p class="text-gray-500 text-sm mb-6">Ajoutez des recettes pour remplir votre liste.</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-0 bg-[#F9F9F9] dark:bg-gray-950">
      <div 
        v-for="(item, index) in shoppingList" 
        :key="index" 
        class="flex items-center gap-4 py-4 border-b border-dashed border-gray-200 dark:border-gray-800 last:border-0"
      >
        <!-- Thumbnail -->
        <div class="w-[60px] h-[60px] bg-white dark:bg-gray-800 rounded-[18px] flex-shrink-0 flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          🛒
        </div>
        
        <!-- Info -->
        <div class="flex-grow">
          <h3 class="font-bold text-gray-900 dark:text-white text-[16px] capitalize mb-1">{{ item.name }}</h3>
          <p class="text-xs text-gray-400 font-medium">HelloFresh</p>
        </div>

        <!-- Quantity / Date -->
        <div class="text-right flex flex-col justify-between h-[42px]">
          <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Quantité</p>
          <p class="font-bold text-[15px] text-gray-900 dark:text-white">
            <span v-if="item.quantity > 0">{{ item.quantity }}</span>
            <span v-else>-</span>
            <span class="ml-1 text-sm font-semibold">{{ item.unit }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Summary Box -->
    <div v-if="shoppingList && shoppingList.length > 0" class="mt-8 bg-[#EAF5E5] dark:bg-primary-950 rounded-[32px] p-6 shadow-sm">
      <div class="flex justify-between items-center mb-3 text-sm text-gray-700 dark:text-gray-300">
        <span class="font-medium">Total articles</span>
        <span class="font-bold text-gray-900 dark:text-white">{{ shoppingList.length }}</span>
      </div>
      <div class="flex justify-between items-center mb-5 text-sm text-gray-700 dark:text-gray-300">
        <span class="font-medium">Frais d'organisation</span>
        <span class="font-bold text-gray-900 dark:text-white">Gratuit</span>
      </div>
      
      <div class="border-t border-dashed border-primary-200 dark:border-primary-800 pt-5 mb-6 flex justify-between items-center">
        <span class="font-bold text-gray-900 dark:text-white text-lg">À acheter</span>
        <span class="font-bold text-red-500 text-lg">{{ shoppingList.length }} items</span>
      </div>

      <UButton 
        size="xl" 
        color="primary" 
        class="w-full justify-center rounded-2xl py-4 font-semibold text-base shadow-lg shadow-primary-500/30"
      >
        Continuer
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const toast = useToast()

const { data: shoppingList, pending, error, refresh } = await useFetch<any[]>('/api/shopping-list')
const isClearing = ref(false)

async function clearList() {
  const confirmDelete = confirm("Voulez-vous vraiment vider votre liste de courses ? Toutes les recettes scannées seront oubliées.")
  if (!confirmDelete) return

  isClearing.value = true
  try {
    await $fetch('/api/shopping-list', {
      method: 'DELETE'
    })
    
    // Rafraichir les données pour afficher le panier vide
    await refresh()
    
    toast.add({
      title: 'Liste vidée',
      description: 'Votre panier est maintenant vide.',
      color: 'success',
      icon: 'i-heroicons-trash'
    })
  } catch (err) {
    console.error('Erreur:', err)
    toast.add({
      title: 'Erreur',
      description: 'Impossible de vider la liste.',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  } finally {
    isClearing.value = false
  }
}
</script>
