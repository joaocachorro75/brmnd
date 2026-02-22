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
COPY server.ts ./
COPY src ./src
COPY index.html ./

# Build do frontend (gera pasta dist/)
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 brmnd

# Copiar arquivos de produção
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./

# Instalar dependências (tsx é necessário para rodar TypeScript)
RUN npm ci --only=production && npm cache clean --force

# Instalar tsx para rodar TypeScript diretamente
RUN npm install tsx

# Ajustar permissões
RUN chown -R brmnd:nodejs /app

# Mudar para usuário não-root
USER brmnd

# Expor porta
EXPOSE 3000

# Iniciar servidor com tsx (TypeScript runtime)
CMD ["npx", "tsx", "server.ts"]
