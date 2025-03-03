import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

// Initialiser Firebase Admin sans paramètres explicites
// Cela utilisera automatiquement les credentials par défaut
admin.initializeApp()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Map des IDs de plans vers les IDs de prix Stripe
const PRICE_MAP: { [key: string]: string } = {
  'basic': 'prod_RibDkVUBfzGxfO',
  'pro': 'prod_RibEg7kJdwI522',
  'enterprise': 'prod_RibFR1RqX7xiXk'
}

export const createSubscription = onCall({
  region: 'europe-west9',
  cors: [
    'https://pharmadata-frontend-staging-383194447870.europe-west9.run.app',
    'http://localhost:3000',
    '*' // Autoriser toutes les origines pendant le développement
  ],
  maxInstances: 10,
  memory: '256MiB'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { priceId, successUrl, cancelUrl } = request.data
  
  if (!priceId || !successUrl || !cancelUrl) {
    throw new HttpsError('invalid-argument', 'Paramètres manquants')
  }
  
  try {
    const stripePriceId = PRICE_MAP[priceId]
    if (!stripePriceId) {
      throw new HttpsError('invalid-argument', 'Plan invalide')
    }
    
    // Utiliser admin.firestore() directement
    const db = admin.firestore()
    
    // Créer ou récupérer le client Stripe
    let customer
    const userRef = db.collection('users').doc(request.auth.uid)
    const userDoc = await userRef.get()
    
    if (!userDoc.exists) {
      // Créer le document utilisateur s'il n'existe pas
      await userRef.set({
        email: request.auth.token.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
    }
    
    const userData = userDoc.data() || {}

    if (userData.stripeCustomerId) {
      customer = await stripe.customers.retrieve(userData.stripeCustomerId)
    } else {
      customer = await stripe.customers.create({
        email: request.auth.token.email,
        metadata: {
          firebaseUID: request.auth.uid
        }
      })
      
      // Sauvegarder l'ID du client Stripe
      await userRef.update({
        stripeCustomerId: customer.id
      })
    }

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: stripePriceId,
        quantity: 1
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        firebaseUID: request.auth.uid,
        priceId
      }
    })

    return { sessionId: session.id }
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error)
    throw new HttpsError('internal', 'Erreur lors de la création de la session de paiement', error)
  }
})