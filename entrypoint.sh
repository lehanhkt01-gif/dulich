#!/bin/sh
set -e

# Đảm bảo thư mục uploads và data luôn tồn tại với quyền ghi đầy đủ
mkdir -p /app/public/uploads /app/data
chmod -R 777 /app/public/uploads /app/data 2>/dev/null || true
chown -R nextjs:nodejs /app/public/uploads /app/data 2>/dev/null || true

# Tự động đồng bộ schema vào PostgreSQL nếu cấu hình DB hoạt động
if [ -n "$DATABASE_URL" ]; then
  echo "=> Kiem tra va dong bo cau truc bang PostgreSQL..."
  npx prisma db push --skip-generate 2>/dev/null || echo "=> PostgreSQL chua san sang, he thong se tu dong su dung bo nho luu tru ben vung JSON Storage"
fi

echo "=> Khoi dong ung dung Next.js..."
if command -v su-exec >/dev/null 2>&1; then
  exec su-exec nextjs "$@"
else
  exec "$@"
fi
