# ============================================
# BRMND - Brasil no Mundo
# Dockerfile otimizado para produção
# ============================================

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Instalar todas as dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build do frontend (gera pasta dist/)
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 brmnd

# Copiar arquivos de produção
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instalar apenas dependências de produção + tsx
RUN npm ci --only=production && \
    npm install tsx

# Copiar servidor TypeScript
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig.json ./

# Ajustar permissões
RUN chown -R brmnd:nodejs /app

# Mudar para usuário não-root
USER brmnd

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Iniciar servidor
CMD ["npx", "tsx", "server.ts"]
