import { onCall, onRequest } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

admin.initializeApp()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Map des IDs de plans vers les IDs de prix Stripe
const PRICE_MAP: { [key: string]: string } = {
    'basic': 'prod_RibDkVUBfzGxfO', // Remplacer par votre vrai ID de prix Stripe
    'pro': 'prod_RibEg7kJdwI522',     // Remplacer par votre vrai ID de prix Stripe
    'enterprise': 'prod_RibFR1RqX7xiXk' // Remplacer par votre vrai ID de prix Stripe
  }

export const createSubscription = onCall({
  region: 'europe-west9',
  maxInstances: 10,
  memory: '256MiB',
}, async (request) => {
  if (!request.auth) {
    throw new Error('L\'utilisateur doit être authentifié')
  }

  try {
    const { priceId, successUrl, cancelUrl } = request.data
    const stripePriceId = PRICE_MAP[priceId]
    
    if (!stripePriceId) {
      throw new Error('Plan invalide')
    }

    const userSnapshot = await admin.firestore()
      .collection('users')
      .doc(request.auth.uid)
      .get()
    
    let stripeCustomerId = userSnapshot.data()?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: request.auth.token.email,
        metadata: {
          firebaseUID: request.auth.uid
        }
      })
      stripeCustomerId = customer.id

      await admin.firestore()
        .collection('users')
        .doc(request.auth.uid)
        .set({ stripeCustomerId }, { merge: true })
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
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
    throw new Error('Erreur lors de la création de la session de paiement')
  }
})

export const stripeWebhook = onRequest({
  region: 'europe-west9',
  maxInstances: 10,
  memory: '256MiB',
  cors: false,
}, async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig!,
      webhookSecret!
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const firebaseUID = session.metadata?.firebaseUID

        if (firebaseUID) {
          await admin.firestore()
            .collection('subscriptions')
            .doc(firebaseUID)
            .set({
              status: 'active',
              priceId: session.metadata?.priceId,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const firebaseUID = subscription.metadata.firebaseUID

        if (firebaseUID) {
          await admin.firestore()
            .collection('subscriptions')
            .doc(firebaseUID)
            .update({
              status: subscription.status,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })
        }
        break
      }
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Erreur webhook:', err)
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
})