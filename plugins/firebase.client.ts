import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // Only initialize Firebase if we have the required config
  if (!config.public.firebaseConfig.apiKey) {
    console.warn('Firebase configuration is missing. Authentication features will not work.')
    return {
      provide: {
        firebase: null,
        auth: null,
        db: null
      }
    }
  }

  try {
    const app = initializeApp(config.public.firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    
    return {
      provide: {
        firebase: app,
        auth,
        db
      }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    return {
      provide: {
        firebase: null,
        auth: null,
        db: null
      }
    }
  }
})