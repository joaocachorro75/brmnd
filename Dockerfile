# BRMND - Brasil no Mundo
# Dockerfile simplificado

FROM node:20-alpine

WORKDIR /app

# Instalar dependências do sistema para bcrypt
RUN apk add --no-cache python3 make g++

# Copiar package.json
COPY package*.json ./

# Instalar TODAS as dependências (tsx precisa como runtime)
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

# Iniciar servidor
CMD ["npm", "run", "dev"]
