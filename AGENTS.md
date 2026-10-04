# AGENTS.md – Bộ nhớ dự án "Du lịch Ea Súp"

> File này được AI agent (Antigravity / Gemini / Claude / Codex…) **tự động đọc mỗi khi mở phiên làm việc mới**.
> Mục đích: ghi nhớ bối cảnh, quy ước và trạng thái dự án để không bị "quên" khi tắt máy / khởi động lại.
>
> 📌 **Quy tắc cho agent:** Sau mỗi thay đổi đáng kể, PHẢI cập nhật [`CHANGELOG.md`](./CHANGELOG.md)
> (thêm mục mới lên đầu) và cập nhật mục "Trạng thái hiện tại" bên dưới nếu cần.

---

## 1. Tổng quan

- **Tên:** Du lịch Ea Súp – Bản sắc, dấu ấn đại ngàn Tây Nguyên (package: `danh-thang-ky`).
- **Mục tiêu:** Số hóa di tích, danh thắng, văn hóa và ẩm thực xã Ea Súp, tỉnh Đắk Lắk.
- **Chủ dự án:** Đoàn Thanh Niên Ea Súp. Giao tiếp với người dùng bằng **tiếng Việt**.
- **Repo GitHub:** `lehanhkt01-gif/dulich`.

## 2. Công nghệ

| Thành phần | Chi tiết |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Giao diện | Tailwind CSS 3, icon `lucide-react`, font Inter + Noto Serif |
| Bản đồ | Leaflet (`components/InteractiveMap.tsx`, `public/data/easup-boundary.geojson`) |
| CSDL | PostgreSQL 16 + Prisma 5 (`prisma/schema.prisma`), có dữ liệu offline trong `data/*.json` |
| Xác thực | Auth.js (NextAuth.js v5 beta) Google OAuth + JWT bcrypt, vai trò TRAVELER / OWNER / EDITOR / ADMIN |
| Triển khai | Docker (node:20-slim, standalone) + Nginx + Dozzle, VPS qua Cloudflare |

## 3. Cấu trúc thư mục chính

```
app/
  page.tsx                 Trang chủ = Món ngon (re-export từ mon-ngon/page.tsx)
  diem-den/page.tsx        ⭐ Điểm đến du lịch (trang chủ cũ: danh thắng, bản đồ, lịch trình, thuyết minh số)
  destinations/[slug]/     Chi tiết điểm đến
  mon-ngon/page.tsx        ⭐ Mục "Món ngon Ea Súp" (metadata SEO, render MonNgonClient)
  admin/                   Ban quản trị CMS
  review/                  Trang kiểm tra trước triển khai
  api/                     auth, destinations, itineraries, reviews, upload, users
components/
  Navbar.tsx               Thanh trên cùng (danh sách navLinks)
  mon-ngon/MonNgonClient.tsx  Toàn bộ giao diện Món ngon
lib/
  data/mon-ngon.ts         Danh sách món, bàn ăn mẫu, hàm định dạng thời gian
  data/seed-data.ts, prisma.ts, auth.ts, storage.ts, types.ts
public/
  mon-ngon/*.jpg           Ảnh món ăn (AI tạo, 4:3)
```

## 4. Quy ước thiết kế

- **Toàn site (Heritage):** nền kem `#FBF9F5`, chữ `#1C1917`, xanh Đoàn `#0066CC`, đỏ bazan `#A64B2A`;
  bo góc `rounded-xl/2xl`; tiêu đề h1–h3 dùng font serif (đặt trong `app/globals.css`).
- **Mục Món ngon:** tông ấm – đỏ cam `#D9452B` (hover `#BF3A22`, nhạt `#FDEDE8`), vàng xúc xắc `#F5B82E`,
  chữ nâu `#2B1D16`, phụ `#7D6B62`, viền `#EADBD0`; bo góc lớn `rounded-3xl`, nút dạng viên thuốc `rounded-full`.
- Hiệu ứng dùng chung trong `globals.css`: `.mn-fade-up`, `.mn-sheet`, `.mn-pop`, `.mn-shake`, `.mn-press`, `.no-scrollbar`.
- Navbar: mục "Món ngon Ea Súp" đặt ở vị trí đầu tiên (tông đỏ cam). Nhãn chữ của tất cả các nút luôn hiển thị đầy đủ trên máy tính (từ `md`), trên điện thoại hiển thị icon + nhãn ngắn "Món ngon".
- Mỗi phần tử tương tác quan trọng có `id` duy nhất (tiền tố `mn-` cho mục Món ngon).

## 5. Mục "Món ngon Ea Súp" – cách hoạt động

- 3 tab: **Khám phá món** (tìm kiếm + lọc danh mục) · **Bàn ăn đang mở** (lọc theo món / buổi) · **Lịch hẹn của tôi**.
- Nút **Rủ nhau đi** → form mở bàn mới; **Lắc món** → chọn món ngẫu nhiên có hiệu ứng.
- Mobile có thanh điều hướng dưới cùng với nút "+" ở giữa (giống app đặt bàn).
- **Lưu trữ:** chỉ phía trình duyệt bằng `localStorage` (khóa trong `STORAGE_KEYS`, hậu tố `_v1`).
  Chưa có API/DB → người khác **không** thấy bàn bạn tạo. Bàn mẫu sinh theo ngày hiện tại (`buildSampleTables`).
- ⚠️ Tên quán/địa chỉ trong bàn mẫu là **dữ liệu minh họa** (có hậu tố "(mẫu)"), cần thay bằng quán thật.

## 6. Lệnh thường dùng

```bash
npm run dev          # chạy local http://localhost:3000
npx tsc --noEmit     # kiểm tra kiểu
npm run build        # prisma generate + next build
docker compose up -d --build   # trên VPS
```

## 7. Trạng thái hiện tại & việc tiếp theo

- [x] Trang chủ, bản đồ GIS, lịch trình, thuyết minh số, CMS, Docker.
- [x] Mục Món ngon Ea Súp (giao diện, lắc món ngẫu nhiên, tìm bàn, đặt bàn).
- [x] Đồng bộ bàn ăn lên server (Prisma model `FoodTable`, bộ API `/api/food-tables` + lưu trữ JSON bền vững).
- [x] Bổ sung quán thật ở Ea Súp (Gà nướng Bản Đôn, Lòng hồ Ea Súp, Buôn A2, Cà phê Gió Hồ) với tọa độ GPS, quản trị chỉnh được trong `/admin`.
- [x] Liên kết quán ăn lên bản đồ Leaflet (ghim ẩm thực màu đỏ cam `#D9452B`, popup mở trực tiếp trang Món ngon).
- [x] Bổ sung tab quản trị "Món Ngon & Bàn Ăn" trong `/admin` để kiểm duyệt và xóa bàn spam.
- [x] Tích hợp trọn gói Auth.js (NextAuth.js v5 beta) với Google OAuth (Client ID & Secret).
- [x] Tích hợp Đăng nhập bằng Google & Phân quyền Chủ quán (OWNER) - Admin - Khách (TRAVELER).
- [x] Không gian làm việc riêng cho Chủ Quán (`/chu-quan` & `/chu-quan/dashboard`): đăng ký mở quán (chờ Admin duyệt), quản lý thông tin quán, tạo/sửa/xóa món ăn của quán mình, tạo/sửa/xóa bàn ăn, độc quyền tiếp nhận & duyệt đơn đặt món / đặt bàn.
- [x] Quản trị Admin: Tách 3 nút quản lý chuyên biệt "Khách hàng", "Chủ quán", "Cán bộ" tại `/admin`. Đảm bảo Khách hàng đăng nhập Gmail tự kích hoạt ngay không cần duyệt; Chủ quán đăng ký Gmail phải chờ Admin phê duyệt mới được hoạt động và khi đăng nhập được chuyển thẳng vào không gian quán của mình; Cán bộ dùng tài khoản nội bộ cấp riêng.
- [x] Đăng nhập Chủ Quán độc quyền bằng Gmail và Mật khẩu: Tab Chủ Quán chỉ cho phép nhập Gmail + Mật khẩu (đã duyệt ACTIVE thì vào thẳng Không Gian Quán /chu-quan, chưa duyệt PENDING thì từ chối đăng nhập và báo chờ Admin duyệt).
- [x] Quản lý món ăn cho Chủ Quán: Cho phép tải ảnh trực tiếp từ máy tính/điện thoại (< 3MB) hoặc chọn từ kho lưu trữ ảnh món ngon đặc sản Ea Súp sổ ra.
- [x] Tự động điền Họ tên và Số điện thoại của Khách hàng khi mở form Đặt Món và Đặt Bàn tại quán.
- [x] Tích hợp hệ thống Email thông báo tự động ngay lập tức qua Nodemailer cho Khách hàng, Chủ quán và Admin (`Lehanhkt01@gmail.com`).
- [x] Đồng bộ số liệu Admin (Khách hàng, Chủ quán, Cán bộ khớp 100% với danh sách quán) & Bổ sung thông tin Quán ăn/Chủ quán chi tiết kèm hotline trên từng món ăn.
- [x] Tối ưu tính năng Lắc Món: hiển thị đầy đủ thông tin quán ăn; nút "Mở bàn" khóa cố định quán đã lắc trúng, chỉ hiển thị thực đơn món của quán đó (độc quyền 1 quán duy nhất).
- [x] Nâng cấp giao diện "Mở bàn mới": Tên quán ăn nằm phía trên (đánh dấu nền đỏ + số lượng món khi được chọn), phía dưới là các món ăn (chọn được nhiều món), cảnh báo nhắc nhở khi chọn món ở 2 quán ăn trở lên kèm nút xử lý nhanh.
- [x] Tối ưu Modal Đăng Nhập: Đưa nút "Đăng Nhập Bằng Google (Gmail)" lên trên cùng tab Khách, loại bỏ hoàn toàn form nhập thủ công (Gmail & Họ tên) để thao tác nhanh 1 chạm.
- [x] Tối ưu Form Mở Bàn Mới (Quán ăn dạng List thanh mảnh chỉ hiện khi có món chọn, đổi nhãn "Chọn món ăn", bổ sung ô "Số điện thoại liên hệ") & Ẩn hoàn toàn banner Chủ quán trên giao diện Khách hàng.
- [x] Bổ sung ô nhập Tọa độ bản đồ du lịch (GPS) khi đăng ký Chủ Quán, tích hợp icon ánh mắt ẩn/hiện mật khẩu, khắc phục triệt để lỗi tài khoản Chủ Quán chưa được duyệt vẫn đăng nhập được, và tối ưu giao diện Mobile Navbar (đưa nút vào menu 3 gạch, rút gọn tên tài khoản chỉ hiện Avatar và Quán/Khách).
- [x] Sửa triệt để lỗi đăng nhập Google OAuth (Missing client_id), tối ưu nút "Rủ nhau đi" & "Lắc món" vừa 1 dòng trên mobile, ẩn nút "+ Đăng ký quán của bạn" khi là Khách, và làm nổi bật tab "Khám phá món" nền xanh chữ trắng / khi chọn đổi màu đỏ.
- [x] Cho phép Chủ quán thay đổi ảnh bìa quán (tải ảnh máy tính/điện thoại < 3MB hoặc chọn từ kho ảnh Ea Súp), và chuẩn hoá toàn bộ các từ "ăn" thành "ăn/uống" phù hợp cho cả món ăn và giải khát.
- [ ] Mở rộng tính năng bình luận và đánh giá món ăn/quán ăn cho du khách.

## 8. Lưu ý quan trọng

- Không commit file `.env` (mật khẩu lưu trong Bitwarden, Secure Note `ENV_HE_THONG_EASUPSO`).
- Build trên VPS đã bỏ ESLint, dùng `npm ci --legacy-peer-deps --no-audit`.
- Commit message dùng tiếng Việt không dấu theo kiểu `feat: ...`, `fix: ...`, `style(...): ...`.
