import { defineStore } from 'pinia'

interface Plan {
  id: string
  name: string
  price: number
  requestsPerMonth: number
  features: string[]
}

export const usePlansStore = defineStore('plans', {
  state: () => ({
    plans: [
      {
        id: 'basic',
        name: 'Basique',
        price: 29.99,
        requestsPerMonth: 1000,
        features: [
          '1 000 requêtes API par mois',
          'Documentation complète',
          'Support par email'
        ]
      },
      {
        id: 'pro',
        name: 'Professionnel',
        price: 79.99,
        requestsPerMonth: 5000,
        features: [
          '5 000 requêtes API par mois',
          'Documentation complète',
          'Support prioritaire',
          'Accès aux données historiques'
        ]
      },
      {
        id: 'enterprise',
        name: 'Entreprise',
        price: 199.99,
        requestsPerMonth: 20000,
        features: [
          '20 000 requêtes API par mois',
          'Documentation complète',
          'Support dédié 24/7',
          'Accès aux données historiques',
          'API personnalisée',
          'SLA garanti'
        ]
      }
    ] as Plan[],
    loading: false,
    error: null as string | null
  })
})