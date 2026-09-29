# ==============================================================================
# DANH THẮNG KÝ - MULTI-STAGE DOCKERFILE CHO NEXT.JS 15 STANDALONE
# Tối ưu hóa tốc độ build bằng node:20-slim (glibc) & BuildKit npm cache
# ==============================================================================

# --- Stage 1: Cài đặt dependencies ---
FROM node:20-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json ./
# BuildKit cache mount giúp download npm cực nhanh và không bao giờ bị tải lại
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --no-audit

# Sao chép schema Prisma và sinh Client
COPY prisma ./prisma/
RUN npx prisma generate

# --- Stage 2: Xây dựng ứng dụng (Builder) ---
FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Thiết lập biến môi trường build-time
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Đóng gói Next.js standalone
RUN npx next build

# --- Stage 3: Chạy môi trường Production (Runner) ---
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl gosu && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Thiết lập người dùng bảo mật
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 -g nodejs nextjs

# Tạo thư mục public, uploads và data với quyền chính xác
RUN mkdir -p public/uploads data && \
    chown -R nextjs:nodejs public/uploads data

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
