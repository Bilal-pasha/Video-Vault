# Build stage
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Increase memory limit
ENV NODE_OPTIONS=--max_old_space_size=4096
    
# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

#Bundle app source
COPY . .

# Build the app
RUN npm run build

# Copy and make scripts executable
COPY start.sh ./start.sh
COPY migrate.sh ./migrate.sh
RUN chmod +x ./start.sh ./migrate.sh

# Expose port
EXPOSE 8000

# Health check - Fixed port to 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# run migrations and then start the application
CMD ["sh", "./start.sh"]