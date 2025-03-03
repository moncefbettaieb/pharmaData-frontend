import { defineStore } from 'pinia'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  type User,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore'

interface UserRegistration {
  email: string
  password: string
  displayName: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    error: null as string | null,
    verificationId: null as string | null
  }),

  actions: {
    async createUserDocument(user: User) {
      const { $db } = useNuxtApp()
      if (!$db) {
        console.error('Firestore n\'est pas initialisé')
        return
      }

      try {
        const userRef = doc($db, 'users', user.uid)
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        }, { merge: true })
      } catch (error) {
        console.error('Erreur lors de la création du document utilisateur:', error)
        throw error
      }
    },

    async register({ email, password, displayName }: UserRegistration) {
      this.loading = true
      this.error = null
      try {
        const { $auth } = useNuxtApp()
        if (!$auth) {
          throw new Error('Firebase authentication is not initialized')
        }
        const userCredential = await createUserWithEmailAndPassword($auth, email, password)
        await updateProfile(userCredential.user, { displayName })
        await this.createUserDocument(userCredential.user)
        this.user = userCredential.user
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      try {
        const { $auth } = useNuxtApp()
        if (!$auth) {
          throw new Error('Firebase authentication is not initialized')
        }
        const userCredential = await signInWithEmailAndPassword($auth, email, password)
        await this.createUserDocument(userCredential.user)
        this.user = userCredential.user
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loginWithGoogle() {
      this.loading = true
      this.error = null
      try {
        const { $auth } = useNuxtApp()
        if (!$auth) {
          throw new Error('Firebase authentication is not initialized')
        }
        const provider = new GoogleAuthProvider()
        const userCredential = await signInWithPopup($auth, provider)
        await this.createUserDocument(userCredential.user)
        this.user = userCredential.user
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.loading = false
      }
    },

    async sendPhoneVerification(phoneNumber: string) {
      this.loading = true
      this.error = null
      try {
        const { $auth } = useNuxtApp()
        if (!$auth) {
          throw new Error('Firebase authentication is not initialized')
        }
        const provider = new PhoneAuthProvider($auth)
        const verificationId = await signInWithPhoneNumber($auth, phoneNumber)
        this.verificationId = verificationId.verificationId
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.loading = false
      }
    },

    async verifyPhoneCode(code: string) {
      if (!this.verificationId) {
        throw new Error('Aucun code de vérification envoyé')
      }

      this.loading = true
      this.error = null
      try {
        const { $auth } = useNuxtApp()
        if (!$auth) {
          throw new Error('Firebase authentication is not initialized')
        }
        const credential = PhoneAuthProvider.credential(this.verificationId, code)
        const userCredential = await signInWithPhoneNumber($auth, credential)
        await this.createUserDocument(userCredential.user)
        this.user = userCredential.user
        this.verificationId = null
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code)
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const { $auth } = useNuxtApp()
      if ($auth) {
        await signOut($auth)
      }
      this.user = null
    },

    getErrorMessage(code: string): string {
      switch (code) {
        case 'auth/email-already-in-use':
          return 'Cette adresse email est déjà utilisée'
        case 'auth/invalid-email':
          return 'Adresse email invalide'
        case 'auth/operation-not-allowed':
          return 'Opération non autorisée'
        case 'auth/weak-password':
          return 'Le mot de passe est trop faible'
        case 'auth/user-disabled':
          return 'Ce compte a été désactivé'
        case 'auth/user-not-found':
          return 'Aucun compte ne correspond à cette adresse email'
        case 'auth/wrong-password':
          return 'Mot de passe incorrect'
        case 'auth/invalid-verification-code':
          return 'Code de vérification invalide'
        case 'auth/invalid-phone-number':
          return 'Numéro de téléphone invalide'
        case 'auth/popup-closed-by-user':
          return 'La fenêtre de connexion a été fermée'
        case 'auth/invalid-api-key':
          return 'Configuration Firebase manquante ou invalide'
        default:
          return 'Une erreur est survenue'
      }
    }
  }
})