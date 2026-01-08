# Build stage
FROM node:20-bookworm AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++ gcc libusb-1.0-0-dev libudev-dev pkg-config && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install runtime libs
RUN apt-get update && apt-get install -y libusb-1.0-0 wget && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
