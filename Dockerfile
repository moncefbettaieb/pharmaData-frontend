FROM node:22-alpine

# Définition des arguments de build
ARG API_BASE_URL
ARG FIREBASE_API_KEY
ARG FIREBASE_AUTH_DOMAIN
ARG FIREBASE_PROJECT_ID
ARG FIREBASE_STORAGE_BUCKET
ARG FIREBASE_MESSAGING_SENDER_ID
ARG FIREBASE_APP_ID
ARG FIREBASE_MEASUREMENT_ID

# Variables d'environnement
ENV API_BASE_URL=${API_BASE_URL}
ENV FIREBASE_API_KEY=${FIREBASE_API_KEY}
ENV FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
ENV FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
ENV FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
ENV FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
ENV FIREBASE_APP_ID=${FIREBASE_APP_ID}
ENV FIREBASE_MEASUREMENT_ID=${FIREBASE_MEASUREMENT_ID}

WORKDIR /app

RUN apk add --no-cache python3 make g++

# Installation des dépendances (optimisé pour le cache Docker)
RUN rm -rf node_modules package-lock.json
RUN rm -rf .output 
COPY package*.json ./
RUN npm install

# Copie des fichiers de l'application
COPY . .

# Build de l'application
RUN npm run build

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start"]