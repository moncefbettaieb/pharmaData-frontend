<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <h2 class="text-2xl font-bold text-red-600 mb-4">Paiement annulé</h2>
        <p class="text-gray-600 mb-6">
          Le paiement a été annulé. Votre panier a été conservé.
        </p>
        <NuxtLink
          to="/cart"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Retour au panier
        </NuxtLink>
      </div>
    </div>
  </div>
</template>