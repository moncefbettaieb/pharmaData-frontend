import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  
  // Only initialize Firebase if we have the required config
  if (!config.public.firebaseConfig.apiKey) {
    console.warn('Firebase configuration is missing. Authentication features will not work.')
    return {
      provide: {
        firebase: null,
        auth: null,
        db: null,
        functions: null
      }
    }
  }

  try {
    const app = initializeApp(config.public.firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    const functions = getFunctions(app, 'europe-west9')

    // En développement, connecter à l'émulateur si nécessaire
    if (process.dev) {
      connectFunctionsEmulator(functions, 'localhost', 5001)
    }
    
    // Écouter les changements d'état d'authentification
    onAuthStateChanged(auth, (user) => {
      authStore.user = user
    })
    
    return {
      provide: {
        firebase: app,
        auth,
        db,
        functions
      }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    return {
      provide: {
        firebase: null,
        auth: null,
        db: null,
        functions: null
      }
    }
  }
})