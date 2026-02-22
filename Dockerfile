# BRMND - Brasil no Mundo
# Dockerfile para EasyPanel

FROM node:20-alpine

WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache python3 make g++ curl

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Build do frontend
RUN npm run build

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Expor porta
EXPOSE 3000

# Healthcheck a cada 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Iniciar servidor
CMD ["npm", "start"]
