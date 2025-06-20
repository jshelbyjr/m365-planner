# Dockerfile

# 1. Builder Stage
FROM node:20-slim AS builder
WORKDIR /app

# Install Prisma Client dependency
RUN apt-get update && apt-get install -y libssl-dev openssl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
# This is crucial for the production build
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# 2. Runner Stage
FROM node:20-slim AS runner
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy production dependencies from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma client and schema
COPY --from=builder /app/prisma ./prisma
# Copy the generated Prisma client
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

# Copy Next.js build output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

EXPOSE 3000

# The command to run the application
# Note: We run the migration command here to ensure the database is created on first start
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db push && node_modules/.bin/next start"]