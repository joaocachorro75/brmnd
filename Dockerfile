# --- Build Stage ---
FROM node:20-slim AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:20-slim

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm install --production

# Copy built assets and server
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./
COPY --from=build /app/package.json ./

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
