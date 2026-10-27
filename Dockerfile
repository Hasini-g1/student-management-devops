# Production-ready Dockerfile for Student Management DevOps Application
# Base image: Official lightweight Node.js LTS Alpine Linux
FROM node:20-alpine

# Set build & runtime metadata
LABEL maintainer="College DevOps Project Team"
LABEL description="Student Management Application with Node.js, Express, and Docker"
LABEL version="1.0.0"

# Install curl for container HEALTHCHECK
RUN apk add --no-cache curl

# Set working directory inside container
WORKDIR /usr/src/app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies cleanly
RUN npm ci --omit=dev

# Copy application source code, static frontend assets, and initial data
COPY src/ ./src/
COPY public/ ./public/
COPY data/ ./data/

# Grant appropriate file permissions to the built-in non-root 'node' user
RUN chown -R node:node /usr/src/app

# Switch to non-root user for enhanced container security
USER node

# Expose internal application port
EXPOSE 3000

# Docker native health check hitting the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application server
CMD ["node", "src/server.js"]
