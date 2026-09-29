# ==============================================================================
# DANH THẮNG KÝ - MULTI-STAGE DOCKERFILE CHO NEXT.JS 15 STANDALONE
# ==============================================================================

# --- Stage 1: Cài đặt dependencies ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Sao chép package manifests và schema Prisma để cache layer
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci

# --- Stage 2: Xây dựng ứng dụng (Builder) ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Thiết lập biến môi trường build-time
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Sinh Prisma Client và đóng gói Next.js standalone
RUN npx prisma generate
RUN npm run build

# --- Stage 3: Chạy môi trường Production (Runner) ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Thiết lập người dùng bảo mật không dùng root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Tạo thư mục public và uploads với quyền chính xác
RUN mkdir -p public/uploads
RUN chown -R nextjs:nodejs public/uploads

# Tận dụng output standalone tối ưu từ Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Chuyển sang người dùng bảo mật
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
