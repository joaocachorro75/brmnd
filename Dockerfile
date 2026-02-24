FROM node:20-slim

WORKDIR /app

# Instala as dependências
COPY package*.json ./
RUN npm install

# Copia o código e gera o build do frontend
COPY . .
RUN npm run build

# Porta padrão
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Inicia o servidor diretamente para melhor gerenciamento de processos
CMD ["npx", "tsx", "server.ts"]
