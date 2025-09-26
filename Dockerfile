# build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# runtime stage
FROM node:20-alpine
# create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
USER appuser
CMD ["node", "src/index.js"]

