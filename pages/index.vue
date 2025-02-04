<template>
  <main>
    <!-- Hero Section -->
    <div class="relative isolate">
      <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Plateforme de Données Pharmaceutiques Professionnelles
          </h1>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            Accédez à des données complètes sur les produits pharmaceutiques et parapharmaceutiques. Achetez des fiches produits individuelles ou abonnez-vous à notre API pour une intégration transparente.
          </p>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <NuxtLink to="/products" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Parcourir les Produits
            </NuxtLink>
            <NuxtLink to="/api-plans" class="text-sm font-semibold leading-6 text-gray-900">
              Voir les Plans API <span aria-hidden="true">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-white py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-indigo-600">Plateforme de Données</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tout ce dont vous avez besoin pour vos données pharmaceutiques
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div class="flex flex-col">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                Fiches Produits
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p class="flex-auto">Accédez aux informations détaillées des produits pharmaceutiques à 0,70€ par fiche</p>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                Accès API
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p class="flex-auto">Choisissez parmi différents quotas API en commençant par 100 requêtes gratuites</p>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                Plateforme Sécurisée
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p class="flex-auto">Authentification et paiements sécurisés avec Firebase et Stripe</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </main>
</template>