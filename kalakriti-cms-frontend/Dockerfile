FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy rest of the source code
COPY . .

# Set env so vite.config.ts sees mode=development
ENV NODE_ENV=development

# Expose Vite's configured port
EXPOSE 80

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
