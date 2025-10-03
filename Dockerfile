# ==========================
# Stage 1: Build
# ==========================
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for better caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src

# ==========================
# Stage 2: Runtime
# ==========================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built application and dependencies from build stage
COPY --from=build /app/src ./src
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Set environment variables
ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA
ENV NODE_ENV=production
ENV PORT=3000

# Use non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "src/index.js"]

