<template>
  <div class="pb-24">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Profil</h1>
    </div>

    <!-- Info User -->
    <UCard v-if="user" class="mb-6 rounded-[24px]" :ui="{ ring: 'ring-1 ring-gray-100 dark:ring-gray-800' }">
      <div class="flex flex-col gap-4">
        <div>
          <p class="text-sm text-gray-500 font-medium mb-1">Connecté en tant que</p>
          <p class="font-bold text-lg text-gray-900 dark:text-white">{{ user.user_metadata?.full_name || user.email }}</p>
          <p v-if="user.user_metadata?.full_name" class="text-sm text-gray-500">{{ user.email }}</p>
        </div>
        <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-right-on-rectangle" @click="logout" class="justify-center rounded-xl py-3 mt-2">
          Se déconnecter
        </UButton>
      </div>
    </UCard>

    <!-- Zone de danger -->
    <UCard class="rounded-[24px] bg-red-50 dark:bg-red-950/20" :ui="{ ring: 'ring-1 ring-red-100 dark:ring-red-900/50' }">
      <div class="flex items-center gap-2 mb-2">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600 dark:text-red-400" />
        <h3 class="font-bold text-red-600 dark:text-red-400 text-lg">Zone de danger</h3>
      </div>
      <p class="text-sm text-red-800 dark:text-red-200 mb-5 opacity-80">
        La suppression de votre compte est définitive. Toutes vos recettes et votre liste de courses seront effacées.
      </p>
      <UButton color="red" variant="solid" class="w-full justify-center rounded-xl py-3" @click="isDeleteModalOpen = true">
        Supprimer mon compte
      </UButton>
    </UCard>

    <!-- Modal de confirmation de suppression -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white dark:bg-gray-900 rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-800">
        <div class="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 class="font-bold text-lg text-gray-900 dark:text-white">Supprimer le compte</h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" class="-my-1" @click="isDeleteModalOpen = false" />
        </div>
        <div class="p-5">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Cette action est irréversible. Êtes-vous absolument sûr de vouloir nous quitter ?
          </p>
        </div>
        <div class="flex justify-end gap-3 p-5 bg-gray-50 dark:bg-gray-800/50">
          <UButton color="neutral" variant="soft" @click="isDeleteModalOpen = false">Annuler</UButton>
          <UButton color="red" :loading="isDeleting" @click="deleteAccount">Oui, supprimer</UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()
const toast = useToast()

const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

async function logout() {
  await supabase.auth.signOut()
  router.push('/login')
}

async function deleteAccount() {
  isDeleting.value = true
  try {
    await $fetch('/api/delete-account', {
      method: 'POST'
    })
    
    // Déconnexion locale
    await supabase.auth.signOut()
    
    toast.add({ title: 'Compte supprimé', description: 'Vos données ont été effacées.', color: 'success' })
    router.push('/login')
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Erreur', description: 'Impossible de supprimer le compte.', color: 'red' })
  } finally {
    isDeleting.value = false
    isDeleteModalOpen.value = false
  }
}
</script>
