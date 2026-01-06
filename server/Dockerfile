# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install production + dev dependencies for migrations
RUN npm ci

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy and make scripts executable
COPY start.sh ./start.sh
COPY migrate.sh ./migrate.sh
RUN chmod +x ./start.sh ./migrate.sh

# Use node user (exists in node:20-alpine)
USER node

# Expose port
EXPOSE 8000

# Health check - Fixed port to 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# run migrations and then start the application
CMD ["sh", "./start.sh"]