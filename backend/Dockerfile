FROM node:20-alpine

WORKDIR /app

# Instala dependencias primero (mejor cache de capas)
COPY package*.json ./
RUN npm ci --omit=dev

# Copia el código fuente
COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "src/server.js"]
