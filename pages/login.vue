<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        {{ isLogin ? 'Connexion à votre compte' : 'Créer un compte' }}
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Boutons de connexion sociale -->
        <div class="space-y-4">
          <button
            @click="handleGoogleLogin"
            :disabled="authStore.loading"
            class="w-full flex justify-center items-center gap-3 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
            Continuer avec Google
          </button>
        </div>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>
        </div>

        <!-- Formulaire principal -->
        <form class="mt-6 space-y-6" @submit.prevent="handleSubmit">
          <template v-if="!isPhoneLogin">
            <div v-if="!isLogin">
              <label for="name" class="block text-sm font-medium text-gray-700">Nom</label>
              <div class="mt-1">
                <input
                  id="name"
                  v-model="displayName"
                  name="name"
                  type="text"
                  required
                  class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <div class="mt-1">
                <input
                  id="email"
                  v-model="email"
                  name="email"
                  type="email"
                  required
                  class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
              <div class="mt-1">
                <input
                  id="password"
                  v-model="password"
                  name="password"
                  type="password"
                  required
                  class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </template>

          <template v-else>
            <div v-if="!authStore.verificationId">
              <label for="phone" class="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
              <div class="mt-1">
                <input
                  id="phone"
                  v-model="phoneNumber"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+33612345678"
                  class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div v-else>
              <label for="code" class="block text-sm font-medium text-gray-700">Code de vérification</label>
              <div class="mt-1">
                <input
                  id="code"
                  v-model="verificationCode"
                  name="code"
                  type="text"
                  required
                  maxlength="6"
                  class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </template>

          <div v-if="authStore.error" class="text-red-600 text-sm">
            {{ authStore.error }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.loading"
              class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <template v-if="!isPhoneLogin">
                {{ isLogin ? 'Se connecter' : "S'inscrire" }}
              </template>
              <template v-else>
                {{ authStore.verificationId ? 'Vérifier le code' : 'Envoyer le code' }}
              </template>
            </button>
          </div>
        </form>

        <div class="mt-6 flex flex-col space-y-4">
          <button
            @click="togglePhoneLogin"
            class="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {{ isPhoneLogin ? 'Utiliser email et mot de passe' : 'Se connecter avec un numéro de téléphone' }}
          </button>

          <button
            v-if="!isPhoneLogin"
            @click="isLogin = !isLogin"
            class="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {{ isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const isLogin = ref(true)
const isPhoneLogin = ref(false)
const email = ref('')
const password = ref('')
const displayName = ref('')
const phoneNumber = ref('')
const verificationCode = ref('')

const handleSubmit = async () => {
  try {
    if (isPhoneLogin.value) {
      if (authStore.verificationId) {
        await authStore.verifyPhoneCode(verificationCode.value)
        toast.success('Connexion réussie')
        router.push('/')
      } else {
        await authStore.sendPhoneVerification(phoneNumber.value)
        toast.success('Code de vérification envoyé')
      }
    } else if (isLogin.value) {
      await authStore.login(email.value, password.value)
      toast.success('Connexion réussie')
      router.push('/')
    } else {
      await authStore.register({
        email: email.value,
        password: password.value,
        displayName: displayName.value
      })
      toast.success('Inscription réussie')
      router.push('/')
    }
  } catch (error) {
    toast.error(authStore.error || "Une erreur s'est produite")
  }
}

const handleGoogleLogin = async () => {
  try {
    await authStore.loginWithGoogle()
    toast.success('Connexion réussie')
    router.push('/')
  } catch (error) {
    toast.error(authStore.error || "Une erreur s'est produite")
  }
}

const togglePhoneLogin = () => {
  isPhoneLogin.value = !isPhoneLogin.value
  authStore.verificationId = null
  phoneNumber.value = ''
  verificationCode.value = ''
}
</script>