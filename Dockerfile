# ==============================================================================
# DANH THẮNG KÝ - MULTI-STAGE DOCKERFILE CHO NEXT.JS 15 STANDALONE
# ==============================================================================

# --- Stage 1: Cài đặt dependencies ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl openssl1.1-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --no-audit

# Sao chép schema Prisma và sinh Client sau khi dependencies đã cài xong
COPY prisma ./prisma/
RUN npx prisma generate

# --- Stage 2: Xây dựng ứng dụng (Builder) ---
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl openssl1.1-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Thiết lập biến môi trường build-time
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Đóng gói Next.js standalone (Prisma client đã được sinh sẵn ở stage deps)
RUN npx next build

# --- Stage 3: Chạy môi trường Production (Runner) ---
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache su-exec openssl openssl1.1-compat libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Thiết lập người dùng bảo mật
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Tạo thư mục public, uploads và data với quyền chính xác
RUN mkdir -p public/uploads data
RUN chown -R nextjs:nodejs public/uploads data

# Tận dụng output standalone tối ưu từ Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
