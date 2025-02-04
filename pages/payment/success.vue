<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <h2 class="text-2xl font-bold text-green-600 mb-4">Paiement réussi !</h2>
        <p class="text-gray-600 mb-6">
          Merci pour votre achat. Vous recevrez un email de confirmation avec les détails de votre commande.
        </p>
        <NuxtLink
          to="/products"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Retour aux produits
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()

onMounted(() => {
  cartStore.clearCart()
})</script>