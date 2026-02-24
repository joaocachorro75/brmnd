FROM node:20-slim

WORKDIR /app

# Instala as dependências
COPY package*.json ./
RUN npm install

# Copia o código e gera o build do frontend
COPY . .
RUN npm run build

# Porta padrão (o Easypanel pode sobrescrever isso via variável PORT)
EXPOSE 3000

# Inicia o servidor
CMD ["npm", "start"]
