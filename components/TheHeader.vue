<template>
  <header class="bg-white shadow-sm">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center">
            <span class="text-2xl font-bold text-indigo-600">PharmaData</span>
          </NuxtLink>
        </div>
        <div class="ml-10 space-x-4">
          <NuxtLink to="/products" class="text-base font-medium text-gray-500 hover:text-gray-900">Produits</NuxtLink>
          <NuxtLink to="/api-plans" class="text-base font-medium text-gray-500 hover:text-gray-900">Plans API</NuxtLink>
          <NuxtLink to="/cart" class="text-base font-medium text-gray-500 hover:text-gray-900">Panier</NuxtLink>
          <template v-if="!user">
            <NuxtLink to="/login" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700">
              Connexion
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/account/api-tokens" class="text-base font-medium text-gray-500 hover:text-gray-900">Mes Tokens API</NuxtLink>
            <button @click="handleLogout" class="text-base font-medium text-gray-500 hover:text-gray-900">
              Déconnexion
            </button>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { logout } = authStore

const handleLogout = async () => {
  try {
    await logout()
    navigateTo('/')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}</script>