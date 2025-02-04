import { defineStore } from 'pinia'
import { loadStripe } from '@stripe/stripe-js'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    loading: false,
    error: null as string | null
  }),

  actions: {
    async createCheckoutSession(items: { productId: string; quantity: number }[]) {
      this.loading = true
      this.error = null
      
      try {
        const config = useRuntimeConfig()
        const response = await fetch(`${config.public.apiBaseUrl}/api/v1/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useAuthStore().user?.accessToken}`
          },
          body: JSON.stringify({ items })
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la création de la session de paiement')
        }

        const { sessionId } = await response.json()
        
        const stripe = await loadStripe(config.public.stripePublicKey)
        if (!stripe) {
          throw new Error('Erreur lors du chargement de Stripe')
        }

        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          throw error
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveOrder(sessionId: string, amount: number) {
      const { $firebase } = useNuxtApp()
      const db = getFirestore($firebase)
      const authStore = useAuthStore()

      try {
        await addDoc(collection(db, 'orders'), {
          userId: authStore.user?.uid,
          stripeSessionId: sessionId,
          amount,
          status: 'completed',
          createdAt: new Date()
        })
      } catch (error: any) {
        console.error('Erreur lors de l\'enregistrement de la commande:', error)
        throw error
      }
    }
  }
})