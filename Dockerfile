# Use Node.js 20 image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build and tsx)
RUN npm install

# Copy the rest of the application
COPY . .

# Build the frontend (Vite)
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the server using tsx
CMD ["npm", "start"]
