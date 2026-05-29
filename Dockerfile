# ---- Frontend Build ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ---- Backend Build ----
FROM node:20-alpine3.20 AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY backend/tsconfig.json ./
COPY backend/src ./src/
RUN npm run build

# ---- Production ----
FROM node:20-alpine3.20
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=frontend-builder /app/frontend/dist ../frontend/dist

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
