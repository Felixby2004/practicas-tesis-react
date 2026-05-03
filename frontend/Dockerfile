# Etapa base: instalar dependencias
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias incluyendo autoprefixer y postcss
RUN npm install --legacy-peer-deps && \
    npm install -g autoprefixer postcss tailwindcss

# Etapa builder: compilar la aplicación
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Compilar Next.js
RUN npm run build

# Etapa runner: servir la aplicación
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos necesarios para producción
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cambiar ownership a usuario nextjs
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]