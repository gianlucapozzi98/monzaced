# Immagine del sito (Node 24). NON provata in questo ambiente: Docker non era disponibile.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Variabili lette in build: indirizzo del sito e (se S3) l'endpoint per la CSP
ARG SITE_URL=https://monzaced.it
ARG S3_ENDPOINT=
ARG PUBLIC_MOSTRA_SEGNAPOSTO=false
ENV SITE_URL=$SITE_URL S3_ENDPOINT=$S3_ENDPOINT PUBLIC_MOSTRA_SEGNAPOSTO=$PUBLIC_MOSTRA_SEGNAPOSTO
RUN npm run build:veloce && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/server.mjs ./
USER node
EXPOSE 4321
CMD ["node", "server.mjs"]
