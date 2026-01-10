# Multi-Stage Production Dockerfile (Trinity Diamond)
# STAGE 1: Frontend Build
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# STAGE 2: Backend Build
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend ./
# RUN npm run build (Assuming TS compilation)

# STAGE 3: Final Runner
FROM node:20-alpine
WORKDIR /app

# Copy optimized frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/

# Copy backend
COPY --from=backend-builder /app/backend ./backend

EXPOSE 3000 3001
CMD ["sh", "-c", "cd backend && npm start & cd frontend && npm start"]
