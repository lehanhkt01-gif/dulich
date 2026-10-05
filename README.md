# DANH THẮNG KÝ (NỀN TẢNG SỐ HÓA DI TÍCH & DU LỊCH VĂN HÓA EA SÚP)

Dự án công nghệ số hóa di tích lịch sử, danh lam thắng cảnh, văn hóa cồng chiêng buôn làng và du lịch sinh thái nông nghiệp tại xã Ea Súp, Đắk Lắk.

Xây dựng trên nền tảng **Next.js 15 (App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL 16)** và tuân thủ chuẩn mực **Taste-Skill Anti-Slop (Heritage Design System)**.

---

## 🏛️ BỐI CẢNH ĐỊA PHƯƠNG & KHÔNG GIAN DI SẢN

1. **Tháp Chàm Yang PRông**: Di tích kiến trúc nghệ thuật cấp Quốc gia duy nhất của người Chăm xây dựng tại Tây Nguyên (cuối thế kỷ XIII, thời vua Chế Mân).
2. **Hồ Ea Súp Thượng**: Hồ thủy lợi nhân tạo lớn nhất vùng Tây Nguyên (mặt nước 1.400 ha).
3. **Không gian Văn hóa Buôn A2**: Nếp nhà dài mẫu hệ Êđê, cồng chiêng Knah và lễ hội cúng bến nước.
4. **Vườn Quốc Gia Yok Đôn (Phân khu Ea Súp)**: Hệ sinh thái rừng khộp và mô hình du lịch voi thân thiện.
5. **Nông nghiệp Sinh thái OCOP**: Vùng chuyên canh hơn 3.000 ha Xoài Cát Ea Súp (OCOP 4 sao).

---

## 🎨 TRIẾT LÝ THIẾT KẾ HERITAGE ANTI-SLOP

- **Bộ 3 Khóa bất biến (The 3 Locks)**:
  - *Color Consistency Lock*: Nền kem di sản `#FBF9F5`, chữ than chì `#1C1917`, điểm nhấn màu xanh da trời Đoàn thanh niên tươi sáng `#0066CC` và sắc đất đỏ bazan `#A64B2A`. Không dùng gradient tím AI sến sẩm.
  - *Shape Consistency Lock*: Đồng bộ hệ bo góc mềm mại `rounded-xl` / `rounded-2xl`.
  - *Page Theme Lock*: Độ tương phản chuẩn WCAG AA.
- **Hero Discipline**:
  - Tiêu đề chính trang nhã font có chân (Noto Serif / Merriweather), dẫn nhập súc tích dưới 20 từ.
  - Tích hợp thanh tra cứu nhanh và bản đồ định vị GIS ngay trong tầm mắt đầu tiên.
  - Navbar kính mờ `backdrop-blur` cố định dưới 80px.
- **Bố cục Asymmetrical Bento Grid**:
  - Loại bỏ hoàn toàn kiểu 3 thẻ bằng nhau nhàm chán.
  - 01 thẻ danh thắng tiêu biểu kích thước lớn tích hợp Mini Audio Player nghe thử thuyết minh AI trực tiếp.
  - Thẻ vệ tinh liên kết bản đồ, cồng chiêng và nông sản OCOP.

---

## 🛠️ CÔNG NGHỆ & KIẾN TRÚC HỆ THỐNG

- **Framework**: Next.js 15.1 (App Router, Server & Client Components)
- **Styling**: Tailwind CSS với custom tokens `#FBF9F5`, `#0066CC`, `#A64B2A`
- **Bản đồ GIS**: Leaflet.js với Custom SVG Heritage Pin & Popups dẫn đường Google Maps
- **Âm thanh số**: Trình phát Audio Bar tùy chỉnh tốc độ 1x/1.25x/1.5x, tua thời gian và mô phỏng quét mã QR tại bia di tích
- **Cơ sở dữ liệu**: PostgreSQL 16 + Prisma ORM
- **Xác thực & RBAC**: JWT Token + BCrypt (TRAVELER, EDITOR, ADMIN)
- **Xử lý đa phương tiện**: Nén ảnh WebP tự động bằng `sharp`
- **Đóng gói**: Docker Multi-stage Standalone + Nginx Reverse Proxy + Dozzle Log Viewer

---

## 🔒 QUẢN TRỊ BẢO MẬT BITWARDEN

1. Mở ứng dụng **Bitwarden** -> chọn mục **Tools** -> **Password Generator**.
2. Thiết lập độ dài: **32 ký tự ngẫu nhiên** (gồm chữ hoa, chữ thường, số, ký tự đặc biệt).
3. Tạo một **Secure Note** trong Bitwarden Vault đặt tên: `ENV_HE_THONG_EASUPSO`.
4. Lưu 2 giá trị bí mật:
   - `DB_PASSWORD`: Mật khẩu cơ sở dữ liệu PostgreSQL.
   - `AUTH_SECRET`: Khóa ký token JWT của ban quản trị.
5. Sao chép và dán vào file `.env` trên máy chủ VPS.

---

## 🚀 QUY TRÌNH TRIỂN KHAI LÊN VPS (1-TOUCH DEPLOYMENT)

### Bước 1: Khởi tạo Git & Đẩy code lên GitHub Private Repo
```bash
git init
git add .
git commit -m "feat: Danh Thang Ky Ea Sup fullstack release"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/danh-thang-ky.git
git push -u origin main
```

### Bước 2: Cấu hình DNS Cloudflare
1. Đăng nhập [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Thêm bản ghi **A record**:
   - **Type**: `A`
   - **Name**: `@` (hoặc `danhthangky`)
   - **IPv4 address**: `[IP_VPS_CỦA_BẠN]`
   - **Proxy status**: **Proxied (Đám mây cam bật)** để ẩn IP VPS và chống DDoS.
3. Vào mục **SSL/TLS**:
   - Chọn chế độ: **Full (Strict)**.

### Bước 3: Đăng nhập Termius & Chạy lệnh một chạm trên VPS
Mở **Termius**, kết nối SSH vào VPS qua IP và thực hiện:

```bash
# 1. Cập nhật hệ thống và cài đặt Docker Compose (nếu VPS mới)
sudo apt update && sudo apt install -y git curl docker.io docker-compose-plugin

# 2. Kéo mã nguồn từ GitHub về thư mục làm việc (/opt/dulich)
git clone https://github.com/lehanhkt01-gif/dulich.git /opt/dulich
cd /opt/dulich

# 3. Tạo file cấu hình môi trường .env từ Bitwarden
cp .env.example .env
nano .env
# (Dán DB_PASSWORD và AUTH_SECRET lấy từ Secure Note 'ENV_HE_THONG_EASUPSO' trong Bitwarden)

# 4. Khởi chạy toàn bộ hệ sinh thái container (Web + PostgreSQL + Nginx + Dozzle)
docker compose up -d --build

# 5. Khởi tạo cấu trúc Database & Nạp dữ liệu văn hóa Ea Súp ban đầu
docker compose exec web npx prisma db push
docker compose exec web npm run db:seed
```

### Bước 4: Kiểm tra hoạt động hệ thống
- **Trang chủ WebApp**: `https://your-domain.com` hoặc `http://IP_VPS`
- **Ban Quản Trị CMS**: `https://your-domain.com/admin`
  - Tài khoản Admin: `admin@easup.daklak.gov.vn` / `AdminEaSup@2025!`
  - Tài khoản Editor: `editor@easup.daklak.gov.vn` / `EditorEaSup@2025!`
- **Trình xem nhật ký Dozzle**: `http://IP_VPS:8888`
