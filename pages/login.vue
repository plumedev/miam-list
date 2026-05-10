<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12">
    <UCard class="w-full max-w-sm" :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div v-if="isSuccess" class="text-center pt-4">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto flex items-center justify-center mb-4">
            <UIcon name="i-heroicons-envelope-open" class="w-8 h-8 text-green-500" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Vérifiez vos emails</h2>
        </div>
        <div v-else class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ isLogin ? 'Connexion' : 'Créer un compte' }}</h2>
          <p class="text-sm text-gray-500 mt-2">Accédez à votre carnet de recettes</p>
        </div>
      </template>

      <!-- Écran de succès après inscription -->
      <div v-if="isSuccess" class="text-center space-y-6 py-4">
        <p class="text-gray-600 dark:text-gray-400">
          Nous venons de vous envoyer un email à <span class="font-bold text-gray-900 dark:text-white">{{ email }}</span>.
        </p>
        <p class="text-sm text-gray-500">
          Veuillez cliquer sur le lien qu'il contient pour activer votre compte.
        </p>
        <UButton color="neutral" variant="soft" class="w-full justify-center mt-6" @click="resetToLogin">
          Retour à la connexion
        </UButton>
      </div>

      <!-- Formulaire -->
      <form v-else @submit.prevent="authenticate" class="flex flex-col gap-5 w-full">
        <UFormGroup v-if="!isLogin" label="Nom ou Pseudo" class="w-full">
          <UInput v-model="name" type="text" size="lg" icon="i-heroicons-user" placeholder="Votre nom" required class="w-full" />
        </UFormGroup>

        <UFormGroup label="Adresse email" class="w-full">
          <UInput v-model="email" type="email" size="lg" icon="i-heroicons-envelope" placeholder="vous@email.com" required class="w-full" />
        </UFormGroup>
        
        <UFormGroup label="Mot de passe" class="w-full">
          <UInput v-model="password" type="password" size="lg" icon="i-heroicons-lock-closed" placeholder="••••••••" required class="w-full" />
        </UFormGroup>

        <UButton type="submit" size="lg" color="primary" class="w-full justify-center mt-2" :loading="isLoading">
          {{ isLogin ? 'Se connecter' : 'S\'inscrire' }}
        </UButton>
      </form>

      <template #footer v-if="!isSuccess">
        <div class="text-center text-sm text-gray-500">
          <p v-if="isLogin">
            Pas encore de compte ? 
            <a href="#" @click.prevent="isLogin = false" class="text-primary-500 font-medium hover:underline">S'inscrire</a>
          </p>
          <p v-else>
            Déjà un compte ? 
            <a href="#" @click.prevent="isLogin = true" class="text-primary-500 font-medium hover:underline">Se connecter</a>
          </p>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const toast = useToast()
const isLogin = ref(true)
const isSuccess = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)

function resetToLogin() {
  isSuccess.value = false
  isLogin.value = true
  password.value = ''
  name.value = ''
}

// Redirection automatique si déjà connecté
watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

async function authenticate() {
  isLoading.value = true
  try {
    if (isLogin.value) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
    } else {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            full_name: name.value
          }
        }
      })
      if (error) throw error
      isSuccess.value = true
    }
  } catch (error: any) {
    toast.add({ title: 'Erreur', description: error.message, color: 'red' })
  } finally {
    isLoading.value = false
  }
}
</script>
