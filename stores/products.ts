import { defineStore } from 'pinia'

interface Product {
  cip_code: string
  title: string
  brand: string
  image_url: string
  price: number
}

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        const config = useRuntimeConfig()
        const response = await fetch(`${config.public.apiBaseUrl}/api/v1/products`, {
          headers: {
            'Authorization': `Bearer ${config.public.apiToken}`
          }
        })
        if (!response.ok) throw new Error('Erreur lors de la récupération des produits')
        this.products = await response.json()
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})