FROM node:22-alpine

# Définition des arguments de build
ARG API_URL

# Variables d'environnement
ENV API_URL=${API_URL}

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