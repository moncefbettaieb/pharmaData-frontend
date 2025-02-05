<template>
  <div class="bg-white">
    <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">Nos Produits</h1>

      <!-- Loading et Error states -->
      <div v-if="productsStore.loading" class="mt-6 text-center">
        <p class="text-gray-500">Chargement des produits...</p>
      </div>

      <div v-else-if="productsStore.error" class="mt-6 text-center">
        <p class="text-red-500">{{ productsStore.error }}</p>
      </div>

      <!-- Grid des produits -->
      <div v-else class="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        <div v-for="product in productsStore.products" :key="product.cip_code" class="group relative">
          <div class="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
            <img :src="product.image_url" :alt="product.title" class="h-full w-full object-cover object-center lg:h-full lg:w-full">
          </div>
          <div class="mt-4 flex justify-between">
            <div>
              <h3 class="text-sm text-gray-700">
                <span class="absolute inset-0"></span>
                {{ product.title }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">{{ product.description }}</p>
            </div>
            <p class="text-sm font-medium text-gray-900">1 €</p>
          </div>
          <button
            @click="addToCart(product)"
            class="mt-4 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProductsStore } from '~/stores/products'
import { useCartStore } from '~/stores/cart'
import { useToast } from 'vue-toastification'

const productsStore = useProductsStore()
const cartStore = useCartStore()
const toast = useToast()

onMounted(async () => {
  try {
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
  }
})

const addToCart = (product) => {
  cartStore.addToCart(product)
  toast.success('Produit ajouté au panier')
}
</script>