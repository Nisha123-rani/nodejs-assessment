# ==========================
# Stage 1: Build
# ==========================
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY src/ ./src

# ==========================
# Stage 2: Runtime
# ==========================
FROM node:20-alpine

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only necessary build artifacts
COPY --from=build /app /app

# Environment variables
ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA
ENV NODE_ENV=production
ENV PORT=3000

# Run as non-root user
USER appuser

EXPOSE 3000

CMD ["node", "src/index.js"]

