# Multi-stage Dockerfile for NestJS application

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Set environment variable to skip husky install in Docker
ENV HUSKY=0

# Install all dependencies (including dev dependencies for development)
# Skip scripts to prevent arbitrary script execution
RUN npm ci --ignore-scripts

# Install NestJS CLI globally for development
# Skip scripts to prevent arbitrary script execution
RUN npm install -g @nestjs/cli --ignore-scripts

# Copy source code
# Safe to copy all files because .dockerignore excludes sensitive data
COPY . .

# Expose port
EXPOSE 3000

# Default command for development
CMD ["npm", "run", "start:dev"]

# Production build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (skip prepare scripts to avoid husky issues)
RUN npm ci --ignore-scripts

# Copy source code
# Safe to copy all files because .dockerignore excludes sensitive data
COPY . .

# Build the application
RUN npm run build:all

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies (skip prepare scripts to avoid husky issues)
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# Remove write permissions from copied files for security
RUN chmod -R a-w /app/dist

# Install knex globally for running migrations
# Skip scripts to prevent arbitrary script execution
RUN npm install -g knex --ignore-scripts

# Set working directory for migrations
WORKDIR /app

# Change to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Start the application (run migrations then start app)
CMD sh -c "npx knex migrate:latest --knexfile=./dist/knexfile.js && node dist/src/main.js"
