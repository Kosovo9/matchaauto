# Multi-Stage Production Dockerfile (Trinity Diamond) - SHARP NUCLEAR FIX
# STAGE 1: Frontend Build
FROM node:20-slim AS frontend-builder
RUN apt-get update && apt-get install -y python3 make g++ libusb-1.0-0-dev libudev-dev libc6-dev libvips-dev
WORKDIR /app
COPY shared ./shared
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend ./
RUN npm run build

# STAGE 2: Backend Build
FROM node:20-slim AS backend-builder
RUN apt-get update && apt-get install -y python3 make g++ libusb-1.0-0-dev libudev-dev libc6-dev libvips-dev
WORKDIR /app
COPY shared ./shared
WORKDIR /app/backend
COPY backend/package*.json ./
# Force sharp installation for the correct platform
RUN npm install --legacy-peer-deps && npm install --include=optional sharp
COPY backend ./
RUN npm run build

# STAGE 3: Final Runner
FROM node:20-slim
RUN apt-get update && apt-get install -y \
    libusb-1.0-0 \
    libudev1 \
    libvips42 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Backend Build
COPY --from=backend-builder /app/backend ./backend
COPY --from=backend-builder /app/shared ./shared

# Copy Frontend Build
COPY --from=frontend-builder /app/frontend ./frontend

# Final Sharp Rebuild in situ to be 100% sure
RUN cd backend && npm rebuild sharp

EXPOSE 3000 3001
CMD ["sh", "-c", "cd backend && npm start & cd frontend && npm start"]
