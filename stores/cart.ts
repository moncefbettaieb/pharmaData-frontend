import { defineStore } from 'pinia'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[]
  }),

  getters: {
    totalItems: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  },

  actions: {
    addToCart(product: { id: string, name: string, price: number }) {
      const existingItem = this.items.find(item => item.productId === product.id)
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        })
      }
    },

    removeFromCart(productId: string) {
      const index = this.items.findIndex(item => item.productId === productId)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },

    updateQuantity(productId: string, quantity: number) {
      const item = this.items.find(item => item.productId === productId)
      if (item) {
        item.quantity = Math.max(1, quantity)
      }
    },

    clearCart() {
      this.items = []
    }
  },

  persist: true
})