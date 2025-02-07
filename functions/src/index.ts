import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

// Initialiser Firebase Admin avec les permissions explicites
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
})

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Map des IDs de plans vers les IDs de prix Stripe
const PRICE_MAP: { [key: string]: string } = {
  'basic': 'prod_RibDkVUBfzGxfO', // Remplacez par vos vrais IDs de prix Stripe
  'pro': 'prod_RibEg7kJdwI522',
  'enterprise': 'prod_RibFR1RqX7xiXk'
}

export const createSubscription = onCall({
  region: 'europe-west9',
  cors: [
    'https://pharmadata-frontend-staging-383194447870.europe-west9.run.app',
    'http://localhost:3000'
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

    const db = admin.firestore()
    
    // Créer ou récupérer le client Stripe
    let customer
    const userRef = db.collection('users').doc(request.auth.uid)
    const userDoc = await userRef.get()
    const userData = userDoc.data()

    if (userData?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(userData.stripeCustomerId)
    } else {
      customer = await stripe.customers.create({
        email: request.auth.token.email,
        metadata: {
          firebaseUID: request.auth.uid
        }
      })
      
      // Sauvegarder l'ID du client Stripe
      await userRef.set({
        stripeCustomerId: customer.id,
        email: request.auth.token.email
      }, { merge: true })
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

    console.log('Session créée:', session.id)
    return { sessionId: session.id }
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error)
    throw new HttpsError('internal', 'Erreur lors de la création de la session de paiement')
  }
})