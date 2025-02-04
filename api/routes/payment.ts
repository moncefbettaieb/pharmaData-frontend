import express from 'express'
import Stripe from 'stripe'
import { authenticateToken } from '../middleware/auth'
import { pool } from '../db'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body

    // Récupérer les détails des produits depuis la base de données
    const productDetails = await Promise.all(
      items.map(async (item: { productId: string; quantity: number }) => {
        const result = await pool.query(
          'SELECT name, price FROM products WHERE id = $1',
          [item.productId]
        )
        return {
          ...result.rows[0],
          quantity: item.quantity
        }
      })
    )

    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: productDetails.map(product => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100), // Convertir en centimes
        },
        quantity: product.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId: req.user.id, // Ajouté depuis le middleware d'authentification
      },
    })

    res.json({ sessionId: session.id })
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error)
    res.status(500).json({ error: "Erreur lors de la création de la session de paiement" })
  }
})

// Webhook pour gérer les événements Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  // Gérer l'événement de paiement réussi
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Enregistrer la commande dans la base de données
    try {
      await pool.query(
        'INSERT INTO orders (user_id, stripe_session_id, amount) VALUES ($1, $2, $3)',
        [session.metadata?.userId, session.id, session.amount_total! / 100]
      )
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la commande:', error)
    }
  }

  res.json({ received: true })
})

export default router