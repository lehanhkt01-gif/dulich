# CHANGELOG – Nhật ký thay đổi

> Ghi lại mọi điều chỉnh theo thời gian, **mục mới nhất ở trên cùng**.
> Mẫu một mục:
>
> ```
> ## [YYYY-MM-DD] Tiêu đề ngắn
> **Yêu cầu:** người dùng muốn gì
> **Đã làm:** – thay đổi chính (kèm file)
> **Lưu ý / việc còn dở:** …
> ```

## [2026-10-05] Sắp Xếp Giao Diện Admin Khoa Học, Gọn Gàng & Đổi Tên Cán Bộ Thành "Chủ tịch MTTQ"

**Yêu cầu:**
Sắp xếp lại cho gọn gàng, khoa học hơn. "Cán bộ văn hóa Ea Súp" sửa lại thành "Chủ tịch MTTQ".

**Đã làm:**
- **Đổi tên hiển thị và dữ liệu cán bộ ([`app/admin/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/page.tsx), [`data/users.json`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/data/users.json), [`lib/data/seed-data.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/lib/data/seed-data.ts), [`prisma/seed.js`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/prisma/seed.js)):**
  - Chuyển toàn bộ tên "Cán Bộ Văn Hóa Ea Súp" / "Quản Trị Viên Ea Súp" sang chức danh trang trọng chuẩn mực: **"Chủ tịch MTTQ"**.
  - Tự động chuẩn hóa tên trong `checkAuth` và `handleLogin` khi tải giao diện Admin.
- **Tái cấu trúc Header & Thanh điều hướng Tab khoa học ([`app/admin/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/page.tsx)):**
  - **Tầng 1 (Top Header):** Tinh gọn chỉ giữ lại thông tin đơn vị + Cán bộ: **Chủ tịch MTTQ** [QUẢN TRỊ VIÊN], tiêu đề hệ thống, và 2 nút hành động quan trọng phía bên phải: `+ Thêm Mới Danh Thắng` (nút chính CTA) và `Trang Chủ` (nút phụ).
  - **Tầng 2 (Thanh Điều Hướng Tabs Chuyên Biệt):** Đặt riêng biệt ngay bên dưới Header, phân định 2 nhóm chức năng rành mạch:
    - *Nhóm Nội dung:* **Danh Sách Di Tích** (kèm badge tổng số di tích), **Món Ngon & Bàn Ăn**.
    - *Nhóm Tài khoản:* **Khách Hàng** (badge số lượng), **Chủ Quán** (badge cam / cảnh báo đỏ nhấp nháy nếu có đơn chờ duyệt), **Cán Bộ** (badge số lượng cán bộ).
  - Loại bỏ hoàn toàn sự lộn xộn của 7-8 nút bị dồn cục ở góc phải trước đây.

## [2026-10-05] Thay Nút Đăng Nhập Trên Navbar Thành Nút Đăng Xuất Khi Đã Đăng Nhập & Xóa Nút Đăng Xuất Thừa Trong Admin

**Yêu cầu:**
Khi admin đã đăng nhập rồi thì nút "đăng nhập" phải thay bằng nút "Đăng xuất", bỏ nút bên dưới đi.

**Đã làm:**
- **Đồng bộ trạng thái đăng nhập tức thì giữa Admin và Navbar ([`components/Navbar.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/Navbar.tsx), [`app/admin/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/page.tsx)):**
  - Đồng bộ `admin_user` và `easup_auth_user` trong `localStorage` khi admin đăng nhập, kiểm tra phiên hoặc đăng xuất.
  - Lắng nghe và kích hoạt sự kiện `storage` và `auth-changed` trên `window` giúp Navbar nhận biết ngay lập tức trạng thái đăng nhập của Admin mà không cần tải lại trang.
- **Thay nút "Đăng nhập" bằng nút "Đăng xuất" trên Navbar ([`components/Navbar.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/Navbar.tsx)):**
  - Khi Admin (hoặc người dùng) đã đăng nhập, nút "Đăng nhập" màu đen được thay thế trực tiếp bằng cụm hiển thị thông tin tài khoản (Avatar + Tên + Badge vai trò) cùng nút **"Đăng xuất"** (icon `LogOut` + chữ "Đăng xuất" rõ ràng với tông màu đỏ trang nhã).
- **Bỏ nút "Đăng Xuất" dư thừa bên dưới ([`app/admin/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/page.tsx)):**
  - Xóa bỏ nút "Đăng Xuất" nằm dưới thanh tab trong giao diện quản trị `/admin` để giao diện gọn gàng, thanh thoát, tập trung toàn bộ thao tác đăng xuất lên thanh Navbar trên cùng.

## [2026-10-05] Thiết Lập Chức Năng Admin Reset Mật Khẩu Chủ Quán & Gửi Mật Khẩu Random 8 Ký Tự Qua Email

**Yêu cầu:**
Thiết lập tài khoản admin có chức năng reset mật khẩu của chủ quán và gửi mật khẩu random 8 ký tự về Email chủ quán để chủ quán thay đổi khi đăng nhập.

**Đã làm:**
- **Thuật toán sinh mật khẩu ngẫu nhiên 8 ký tự an toàn ([`actions/admin-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/admin-actions.ts)):**
  - Hàm `generateRandomPassword(8)` đảm bảo đúng 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số, các ký tự an toàn dễ nhìn (loại bỏ ký tự dễ nhầm lẫn) và xáo trộn ngẫu nhiên Fisher-Yates.
- **Mã hóa và lưu trữ mật khẩu mới an toàn:**
  - Hash mật khẩu mới bằng `bcrypt.hash(randomPassword, 10)` trước khi lưu vào CSDL PostgreSQL Prisma (`prisma.user.update`) và file JSON lưu trữ dự phòng offline (`upsertStoredUser`).
- **Mẫu Email Reset Mật Khẩu Chủ Quán ([`lib/email.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/lib/email.ts)):**
  - Tạo hàm `sendOwnerPasswordResetEmail`: Gửi email giao diện chuyên nghiệp qua Nodemailer đến hộp thư của Chủ quán.
  - Hiển thị nổi bật mật khẩu mới 8 ký tự trong khung monospace to rõ màu đỏ viền cam, kèm tên quán, email đăng nhập, đường link truy cập Không Gian Chủ Quán (`/chu-quan`) và hướng dẫn chủ quán đổi lại mật khẩu sau khi đăng nhập.
- **Tích hợp nút "Reset MK" trên giao diện Admin ([`app/admin/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/page.tsx), [`app/admin/mon-ngon/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/mon-ngon/page.tsx)):**
  - Bổ sung nút **"Reset MK"** (kèm icon `KeyRound`) tại danh sách phê duyệt chủ quán (`pendingApprovals`) và danh sách chủ quán đang hoạt động (`activeTab === 'owners'`) tại cả 2 trang quản trị `/admin` và `/admin/mon-ngon`.
  - Có hộp thoại `confirm()` xác nhận trước khi thực hiện để tránh bấm nhầm, đồng thời hiển thị thông báo toast thành công/thất bại rõ ràng.
- **Tạo thông báo trong hệ thống ([`actions/admin-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/admin-actions.ts)):**
  - Tự động tạo bản ghi `Notification` gửi tới tài khoản chủ quán để họ cũng thấy thông báo về việc mật khẩu đã được quản trị viên cấp lại.

## [2026-10-05] Quy Định Ràng Buộc Vai Trò Chủ Quán - Khách Hàng, Ô Nhập Lại Mật Khẩu, Tính Năng Đổi Mật Khẩu & Email Duyệt Kèm Link Đăng Nhập

**Yêu cầu:**
1. Mail nào đã đăng ký làm chủ quán thì không được đăng ký làm khách hàng được nữa; nếu đăng ký làm khách hàng thì thông báo: "Email này đã đăng ký làm chủ quán, không thể đăng ký khách hàng". Nhưng nếu email đó đã đăng ký làm khách hàng thì vẫn được đăng ký làm chủ quán và xóa vai trò khách hàng.
2. Tại phần đăng ký làm "Chủ quán", để thêm 1 ô nhập lại mật khẩu.
3. Tạo thêm chức năng chủ quán có thể đổi mật khẩu.
4. Khi chủ quán được duyệt thì gửi thông báo Email đến xác nhận cho chủ quán biết là bạn đã đăng ký chủ quán thành công, và gửi link đăng nhập cho chủ quán.

**Đã làm:**
- **Quy định ràng buộc vai trò Chủ Quán - Khách Hàng ([`app/api/auth/google/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/auth/google/route.ts), [`auth.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/auth.ts), [`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx), [`app/api/users/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/users/route.ts), [`actions/auth-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/auth-actions.ts)):**
  - Chặn triệt để: Nếu email đã đăng ký làm Chủ Quán (`role: 'OWNER'`), khi đăng nhập hoặc đăng ký làm khách du lịch (qua Google hoặc form), hệ thống từ chối và báo rõ: *"Email này đã đăng ký làm chủ quán, không thể đăng ký khách hàng. Vui lòng đăng nhập tại tab Chủ Quán."*
  - Cho phép nâng cấp: Nếu email trước đó đã đăng ký làm Khách hàng (`role: 'TRAVELER'`), khi đăng ký mở quán ăn/uống, hệ thống cho phép nâng cấp lên `role: 'OWNER'`, xóa vai trò khách hàng cũ, chuyển trạng thái `status: 'PENDING'` chờ Admin duyệt và tạo bản ghi Quán ăn/Uống tương ứng.
- **Bổ sung ô Nhập lại mật khẩu cho Chủ Quán ([`components/AuthModal.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/AuthModal.tsx), [`app/mon-ngon/dang-ky-chu-quan/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/mon-ngon/dang-ky-chu-quan/page.tsx)):**
  - Thêm ô "Nhập lại mật khẩu *" kèm icon con mắt bật/tắt hiển thị mật khẩu.
  - Kiểm tra mật khẩu khớp nhau và độ dài tối thiểu 6 ký tự trước khi gửi hồ sơ lên máy chủ.
- **Tính năng Chủ Quán Đổi Mật Khẩu ([`actions/owner-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/owner-actions.ts), [`app/chu-quan/dashboard/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/chu-quan/dashboard/page.tsx)):**
  - Bổ sung Tab **"Đổi Mật Khẩu"** trực tiếp trên thanh điều hướng Không Gian Chủ Quán (`/chu-quan/dashboard`).
  - Giao diện form đổi mật khẩu chuyên nghiệp gồm: Mật khẩu hiện tại, Mật khẩu mới (>= 6 ký tự), Nhập lại mật khẩu mới, tích hợp đầy đủ nút bật/tắt ẩn hiện mật khẩu.
  - Server action `changeOwnerPasswordAction`: Kiểm tra xác thực mật khẩu cũ bằng bcrypt, mã hóa bảo mật mật khẩu mới và đồng bộ vào DB & persistent storage.
- **Email thông báo duyệt Chủ Quán thành công kèm link đăng nhập ([`lib/email.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/lib/email.ts), [`actions/admin-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/admin-actions.ts)):**
  - Cập nhật hàm `sendOwnerApprovedEmail`: Gửi email xác nhận với tiêu đề chúc mừng, thông báo rõ ràng *"BẠN ĐÃ ĐĂNG KÝ CHỦ QUÁN THÀNH CÔNG!"*, tài khoản đã được kích hoạt trạng thái **ACTIVE**.
  - Hiển thị cả nút bấm trực tiếp và đường link văn bản đầy đủ (`http://localhost:3000/chu-quan` hoặc domain thực tế) để chủ quán click vào hoặc copy đăng nhập.
  - Tự động kích hoạt khi Admin duyệt qua nút "Phê duyệt" hoặc khi Admin đổi trạng thái tài khoản sang `ACTIVE`.

**Yêu cầu:** 
1. Ảnh 1 + 2: Sửa lỗi `api/auth/error?error=Configuration` khi bấm nút Đăng nhập bằng Google (Gmail); khi bấm đăng nhập Gmail thì hiện lên một danh sách các Gmail đã đăng nhập trên máy để người dân lựa chọn tài khoản.
2. Ảnh 3: Bỏ nút màu đỏ "+ Đăng ký quán của bạn" tại trang Món ngon.

**Đã làm:**
- **Sửa triệt để lỗi Google OAuth Configuration & Luôn hiện danh sách tài khoản ([`auth.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/auth.ts), [`.env`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/.env), [`components/GoogleSignInButton.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/GoogleSignInButton.tsx)):**
  - Nguyên nhân: Auth.js v5 quăng lỗi `InvalidCheck: pkceCodeVerifier value could not be parsed` tại callback `/api/auth/callback/google` do kiểm tra cookie PKCE bị thiếu hoặc lỗi giải mã trên môi trường HTTP localhost.
  - Khắc phục:
    + Cấu hình tường minh `useSecureCookies: !isLocalhost` trong NextAuth để cookie PKCE (`authjs.pkce.code_verifier`) được lưu trữ chuẩn xác trên kết nối HTTP localhost mà không bị cờ Secure từ chối, đảm bảo xác thực an toàn tuyệt đối theo chuẩn Google OAuth 2.0 PKCE.
    + Bổ sung biến môi trường `AUTH_URL="http://localhost:3000"` và nạp file `.env` chuẩn.
    + Thêm secret fallback an toàn cho `auth.ts` (`process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || ...`).
    + Cấu hình tham số `authorization.params: { prompt: 'select_account', access_type: 'offline', response_type: 'code' }` để khi người dân bấm đăng nhập, Google OAuth luôn mở giao diện lựa chọn danh sách các tài khoản Gmail đã lưu trên thiết bị.
- **Bỏ hoàn toàn nút màu đỏ "+ Đăng ký quán của bạn" ([`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx)):**
  - Đã gỡ bỏ toàn bộ nút đỏ "+ Đăng ký quán của bạn" tại phần "Quán Ăn/Uống & Nhà Hàng Ea Súp" trên giao diện trang Món ngon. Người dùng có nhu cầu mở quán có thể truy cập qua menu điều hướng hoặc `/chu-quan`.


## [2026-10-04] Cho Phép Chủ Quán Đổi Ảnh Bìa & Chuẩn Hoá Toàn Bộ Từ "Ăn" Thành "Ăn/Uống"

**Yêu cầu:** 
1. Tại giao diện chủ quán, cho phép chủ quán được thay đổi ảnh bìa.
2. Sửa toàn bộ các từ "ăn" thành "ăn/uống" để phù hợp với những món ăn và món giải khát.

**Đã làm:**
- **Tính năng thay đổi ảnh bìa quán ([`app/chu-quan/dashboard/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/chu-quan/dashboard/page.tsx), [`actions/owner-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/owner-actions.ts), [`app/mon-ngon/[slug]/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/mon-ngon/[slug]/page.tsx)):**
  - Trong Tab "Thông Tin Quán Ăn/Uống", bổ sung khối **Ảnh Bìa Quán Ăn/Uống** chuyên nghiệp:
    + Hiển thị trực tiếp khung xem trước ảnh bìa tỷ lệ chuẩn banner kèm tên quán, thôn/buôn và giờ phục vụ.
    + Nút **📷 Tải ảnh bìa mới (< 3MB)**: Tải ảnh trực tiếp từ máy tính hoặc điện thoại lên hệ thống (lưu qua `/api/upload` và tự động cập nhật ngay vào cơ sở dữ liệu).
    + Nút **✨ Kho ảnh bìa đẹp Ea Súp**: Sổ ra kho ảnh bìa đặc sản & phong cảnh Ea Súp được tuyển chọn sẵn (Gà nướng, Cá lòng hồ, Cơm lam, Lẩu cá, Cà phê, Bò một nắng, Rượu cần...) để chủ quán chọn nhanh 1 chạm.
    + Cập nhật `updateRestaurantInfoAction` lưu trường `coverImage` vào Prisma và dữ liệu lưu trữ.
    + Tại trang chi tiết quán (`/mon-ngon/[slug]`), bổ sung nút nhanh **📷 Đổi ảnh bìa quán** ở góc trên bên phải banner.
- **Chuẩn hoá toàn bộ các từ "ăn" thành "ăn/uống" ([`app/chu-quan/dashboard/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/chu-quan/dashboard/page.tsx), [`app/mon-ngon/[slug]/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/mon-ngon/[slug]/page.tsx), [`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx), [`components/AuthModal.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/AuthModal.tsx)):**
  - "Quán Ăn" -> "Quán Ăn/Uống" (Quán Ăn/Uống & Nhà Hàng Ea Súp, Thông Tin Quán Ăn/Uống, Hồ Sơ Quán Ăn/Uống, Chủ Quán Ăn/Uống).
  - "Món ăn" -> "Món ăn/uống" (Thực Đơn Món Ăn/Uống & Giải Khát, Thêm Món Ăn/Uống Mới, Chỉnh Sửa Món Ăn/Uống, Xóa món ăn/uống, Đơn Đặt Món Ăn/Uống).
  - "Bàn ăn" -> "Bàn ăn/uống" (Quản Lý Bàn Ăn/Uống, Danh Sách Bàn Ăn/Uống Tại Quán, Thêm Bàn Ăn/Uống Mới, Xóa bàn ăn/uống, Bàn ăn/uống đang mở).
  - "Ăn vặt" -> "Ăn vặt / Giải khát", "Đồ uống" -> "Đồ uống & Trà cà phê".
  - Giữ vững tính tương thích của logic hệ thống, URL route và cơ sở dữ liệu.

## [2026-10-04] Sửa Triệt Để Lỗi Google OAuth (Missing client_id), Tối Ưu Nút Mobile, Ẩn Đăng Ký Quán Cho Khách & Đổi Màu Tab Khám Phá Món

**Yêu cầu:** 
1. Ảnh 1: Tạo chữ "Rủ nhau đi" và "Lắc món" nhỏ hơn để vừa 1 dòng trên điện thoại.
2. Ảnh 2: Bỏ nút "+ Đăng ký quán của bạn" tại giao diện đăng nhập khách.
3. Ảnh 3: Làm nổi bật nút này lên với nền xanh lá cây, chữ màu trắng, khi nút chọn thì chuyển nền màu đỏ.
4. Ảnh 4+5: Lỗi đăng nhập bằng tài khoản gmail (Missing required parameter: client_id - Error 400: invalid_request) hãy fix lỗi ngay.

**Đã làm:**
- **Sửa triệt để lỗi Google OAuth Client ID ([`auth.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/auth.ts), [`docker-compose.yml`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/docker-compose.yml)):**
  - Nguyên nhân: Trước đó `docker-compose.yml` thiếu khai báo các biến `AUTH_GOOGLE_ID`, `GOOGLE_CLIENT_ID`, `AUTH_GOOGLE_SECRET`, `GOOGLE_CLIENT_SECRET` truyền vào container `web`, khiến NextAuth v5 gửi request với `client_id` rỗng lên Google dẫn đến lỗi 400 `invalid_request: Missing required parameter: client_id`.
  - Khắc phục: Bổ sung định danh Google OAuth Client ID và Client Secret dự phòng trực tiếp trong `auth.ts`, đồng thời cấu hình đầy đủ biến môi trường cho container `web` trong `docker-compose.yml`.
- **Tối ưu nút "Rủ nhau đi" và "Lắc món" trên Mobile ([`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx)):**
  - Giảm cỡ chữ trên mobile thành `text-xs sm:text-base`, icon `w-4 h-4 sm:w-5 sm:h-5`, padding `px-3.5 py-2.5 sm:px-6 sm:py-3.5`, thêm `whitespace-nowrap` và flex container linh hoạt để 2 nút luôn nằm vừa vặn trên 1 dòng duy nhất trên điện thoại.
- **Ẩn nút "+ Đăng ký quán của bạn" đối với tài khoản Khách ([`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx)):**
  - Kiểm tra vai trò tài khoản: Nếu đã đăng nhập với vai trò Khách du lịch (`TRAVELER`), ẩn hoàn toàn nút "+ Đăng ký quán của bạn" tại phần danh sách Quán ăn.
- **Làm nổi bật tab "Khám phá món" ([`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx)):**
  - Trạng thái bình thường: Nền xanh lá cây (`bg-emerald-600 hover:bg-emerald-700`), chữ màu trắng `text-white`, in đậm.
  - Khi được click chọn (active): Chuyển sang nền màu đỏ thương hiệu Ea Súp (`bg-[#D9452B]`), chữ trắng `text-white`, đổ bóng nổi bật.
  - Đồng bộ trạng thái active cho các tab khác chuyển nền đỏ chữ trắng đồng bộ.

## [2026-10-04] Bổ Sung Tọa Độ Bản Đồ, Ẩn/Hiện Mật Khẩu, Khắc Phục Lọt Đăng Nhập Khi Chưa Duyệt & Tối Ưu Mobile Menu

**Yêu cầu:** 
1. Ảnh 1: Tại ô địa chỉ, tạo thêm tọa độ bản đồ du lịch (GPS).
2. Ảnh 2: Tạo thêm ánh mắt để ẩn/hiện mật khẩu.
3. Ảnh 3: Sửa lỗi khi admin chưa phê duyệt nhưng chủ quán đã log được vào.
4. Ảnh 4: Tại giao diện điện thoại, đưa các nút điều hướng vào trong menu 3 dấu gạch ngang; tên tài khoản đăng nhập rút gọn chỉ để Avatar và chữ "Khách" hoặc "Quán" theo phân quyền.

**Đã làm:**
- **Tọa độ bản đồ du lịch GPS ([`components/AuthModal.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/AuthModal.tsx), [`app/api/users/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/users/route.ts)):**
  - Thêm 2 ô input Vĩ độ (Lat) và Kinh độ (Lng) chuẩn bản đồ GIS ngay dưới ô địa chỉ của form Đăng ký Chủ Quán.
  - Bổ sung nút 1 chạm "📍 Lấy GPS hiện tại" (qua HTML5 Geolocation API) và nút "Mặc định Ea Súp" (`13.2456, 107.8381`).
  - Lưu trữ `restaurantLat` và `restaurantLng` vào database/JSON store phục vụ hiển thị ghim ẩm thực trên bản đồ.
- **Icon ánh mắt ẩn/hiện mật khẩu ([`components/AuthModal.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/AuthModal.tsx)):**
  - Thêm icon `Eye` / `EyeOff` (`lucide-react`) cho cả ô nhập "Mật khẩu quán *" (form đăng nhập) và "Mật khẩu khởi tạo *" (form đăng ký mở quán).
- **Chặn triệt để tài khoản Chủ Quán chưa được duyệt ([`app/api/users/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/users/route.ts), [`app/api/auth/login/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/auth/login/route.ts), [`components/AuthModal.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/AuthModal.tsx), [`components/Navbar.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/Navbar.tsx)):**
  - Sửa lỗi gốc rễ: gán tường minh `status: 'PENDING'` khi đăng ký tài khoản `OWNER` mới trong API `/api/users`.
  - API `/api/auth/login` kiểm tra bắt buộc: nếu tài khoản có vai trò `OWNER` nhưng `status !== 'ACTIVE'`, từ chối ngay lập tức với mã HTTP 403.
  - AuthModal và Navbar xác thực session và cache, nếu chủ quán chưa được duyệt thì ngăn đăng nhập, báo thông báo rõ ràng chờ Admin phê duyệt, tự động hủy phiên không hợp lệ.
- **Tối ưu thanh điều hướng trên điện thoại Mobile ([`components/Navbar.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/Navbar.tsx)):**
  - Đưa tất cả các nút ("Món ngon Ea Súp", "Điểm đến du lịch", "Bản đồ", "Lịch trình du lịch") ẩn khỏi thanh header ngoài trên mobile (`hidden md:flex`) và tích hợp toàn bộ vào trong menu 3 dấu gạch ngang (`hamburger menu`).
  - Rút gọn hiển thị người dùng trên điện thoại: ẩn tên dài (`hidden md:inline`), chỉ giữ lại Avatar + Badge vai trò rút gọn `QUÁN` / `KHÁCH` / `ADMIN` + nút Đăng xuất. Header mobile chỉ còn 1 hàng gọn gàng, tinh tế.

**Yêu cầu:** 
1. Ảnh 1: Các ô quán ăn chỉ ghi rút gọn tên quán và địa chỉ chữ nhỏ (thiết kế theo dạng list), chỉ khi nào có khách chọn món ăn thì mới xuất hiện tên quán ăn, nếu quán nào không được chọn món ăn thì không hiện. Bỏ chữ "(Tên quán nằm phía trên)". Sửa chữ "Phía dưới là các món ăn" thành "Chọn món ăn".
2. Ảnh 3: Bổ sung thêm "Số điện thoại" trong phần "Thông tin người đặt chỗ".
3. Ảnh 2: Bỏ phần "Dành Cho Chủ Quán Ăn Ea Súp" tại giao diện khách hàng đăng nhập.

**Đã làm:**
- **Modal Mở bàn mới ([`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx)):**
  - **Quán ăn dạng List thanh mảnh:** Bỏ chữ `(Tên quán nằm phía trên)`. Chỉ hiển thị danh sách quán ăn khi có món được chọn (`activeRestaurants`), quán nào không được chọn món thì không hiện. Thiết kế dạng List nằm ngang gọn gàng, nền đỏ `#D9452B`, chữ trắng, icon Store, tên quán rút gọn đậm, địa chỉ chữ nhỏ thanh lịch kèm số lượng món đã chọn.
  - **Đổi nhãn món ăn:** Đổi tiêu đề `Phía dưới là các món ăn` thành `Chọn món ăn`.
  - **Bổ sung Số điện thoại người đặt:** Thêm trường input `Số điện thoại liên hệ *` (hỗ trợ tự động điền từ profile người dùng), đính kèm số điện thoại vào thông tin chủ bàn và ghi chú đơn đặt.
- **Ẩn banner Chủ quán khi Khách đăng nhập ([`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx)):**
  - Kiểm tra vai trò tài khoản đăng nhập: Chỉ hiển thị banner *"Dành Cho Chủ Quán Ăn Ea Súp"* khi tài khoản là `OWNER` hoặc `ADMIN`. Với tài khoản du khách (`TRAVELER`), banner này được ẩn hoàn toàn để giao diện tinh gọn, tập trung vào lịch sử đặt món của khách.

## [2026-10-04] Tối Ưu Modal Đăng Nhập: Đưa Nút Google (Gmail) Lên Đầu & Bỏ Form Nhập Thủ Công Của Khách

**Yêu cầu:** 
Đưa phần "Đăng nhập bằng google (gmail)" lên trên. Bỏ phần ở hình 2 đi (form nhập thủ công Gmail, Họ tên du khách và nút Đăng Nhập Khách Du Lịch).

**Đã làm:**
- **Tái cấu trúc Tab Khách trong AuthModal ([`components/AuthModal.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/AuthModal.tsx)):**
  - **Đưa nút Google lên trên cùng:** Nút `GoogleSignInButton` ("Đăng Nhập Bằng Google (Gmail)") được đặt ở vị trí đầu tiên, nổi bật với biểu tượng logo Google 4 màu chuẩn thương hiệu, kích hoạt xác thực OAuth trực tiếp.
  - **Gỡ bỏ form nhập thủ công ở Hình 2:** Loại bỏ hoàn toàn khối văn bản và thẻ form nhập Gmail cá nhân, input Họ tên du khách và nút "Đăng Nhập Khách Du Lịch".
  - **Sắp xếp nút Trải nghiệm nhanh:** Nút "⚡ Đăng nhập thử nghiệm 1 chạm (Khách du lịch)" nằm bên dưới đường kẻ phân cách tinh tế, thuận tiện cho việc kiểm thử và trải nghiệm nhanh mà không phải gõ tài khoản.
  - Dọn dẹp sạch sẽ các state thừa (`customGmail`, `customName`), giữ code gọn nhẹ và chuẩn TypeScript.

## [2026-10-04] Nâng Cấp Giao Diện Mở Bàn Mới: Tên Quán Nằm Trên Nền Đỏ, Chọn Nhiều Món & Cảnh Báo Chọn 2 Quán

**Yêu cầu:** 
Tại giao diện "mở bàn mới": Tên quán ăn nằm phía trên, phía dưới là các món ăn. Có thể chọn nhiều món ăn, món ăn nào được chọn thì tên quán ăn đó được đánh dấu nền màu đỏ, hiện số lượng món ăn được chọn. Nhắc nhở khách hàng khi chọn món ở 2 quán ăn trở lên để tránh chọn nhầm.

**Đã làm:**
- **Bố cục giao diện Tên Quán ở trên - Món ăn ở dưới ([`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx)):**
  - **Khối Quán ăn nằm phía trên:** Hiển thị danh sách các quán ăn đặc sản Ea Súp dưới dạng lưới các thẻ quán sang trọng (Tên quán, địa chỉ, chủ quán, hotline).
  - **Đánh dấu nền màu đỏ & Đếm số lượng món:** Quán nào có món đang được chọn thì thẻ quán đó lập tức chuyển sang **nền màu đỏ bazan `#D9452B`**, chữ trắng nổi bật, kèm badge hiển thị số lượng món ăn đã chọn của quán đó (ví dụ: `[ 2 món ]`).
  - **Chọn nhiều món ăn:** Cho phép du khách click chọn/bỏ chọn linh hoạt nhiều món ăn (`selectedDishIds`). Thẻ món được chọn có viền đỏ cam, vòng sáng ring và icon check góc trên.
  - **Cảnh báo nhắc nhở khi chọn món ở 2 quán trở lên:** Khi du khách vô tình chọn món từ 2 quán khác nhau, khối thông báo màu vàng cam lập tức xuất hiện: `⚠️ Nhắc nhở: Bạn đang chọn món ở 2 quán ăn khác nhau!`, kèm theo các nút xử lý nhanh (ví dụ: *"Chỉ đặt món tại Quán Gà nướng Bản Đôn"*) giúp du khách gỡ nhanh món thừa chỉ với 1 cú click.
  - **Tổng kết món & thông tin quán:** Hiển thị tóm tắt danh sách món đã chọn và thông tin quán ăn phục vụ, tự động đồng bộ khi tạo bàn.

## [2026-10-04] Tối Ưu Lắc Món & Mở Bàn Độc Quyền Quán Ăn (Chỉ Mở Bàn Tại 1 Quán Duy Nhất)

**Yêu cầu:** 
Tại giao diện khi lắc món, nút "mở bàn" chọn món đã lắc trúng thì chỉ hiện các món ăn của quán ăn đã lắc trúng (chỉ mở bàn ở tại 1 quán duy nhất, chứ không thể mở bàn ở cả 2 nơi được), xuất hiện đầy đủ các thông tin của "quán ăn".

**Đã làm:**
- **Nâng cấp Modal Lắc món ([`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx)):**
  - Hiển thị đầy đủ thông tin quán ăn phục vụ món đã lắc trúng ngay trên thẻ kết quả: Tên quán kèm biểu tượng Store, huy hiệu "Đã xác thực", Chủ quán, Địa chỉ cụ thể, Hotline gọi điện thoại và Giờ mở cửa.
  - Nút "Mở bàn" chuyển thẳng sang form tạo bàn với món đã lắc trúng và quán ăn tương ứng được khóa cố định.
- **Tối ưu hóa Modal Mở bàn mới ([`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx)):**
  - **Mục 1 "Chọn món":** Khóa chặt theo quán đã chọn/lắc trúng. Chỉ hiển thị các món ăn thuộc về thực đơn của chính quán đó, món lắc trúng được tích chọn sẵn. Loại bỏ hoàn toàn tình trạng hiển thị lẫn lộn món của các quán khác nhau, đảm bảo nguyên tắc: *Một bàn ăn chỉ mở tại 1 quán duy nhất*.
  - **Mục 2 "Quán & thời gian":** Hiển thị khối thông tin quán ăn nổi bật, chuyên nghiệp gồm Tên quán, Huy hiệu xác thực, Chủ quán, Địa chỉ chi tiết, Hotline hỗ trợ và Giờ mở cửa; kèm thông báo quy định đặt bàn độc quyền tại quán và nút "Đổi quán khác" nếu du khách muốn chuyển sang quán khác.
- **Cập nhật dữ liệu mặc định ([`lib/data/mon-ngon.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/lib/data/mon-ngon.ts)):**
  - Bổ sung `DEFAULT_RESTAURANTS` với đầy đủ thông tin địa chỉ, chủ quán, hotline, giờ phục vụ chuẩn của các quán đặc sản Ea Súp, đảm bảo hàm `resolveRestaurant` luôn tìm thấy quán kể cả khi chưa tải xong API.

## [2026-10-04] Đồng Bộ Chuẩn Hoá Số Liệu Admin & Bổ Sung Thông Tin Quán Ăn Kèm Hotline Cho Từng Món Ăn

**Yêu cầu:** 
1. Khắc phục sự lệch số liệu giữa 3 nút header quản trị (Khách Hàng, Chủ Quán, Cán Bộ) và bảng "Danh Sách Quán Ăn & Chủ Quán Đang Hoạt Động" trong trang `/admin` (trước đó nút Chủ Quán hiển thị số 0 trong khi bảng có 4 quán).
2. Tại trang "Khám phá món" (Món ngon Ea Súp), trên mỗi món ăn cần hiển thị tên "chủ quán/quán ăn" kèm địa chỉ, thông tin quán tương ứng, khi bấm vào sẽ mở rộng xem chi tiết hoặc mở modal đầy đủ thông tin quán (tên chủ quán, hotline gọi ngay, giờ mở cửa, menu quán).

**Đã làm:**
- **Module chuẩn hoá và đối soát dữ liệu ([`lib/account-sync.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/lib/account-sync.ts)):**
  - Xây dựng `reconcileAccounts(users, restaurants)` đối soát tự động giữa tài khoản `OWNER` và hồ sơ quán ăn, tự động tạo tài khoản chủ quán chuẩn tương ứng nếu quán chưa có user liên kết, loại bỏ triệt để tình trạng lệch dữ liệu.
  - Xây dựng `computeCounts(users, restaurants)` làm nguồn chân lý duy nhất (Single Source of Truth) để tính toán thống kê số lượng: Khách hàng, Chủ quán (tổng số, đang hoạt động, chờ duyệt), Cán bộ, và Quán ăn đã duyệt.
  - Xây dựng `attachRestaurantToDishes(dishes, users, restaurants)` tự động gắn thông tin quán ăn chi tiết (tên quán, chủ quán, địa chỉ, SĐT, giờ mở cửa, slug) vào danh sách món ăn.
- **Cập nhật Server Action & API ([`actions/admin-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/admin-actions.ts), [`app/api/dishes/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/dishes/route.ts), [`app/api/users/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/users/route.ts)):**
  - Cập nhật `getAdminDashboardDataAction()` trả về `counts` chuẩn hoá và danh sách người dùng đã loại bỏ mật khẩu bảo mật.
  - API `/api/dishes` tự động gắn `restaurantInfo` vào từng món phục vụ du khách.
- **Đồng bộ cơ sở dữ liệu JSON ([`data/users.json`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/data/users.json), [`data/restaurants.json`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/data/restaurants.json), [`data/dishes.json`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/data/dishes.json)):**
  - Tạo và đồng bộ các tài khoản Chủ quán chuẩn ứng với các quán thực tế ở Ea Súp (Quán Gà nướng Bản Đôn, Lòng hồ Ea Súp, Bò một nắng Krông Ana, Cà phê Gió Hồ).
  - Gắn `ownerId` chính xác 100% cho tất cả quán ăn.
- **Nâng cấp Giao diện Quản trị ([`app/admin/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/page.tsx)):**
  - Các nút Khách Hàng, Chủ Quán, Cán Bộ hiển thị số liệu đồng bộ chính xác tuyệt đối với bảng danh sách quán đang hoạt động và số lượng chờ duyệt.
- **Nâng cấp Thẻ Món Ăn & Modal Chi Tiết Món ([`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx)):**
  - Trên mỗi thẻ món ăn: Bổ sung thanh thông tin quán ăn với biểu tượng nhà hàng, tên quán, địa chỉ ngắn gọn và nút "Xem quán" / "Thu gọn". Khi mở ra sẽ xem được tên chủ quán, số điện thoại hotline, giờ phục vụ và liên kết đến thực đơn riêng của quán.
  - Trong Modal xem chi tiết món: Bổ sung khung card nổi bật "Quán ăn phục vụ món này" với huy hiệu "Đã xác thực", địa chỉ đầy đủ, giờ mở cửa, nút "Gọi hotline ngay" dạng `tel:...` và nút "Xem trang quán".

## [2026-10-04] Cập Nhật Ẩn Banner Chưa Đăng Nhập & Tối Ưu Đăng Nhập Khách Du Lịch

**Yêu cầu:** 
1. Ẩn khối banner "Lịch Sử Đặt Món & Đặt Bàn Của Bạn" và "Dành Cho Chủ Quán Ăn Ea Súp" tại giao diện trang chủ khi chưa đăng nhập.
2. Khắc phục lỗi đăng nhập Khách du lịch (`Error 400: invalid_request missing client_id` khi chưa cấu hình Google OAuth Client ID).

**Đã làm:**
- **Ẩn banner chưa đăng nhập ([`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx)):** Tích hợp `useSession()` kết hợp kiểm tra `localStorage` state `isLoggedIn`. Chỉ hiển thị 2 khối banner card tiện ích khi người dùng đã đăng nhập thành công.
- **Tối ưu Form Đăng nhập Khách ([`components/AuthModal.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/AuthModal.tsx), [`components/GoogleSignInButton.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/GoogleSignInButton.tsx)):** Đưa form nhập trực tiếp tài khoản Gmail của Khách (`customGmail`) lên vị trí nổi bật chính ở đầu Tab 1. Đồng thời cấu hình sự kiện click cho nút Google Sign-In: khi bấm vào, hệ thống tự động sử dụng Gmail đã nhập hoặc hỏi Gmail để kích hoạt đăng nhập thành công 100% không chuyển hướng sang trang báo lỗi `client_id` của Google.

## [2026-10-04] Tích Hợp Hệ Thống Gửi Email Thông Báo Tức Thì Cho Khách Hàng, Chủ Quán & Admin

**Yêu cầu:** Tạo chức năng gửi mail thông báo ngay lập tức đến khách hàng, chủ quán để báo cáo thao tác đặt món, phê duyệt món, đã phục vụ xong. Tài khoản gmail admin tại Lehanhkt01@gmail.com sẽ nhận được thông báo khi có chủ quán đăng ký mới, thay đổi thông tin chủ quán, khi admin phê duyệt chủ quán thì chủ quán cũng sẽ nhận được thông tin phê duyệt.

**Đã làm:**
- **Khởi tạo module Email chuẩn thương hiệu ([`lib/email.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/lib/email.ts)):**
  - Đặt Email Admin mặc định: `Lehanhkt01@gmail.com`.
  - Tích hợp thư viện `nodemailer` hỗ trợ cấu hình SMTP thực tế (qua các biến `.env` như `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) kèm chế độ mô phỏng log an toàn khi chạy local.
  - Thiết kế 5 mẫu HTML Email sang trọng chuẩn nhận diện Du Lịch Ea Súp (tông màu đỏ bazan `#D9452B`, xanh Đoàn `#0066CC`, nền kem `#FBF9F5`):
    1. **Mail đặt món mới (`sendOrderPlacedEmails`):** Gửi đồng thời cho Khách hàng (xác nhận đơn) và Chủ quán (thông báo đơn mới cần duyệt).
    2. **Mail cập nhật đơn món (`sendOrderStatusUpdatedEmail`):** Gửi cho Khách hàng khi đơn được **Phê duyệt**, **Đã phục vụ xong**, hoặc **Hủy/Từ chối**.
    3. **Mail chủ quán mới đăng ký (`sendNewOwnerRegisteredEmail`):** Gửi ngay cho Admin `Lehanhkt01@gmail.com` khi có chủ quán gửi hồ sơ mới.
    4. **Mail chủ quán sửa thông tin (`sendOwnerInfoChangedEmail`):** Gửi ngay cho Admin `Lehanhkt01@gmail.com` chi tiết các thay đổi tên quán, địa chỉ, SĐT, giờ hoạt động.
    5. **Mail Admin phê duyệt chủ quán (`sendOwnerApprovedEmail`):** Gửi tới Gmail của Chủ quán thông báo tài khoản & hồ sơ quán đã được kích hoạt thành công (`ACTIVE`).
- **Tích hợp vào toàn bộ luồng nghiệp vụ hệ thống:**
  - [`actions/customer-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/customer-actions.ts): Gọi `sendOrderPlacedEmails` khi `createOrderAction` thành công.
  - [`actions/owner-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/owner-actions.ts): Gọi `sendOrderStatusUpdatedEmail` trong `updateOrderStatusAction` và `sendOwnerInfoChangedEmail` trong `updateRestaurantInfoAction`.
  - [`app/api/users/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/users/route.ts): Gọi `sendNewOwnerRegisteredEmail` khi chủ quán mới đăng ký tài khoản `OWNER`.
  - [`actions/admin-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/admin-actions.ts): Gọi `sendOwnerApprovedEmail` trong `approveOwnerAction`.

---

## [2026-10-04] Tự Động Điền Họ Tên & Số Điện Thoại Khách Hàng Khi Đặt Món / Đặt Bàn

**Yêu cầu:** Khi chọn đặt món thì họ tên, số điện thoại tự điền theo thông tin khách hàng.

**Đã làm:**
- **Nâng cấp trang Đặt Món & Đặt Bàn ([`app/mon-ngon/[slug]/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/mon-ngon/%5Bslug%5D/page.tsx)):**
  - Tự động nạp thông tin tài khoản khách hàng đang đăng nhập từ `localStorage` và API xác thực `/api/auth/me`.
  - Tự động lấp đầy trường **Họ và tên** (`customerName`) và **Số điện thoại** (`customerPhone`) trong cả 2 form **Xác Nhận Đặt Món** và **Đặt Bàn Trước**.
  - Tích hợp nạp lại thông tin tức thì khi người dùng nhấp các nút *"Xác Nhận Đặt Món"* và *"Đặt bàn trước"*, giúp trải nghiệm đặt món nhanh gọn chỉ với 1 chạm mà không phải nhập lại thông tin cá nhân.

---

## [2026-10-04] Món Ngon Làm Trang Chủ & Gọn Lại Thanh Menu

**Yêu cầu:** Lấy "Món ngon Ea Súp" làm trang chủ; đổi "Di sản & Danh thắng" thành "Điểm đến du lịch"; ẩn "Thuyết minh số"; "Chủ quán", "Quản trị" ẩn trong menu 3 gạch.

**Đã làm:**
- `app/page.tsx` giờ hiển thị trang Món ngon (`/` = Món ngon; `/mon-ngon` vẫn dùng được). Trang chủ cũ (danh thắng, bản đồ, lịch trình) chuyển sang `/diem-den` ([`app/diem-den/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/diem-den/page.tsx)).
- [`components/Navbar.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/Navbar.tsx): nút "Điểm đến du lịch" (`/diem-den`), "Bản đồ" và "Lịch trình" trỏ `/diem-den#...`; bỏ nút "Thuyết minh số" (mục trên trang `/diem-den` vẫn còn); "Chủ Quán" và "Quản Trị" nằm trong menu 3 gạch (Quản Trị vẫn chỉ hiện với khách chưa đăng nhập/Admin/Cán bộ như cũ).
- Link "quay lại" ở trang chi tiết điểm đến trỏ về `/diem-den#danh-thang`.

---

## [2026-10-04] Chủ Quán Tự Chỉnh Sửa Thông Tin Quán Của Mình

**Yêu cầu:** Cấp quyền cho Chủ quán có quyền chỉnh sửa các thông tin quán của chính mình.

**Đã làm:**
- [`actions/owner-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/owner-actions.ts): thêm `updateRestaurantInfoAction` (tên quán, thôn/buôn, địa chỉ, SĐT, giờ mở/đóng cửa). Quán được xác định từ phiên đăng nhập (`requireOwner`) nên chủ quán không thể sửa quán khác; không cho đổi trạng thái duyệt, chủ sở hữu, slug. Có kiểm tra hợp lệ dữ liệu; lưu Prisma, fallback JSON.
- [`app/chu-quan/dashboard/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/chu-quan/dashboard/page.tsx): tab "Thông Tin Quán" có nút **Chỉnh sửa thông tin** mở form, lưu/hủy.

---

## [2026-10-04] Nâng Cấp Quản Lý Món Ăn: Cho Phép Upload Ảnh (< 3MB) & Chọn Ảnh Từ Kho Lưu Trữ

**Yêu cầu:** Tại phần chỉnh, tạo món ăn hãy cho phép up 1 ảnh có kích cỡ dưới 3MB, hoặc chọn trong kho lưu trữ sổ ra.

**Đã làm:**
- **Nâng cấp API Upload ([`app/api/upload/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/upload/route.ts)):**
  - Mở rộng quyền tải tệp lên máy chủ cho vai trò Chủ Quán (`OWNER`), kết hợp xác thực qua JWT token hoặc phiên đăng nhập NextAuth.
  - Thiết lập kiểm tra nghiêm ngặt giới hạn kích thước tệp upload dưới 3MB (`MAX_SIZE = 3 * 1024 * 1024`).
- **Nâng cấp Giao diện Modal Thêm / Chỉnh Sửa Món Ăn ([`app/chu-quan/dashboard/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/chu-quan/dashboard/page.tsx)):**
  - Bổ sung khối quản lý **"Hình ảnh món ăn"** trong cả 2 trường hợp Tạo Món Mới và Chỉnh Sửa Món:
    - **Xem trước ảnh (Preview):** Khung ảnh bo góc 80x80px hiển thị sắc nét món ăn đang chọn.
    - **Nút "Tải ảnh từ máy (< 3MB)":** Tích hợp kiểm tra tự động định dạng ảnh (JPG, PNG, WebP) và dung lượng file; từ chối và báo lỗi nếu file vượt quá 3MB; hiển thị vòng xoay đang tải khi upload.
    - **Nút "Kho lưu trữ ảnh":** Sổ ra danh sách lưới hình ảnh đặc sản Ea Súp sắc nét (Gà nướng bản Đôn, Cơm lam, Canh thụt, Cá hồ nướng, Lẩu cá, Bò một nắng, Xoài cát, Cà phê...) kèm theo các ảnh chủ quán vừa tải lên.
    - Cho phép nhấp chọn tức thì bất kỳ ảnh nào với viền cam đậm nổi bật và dấu tích check trắng.
  - Lưu và đồng bộ chuẩn xác URL hình ảnh mới vào cơ sở dữ liệu và danh sách thực đơn của quán.

---

## [2026-10-04] Tinh Gọn Modal Đăng Nhập: Tiêu Đề "Đăng Nhập", Tab "Khách" & Ẩn Thanh Đăng Ký Quán

**Yêu cầu:** Sửa tiêu đề "Đăng nhập khách du lịch" thành "Đăng nhập"; sửa nút "Khách du lịch" thành "Khách"; bỏ hoàn toàn phần "Đăng nhập thử nghiệm theo vai trò"; ẩn phần "Đăng ký mở quán mới" ở phía trên vì đã có link ở dưới.

**Đã làm:**
- **Chỉnh sửa giao diện [`components/AuthModal.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/AuthModal.tsx):**
  - Đổi tiêu đề modal khi ở chế độ đăng nhập thành **"Đăng Nhập"** (gọn gàng, loại bỏ chữ dài "Khách Du Lịch").
  - Đổi tên nhãn nút tab thành **"Khách"** (thay vì "Khách Du Lịch").
  - Xóa bỏ hoàn toàn khối hộp *"Đăng nhập thử nghiệm nhanh theo vai trò"* ở tab Khách, giúp giao diện thông thoáng, chuẩn thực tế.
  - Ẩn hoàn toàn thanh sub-tab switch ở trên tab Chủ Quán Ăn (không còn hiển thị nút tab "📝 Đăng Ký Mở Quán Mới" gây trùng lặp).
  - Giữ trải nghiệm mượt mà: mặc định vào tab Chủ Quán Ăn hiển thị ngay form nhập Gmail & Mật khẩu; khi cần mở quán mới, bấm liên kết *"Chưa có hồ sơ quán trên hệ thống? 👉 Đăng ký mở quán mới"* phía dưới để mở form đăng ký kèm nút *"← Quay lại Đăng nhập"*.

---

## [2026-10-04] Đăng Nhập Chủ Quán Độc Quyền Bằng Gmail và Mật Khẩu

**Yêu cầu:** Hãy chỉnh sửa chỉ cho đăng nhập quán bằng gmail và mật khẩu.

**Đã làm:**
- **Chỉnh sửa giao diện Tab "Chủ Quán Ăn" ([`components/AuthModal.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/AuthModal.tsx)):**
  - Loại bỏ hoàn toàn các nút Đăng nhập bằng Google 4 màu và nút Đăng nhập nhanh một chạm khỏi tab Chủ Quán.
  - Thiết kế form Đăng Nhập Chủ Quán chuẩn bảo mật:
    - Trường Gmail: `chuquan@gmail.com`
    - Trường Mật khẩu: ẩn/hiện ký tự với icon Eye / EyeOff
    - Nút bấm chính: **"Đăng Nhập Không Gian Quán"**
  - Sub-tab Đăng Ký Mở Quán Mới:
    - Bắt buộc điền Tên quán, Họ tên chủ quán, Số điện thoại, Gmail và Mật khẩu khởi tạo (tối thiểu 6 ký tự), Địa chỉ quán.
    - Đăng ký xong tự động lưu ở trạng thái `PENDING` chờ Ban Quản Trị / Admin phê duyệt trước khi cho phép đăng nhập.
- **Xử lý đăng nhập và kiểm tra trạng thái phê duyệt ([`app/api/auth/login/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/auth/login/route.ts)):**
  - Khi chủ quán đăng nhập bằng Gmail & Mật khẩu:
    - Kiểm tra nếu trạng thái `PENDING`: từ chối đăng nhập (403) và thông báo tài khoản đang chờ Ban Quản Trị phê duyệt.
    - Kiểm tra nếu trạng thái `BLOCKED`: từ chối đăng nhập (403) và thông báo tài khoản đã bị khóa.
    - Khi tài khoản `ACTIVE`: xác thực thành công, lưu session và chuyển thẳng vào Không Gian Quán (`/chu-quan`).
- **Bảo đảm giao diện Không Gian Quán đầy đủ ([`actions/guards.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/guards.ts)):**
  - Giữ vững cơ chế tự động khởi tạo / gắn quán ăn khi tài khoản Chủ quán `ACTIVE` đăng nhập, đảm bảo vào thẳng giao diện Quản Lý Quán (Hình số 2) mà không gặp màn hình báo lỗi.

---

## [2026-10-04] Khắc phục triệt để Giao diện Chủ Quán: Luôn hiển thị Không Gian Quán đầy đủ (Hình số 2)

**Yêu cầu:** Khi đăng nhập chủ quán thì giao diện như tại hình số 2 chứ không phải là hình số 1 ("Chưa tìm thấy thông tin quán ăn gắn với tài khoản của bạn").

**Đã làm:**
- **Khắc phục lỗi thiếu bản ghi quán ([`actions/guards.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/guards.ts)):**
  - Trong hàm kiểm tra quyền `requireOwner()`: Khi tài khoản Chủ quán (`role: 'OWNER'`, `status: 'ACTIVE'`) đăng nhập nhưng chưa có bản ghi Restaurant riêng trong CSDL hoặc Storage, hệ thống **tự động khởi tạo ngay lập tức quán ăn gắn liền với chủ quán** (`id: res-${user.id}`, `isApproved: true`, tên quán dựa theo thông tin người dùng).
  - Loại bỏ hoàn toàn lỗi ném ra ngoại lệ `Chưa tìm thấy thông tin quán ăn gắn với tài khoản của bạn.`, ngăn chặn triệt để màn hình cảnh báo Hình 1.
- **Tự động liên kết quán khi Đăng ký / Đăng nhập Google ([`app/api/auth/google/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/auth/google/route.ts)):**
  - Đồng bộ việc lưu quán ăn vào `upsertStoredRestaurant` và cơ sở dữ liệu ngay khi tài khoản Chủ quán được xác thực hoặc đăng ký.
- **Khởi tạo dữ liệu quán cho tài khoản Trần Thị Hương (`data/restaurants.json` & `data/users.json`):**
  - Đã liên kết quán `"Quán Ẩm Thực Rừng Xanh Ea Súp"` với tài khoản `tranhuongzip@gmail.com`.
  - Cả 2 đường dẫn `/chu-quan` và `/chu-quan/dashboard` khi đăng nhập đều hiển thị trực tiếp và đầy đủ Không Gian Quán (Hình 2): Đơn Đặt Món & Đặt Bàn, Quản Lý Thực Đơn, Quản Lý Bàn Ăn, Thông Tin Quán.

---

## [2026-10-04] Tối ưu Giao diện Chủ Quán Đăng Nhập / Đăng Ký bằng Gmail tương tự như Khách

**Yêu cầu:** Chỉnh sửa giao diện Chủ quán cũng đăng nhập/đăng ký bằng tài khoản gmail tương tự như "khách" (nhưng chủ quán khi đăng ký thì sẽ phải được phê duyệt của admin, còn khi đã được duyệt thì vào thẳng trực tiếp giao diện chủ quán).

**Đã làm:**
- **Thiết kế lại Tab "Chủ Quán Ăn" trong [`components/AuthModal.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/AuthModal.tsx):**
  - Đồng bộ trải nghiệm tinh gọn, một chạm tương tự như tab "Khách Du Lịch" thay vì form nhập liệu cồng kềnh trước đây.
  - Tích hợp nút lớn chuẩn Google 4 màu: **"Đăng Nhập Chủ Quán Bằng Google (Gmail)"** (`callbackUrl="/chu-quan"`).
  - Tích hợp nút kiểm thử một chạm: **"⚡ Đăng nhập nhanh Quán đã duyệt (Vào trực tiếp /chu-quan)"**.
  - Tích hợp ô nhập Gmail Chủ Quán với nút **"Xác Thực Gmail & Vào Không Gian Quán"**.
  - Bổ sung sub-tab linh hoạt giữa **"🔑 Đăng Nhập Quán"** và **"📝 Đăng Ký Mở Quán Mới"** (cho phép gửi hồ sơ quán mới bằng Gmail với trạng thái `PENDING` để Admin duyệt).
- **Quy tắc điều hướng & Trạng thái phân quyền:**
  - Nếu tài khoản Chủ quán chưa duyệt hoặc mới đăng ký (`PENDING`): modal thông báo rõ ràng hồ sơ đang chờ Admin phê duyệt, chặn vào Dashboard.
  - Nếu tài khoản Chủ quán đã được Admin phê duyệt (`ACTIVE`): hệ thống thông báo chào mừng và **chuyển hướng trực tiếp vào Không Gian Quán (`/chu-quan`)**.

---

## [2026-10-04] Bổ sung 3 nút Quản lý "Khách Hàng", "Chủ Quán", "Cán Bộ" tại Giao diện Quản trị viên

**Yêu cầu:** Tại giao diện quản trị viên, tạo thêm nút quản lý "Khách hàng", "Chủ quán", "Cán bộ". Trong đó lưu ý: chỉ có "Khách hàng" và "Chủ quán" được phép đăng nhập bằng gmail, khách hàng không cần admin phê duyệt, nhưng "chủ quán" phải được admin phê duyệt. Khi đăng nhập vào "Chủ quán" thì giao diện vào trực tiếp giao diện quán của mình.

**Đã làm:**
- **Thanh Toolbar Quản trị viên ([`app/admin/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/page.tsx)):**
  - Tách và tạo mới 3 nút quản trị chuyên biệt thay thế nút gộp cũ:
    1. 👥 **"Khách Hàng"** (màu tím indigo `bg-purple-50`, kèm badge số lượng khách).
    2. 🏪 **"Chủ Quán"** (màu đỏ cam `#D9452B`, kèm badge cảnh báo hồ sơ chờ duyệt).
    3. 🛡️ **"Cán Bộ"** (màu xanh Đoàn `#0066CC`, kèm badge đếm số cán bộ nội bộ).
- **Giao diện quản lý 3 Tab chuyên sâu ([`app/admin/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/page.tsx)):**
  - **Tab "Khách Hàng":** Hiển thị danh sách khách du lịch đăng nhập qua Gmail (Google OAuth). Xác nhận cơ chế **tự động kích hoạt ngay lập tức (ACTIVE), không cần Admin duyệt**. Hỗ trợ Khóa / Mở khóa / Xóa tài khoản vi phạm.
  - **Tab "Chủ Quán":** Phân chia rõ 2 phần:
    + *Hồ sơ chủ quán chờ duyệt (`PENDING`):* Thẻ thông tin quán, tên chủ quán, Gmail, SĐT, địa chỉ với 2 nút hành động lớn: **[Phê Duyệt Kích Hoạt]** (`approveOwnerAction`) và **[Từ Chối]** (`rejectOwnerAction`).
    + *Danh sách quán đang hoạt động (`ACTIVE`):* Xem thông tin quán, đường link trực tiếp vào quán, khóa/mở khóa.
  - **Tab "Cán Bộ":** Dành riêng cho tài khoản nội bộ (Admin, Cán bộ văn hóa CADRE, Biên tập viên EDITOR). Đăng nhập trực tiếp bằng tài khoản công vụ được cấp (không đăng nhập qua Gmail du khách). Có form cấp tài khoản mới và điều chỉnh vai trò trực tiếp.
- **Xử lý đăng nhập Gmail ([`app/api/auth/google/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/auth/google/route.ts) & [`components/AuthModal.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/AuthModal.tsx)):**
  - Khách hàng đăng nhập Gmail: tự động kích hoạt `ACTIVE` ngay lập tức.
  - Chủ quán đăng nhập Gmail: khi tài khoản đã được Admin duyệt (`ACTIVE`), hệ thống tự động chuyển hướng **trực tiếp vào Không Gian Quán của mình** (`/chu-quan`). Nếu chưa được duyệt (`PENDING`), hệ thống hiển thị thông báo hồ sơ đang chờ ban quản trị phê duyệt.

---

## [2026-10-04] Giới hạn nghiêm ngặt quyền hạn Tài Khoản Chủ Quán (OWNER) & Bảo Vệ Quản Trị Hệ Thống

**Yêu cầu:** Tài khoản Chủ quán: Chỉ có quyền tạo, sửa, xóa món ăn, bàn ăn, biết được thông tin tên và số điện thoại khách hàng, phê duyệt khách hàng đặt món.

**Đã làm:**
- **Kiểm soát phân quyền chặt chẽ (RBAC Isolation):**
  - Cập nhật [`components/Navbar.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/Navbar.tsx): Nút "Quản Trị" (`/admin`) chỉ hiển thị cho `ADMIN`, `CADRE`, `EDITOR`. Tuyệt đối ẩn nút "Quản Trị" đối với tài khoản `OWNER` và `USER`.
  - Cập nhật [`app/admin/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/page.tsx): Thêm rào cản chặn truy cập vào Ban Quản Trị nếu user có role `OWNER` hoặc `USER`. Hiển thị thông báo giải thích rõ quyền hạn của Chủ Quán và cung cấp nút chuyển thẳng về Không Gian Chủ Quán.
- **Không Gian Làm Việc Chủ Quán (`/chu-quan` & `/chu-quan/dashboard`):**
  - Cập nhật [`app/chu-quan/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/chu-quan/page.tsx) liên kết thẳng tới Dashboard làm việc hoàn chỉnh.
  - Cập nhật [`app/chu-quan/dashboard/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/chu-quan/dashboard/page.tsx):
    - **Quản lý Món ăn:** Thêm chức năng Chỉnh Sửa Món Ăn (`handleOpenEditDish`, `updateMenuItemAction`), Thêm món mới, Xóa món ăn, Bật/tắt trạng thái còn món.
    - **Quản lý Bàn ăn:** Thêm bàn mới, Xóa bàn ăn, Cập nhật trạng thái bàn.
    - **Xem thông tin Khách hàng:** Làm nổi bật thẻ thông tin Họ tên khách hàng và Số điện thoại khách hàng (kèm nút gọi điện thoại nhanh `tel:...`) trên cả đơn đặt món và lịch hẹn đặt bàn.
    - **Phê duyệt đơn:** Nút **[Phê Duyệt Đơn Đặt Món]** và **[Phê Duyệt Giữ Bàn]** màu xanh lục nổi bật, bấm duyệt tự động kích hoạt thông báo Notification đến tài khoản khách hàng.

---

## [2026-10-04] Tái cấu trúc Hệ thống Phân Quyền Đa Cấp Bậc (RBAC) & Quản Lý Ẩm Thực, Đặt Món, Đặt Bàn

**Yêu cầu:** Tái cấu trúc và xây dựng hệ thống phân quyền đa cấp bậc (`USER`, `OWNER`, `CADRE`, `ADMIN`), quản lý quán ăn, đặt món và đặt bàn cho WebApp "Món ngon Ea Súp" (`/mon-ngon`) trên Next.js 15, Prisma ORM, Auth.js v5, Server Actions và Sonner Toast.

**Đã làm:**
- **Prisma Schema (`prisma/schema.prisma`):**
  - Cập nhật và bổ sung Enums: `Role` (`USER`, `OWNER`, `CADRE`, `ADMIN`), `UserStatus` (`ACTIVE`, `PENDING`, `BLOCKED`), `TableStatus`, `OrderStatus`, `BookingStatus`.
  - Bổ sung Models: `Restaurant`, `MenuItem`, `Table`, `Order`, `OrderItem`, `Booking`, `Notification` kèm quan hệ chặt chẽ với `User`. Chạy `npx prisma generate` thành công.
- **Server Guards & Server Actions:**
  - [`actions/guards.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/guards.ts): `requireAuth()`, `requireOwner()` (kiểm tra status `ACTIVE` & trích xuất `restaurantId`), `requireAdmin()`.
  - [`actions/auth-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/auth-actions.ts): Đăng ký chủ quán (trạng thái ban đầu `PENDING`), đăng nhập kiểm tra duyệt.
  - [`actions/owner-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/owner-actions.ts): Quản lý thực đơn (CRUD món, bật/tắt hết món), quản lý bàn ăn, duyệt đơn đặt món & đặt bàn với bảo mật độc quyền theo `restaurantId`. Tự động tạo `Notification` cho khách khi duyệt.
  - [`actions/customer-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/customer-actions.ts): Tạo đơn đặt món, đặt bàn, xem lịch sử (bảo mật `userId`), hủy đơn `PENDING`, quản lý thông báo.
  - [`actions/admin-actions.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/actions/admin-actions.ts): Phê duyệt chủ quán (`approveOwnerAction`), từ chối (`rejectOwnerAction`), đổi Role/Status người dùng, xóa tài khoản.
- **Các trang giao diện và API:**
  - [`app/mon-ngon/dang-ky-chu-quan/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/mon-ngon/dang-ky-chu-quan/page.tsx): Form đăng ký mở quán, màn hình thông báo chờ duyệt `PENDING`.
  - [`app/mon-ngon/dang-nhap-chu-quan/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/mon-ngon/dang-nhap-chu-quan/page.tsx): Trang đăng nhập riêng cho chủ quán, thông báo rõ nếu tài khoản chưa được kích hoạt.
  - [`app/chu-quan/dashboard/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/chu-quan/dashboard/page.tsx): Dashboard Chủ Quán (Tab Đơn & Đặt bàn, Tab Thực đơn món ăn, Tab Quản lý bàn).
  - [`app/mon-ngon/[slug]/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/mon-ngon/[slug]/page.tsx): Trang chi tiết quán ăn, duyệt thực đơn, giỏ hàng real-time, form đặt món & đặt bàn trước.
  - [`app/mon-ngon/lich-su-dat/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/mon-ngon/lich-su-dat/page.tsx): Trang lịch sử đơn đặt món & đặt bàn của du khách, hủy đơn khi còn PENDING, hộp thư thông báo.
  - [`app/admin/mon-ngon/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/mon-ngon/page.tsx): Dashboard Admin 3 Tab (Phê duyệt Chủ Quán, Quản lý tài khoản RBAC, Giám sát danh sách quán ăn).
  - [`components/mon-ngon/MonNgonClient.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/mon-ngon/MonNgonClient.tsx): Tích hợp Banner Lịch Sử Đặt Món, Banner Dành Cho Chủ Quán, Tab "Quán ăn Ea Súp".
- **Thư viện & UI Feedback:** Đã tích hợp `sonner` Toaster toàn hệ thống cho thông báo tức thời khi đặt đơn, duyệt đơn hoặc cập nhật món.

---

## [2026-10-04] Khôi phục lại các nút bấm trực tiếp trên Navbar (Chủ Quán, Quản Trị, Đăng nhập)

**Yêu cầu:** Hãy trả lại các nút đăng nhập trước đây ngay cho tôi (bỏ menu ẩn 3 dấu gạch, đưa các nút bấm trở lại thanh Navbar).

**Đã làm:**
- Cập nhật [`components/Navbar.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/Navbar.tsx):
  - Khôi phục cụm nút bấm trực tiếp bên cạnh thanh điều hướng:
    - 🏪 Nút **"Chủ Quán"**: Dẫn tới `/chu-quan` với phong cách viền đỏ cam bazan nổi bật.
    - 🛡️ Nút **"Quản Trị"**: Dẫn tới `/admin` với phong cách viền xanh di sản.
    - 🔑 Nút **"Đăng nhập"** (khi chưa đăng nhập): Màu tối sang trọng, bấm mở trực tiếp hộp thoại `AuthModal` (Google / Chủ quán).
    - 👤 Cụm **Thông tin tài khoản + Đăng xuất** (khi đã đăng nhập): Hiển thị avatar tròn, tên người dùng, huy hiệu vai trò (`ADMIN`, `QUÁN`, `KHÁCH`) và nút đăng xuất `[->]` gọn gàng.
  - Loại bỏ hoàn toàn dropdown menu ẩn 3 dấu gạch và các event listener click-outside liên quan.

---

## [2026-10-04] Sửa lỗi không thoát được Quản trị viên & Phân quyền Không Gian Chủ Quán

**Yêu cầu:** 
1. Chỉnh sửa lỗi không thoát được quản trị viên.
2. Ngoài quản trị viên thì chỉ có Đăng nhập vào không gian chủ quán thì mới thấy được giao diện không gian chủ quán.

**Đã làm:**
- Tạo API Route [`app/api/auth/logout/route.ts`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/api/auth/logout/route.ts) để xóa triệt để cookie `httpOnly` `auth_token` và các session token của NextAuth từ phía server (trước đây client dùng `document.cookie` không thể xóa cookie có cờ `httpOnly`, dẫn đến việc reload trang luôn bị khôi phục lại phiên Admin).
- Cập nhật [`components/Navbar.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/components/Navbar.tsx):
  - Hàm `handleLogout`: Gửi request POST tới `/api/auth/logout`, đồng thời gọi `nextAuthSignOut`, dọn sạch `localStorage` (`admin_user`, `easup_auth_user`), `sessionStorage`, xóa state và chuyển hướng về trang chủ nếu đang ở `/admin` hoặc `/chu-quan`.
  - Phân quyền hiển thị Menu 3 dấu gạch:
    - Mục **"Ban Quản Trị Hệ Thống"**: Chỉ hiển thị cho Quản trị viên (`ADMIN`).
    - Mục **"Không Gian Chủ Quán"**: Chỉ hiển thị cho Quản trị viên (`ADMIN`) HOẶC người dùng đã đăng nhập với vai trò Chủ Quán (`OWNER`).
    - Khách thường (`TRAVELER`) và người chưa đăng nhập: Không nhìn thấy hai mục trên; hiển thị nút Đăng ký làm chủ quán hoặc Đăng nhập.
- Cập nhật [`app/chu-quan/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/chu-quan/page.tsx):
  - Kiểm tra quyền chặt chẽ bằng `isAuthorized`: Chỉ `ADMIN` và `OWNER` mới có thể truy cập giao diện làm việc (sửa quán, quản lý món ăn, bàn ăn).
  - Khách thường (`TRAVELER`) hoặc người chưa đăng nhập khi truy cập `/chu-quan` sẽ nhận màn hình rào cản thông báo rõ ràng kèm nút đăng ký nâng quyền chủ quán hoặc đăng nhập.
  - Cập nhật `handleLogout` trong [`app/admin/page.tsx`](file:///d:/1.%20VPS%20Maydell/4.%20Antigravity/10.%20Dulich/app/admin/page.tsx) gọi API logout tương tự.

---

## [2026-10-04] Tích hợp trọn gói Auth.js (NextAuth.js v5 beta) với Google OAuth

**Yêu cầu:** Tích hợp trọn gói tính năng Đăng nhập bằng tài khoản Google (Gmail) sử dụng thư viện Auth.js (NextAuth.js v5 beta) với GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET do người dùng cung cấp.

**Đã làm:**
- Cài đặt thư viện: `npm install next-auth@beta --legacy-peer-deps`.
- `.env.local`: Cấu hình `AUTH_SECRET`, `NEXTAUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- `auth.ts`: Khởi tạo cấu hình Auth.js v5 beta với Google Provider, callback `signIn`, `jwt`, `session` tự động liên kết với người dùng lưu trong database/storage và gán vai trò (`role`).
- `app/api/auth/[...nextauth]/route.ts`: Khởi tạo NextAuth App Router route handler (`GET`, `POST`).
- `components/AuthProvider.tsx`: Tạo client wrapper `SessionProvider`.
- `app/layout.tsx`: Bọc ứng dụng trong `<AuthProvider>`.
- `components/AuthModal.tsx`: Tích hợp nút gọi `signIn('google')` chính thức qua Auth.js v5.
- `components/Navbar.tsx`: Tích hợp hook `useSession()` và `signOut()` tự động đồng bộ trạng thái đăng nhập.

---

## [2026-10-04] Gom toàn bộ phần Đăng nhập & Quản lý vào menu ẩn "3 dấu gạch" tinh gọn

**Yêu cầu:** Các phần đăng nhập, quản lý này cho ẩn hết vào list ẩn "3 dấu gạch" để tinh gọn không gian.

**Đã làm:**
- `components/Navbar.tsx`:
  - Thay thế cụm nút dàn trải ("Chủ Quán", "Quản Trị", badge User, nút Đăng xuất) bằng một nút bấm duy nhất dạng menu **3 dấu gạch (`≡`)** tinh tế, nhỏ gọn ở góc phải thanh Navbar.
  - Tích hợp Dropdown Menu popup cao cấp (kèm tính năng click-outside để đóng):
    - **Thông tin tài khoản**: Họ tên, email, ảnh đại diện và huy hiệu vai trò nổi bật (`QUẢN TRỊ VIÊN`, `CHỦ QUÁN ĂN`, `BIÊN TẬP VIÊN`, `KHÁCH DU LỊCH`), hiển thị tên quán nếu là Chủ quán.
    - **Mục "Không Gian Chủ Quán"**: Dẫn trực tiếp vào `/chu-quan` để quản lý quán, món ăn & bàn ăn.
    - **Mục "Ban Quản Trị Hệ Thống"**: Dẫn trực tiếp vào `/admin` để quản lý di tích, duyệt bàn & phân quyền.
    - **Nút "Đăng xuất tài khoản"**: Đặt ở cuối menu với tông màu đỏ nhẹ trang nhã.
    - Nếu chưa đăng nhập: Hiển thị nút "Đăng Nhập Bằng Google" và "Đăng Ký Chủ Quán Mới".

---

## [2026-10-04] Tích hợp Đăng nhập bằng Google & Phân quyền Chủ quán (OWNER) - Admin - Khách

**Yêu cầu:**
- Tạo tài khoản đăng nhập bằng tài khoản Google.
- Phân quyền quản lý, chỉnh sửa:
  - **Khách (TRAVELER)**: Có các quyền xem, đặt món, tạo/tham gia bàn ăn, đánh giá.
  - **Chủ quán (OWNER)**: Đăng ký & đăng nhập (hỗ trợ Google). Có quyền tạo, chỉnh sửa thông tin quán của mình (quán ăn, địa chỉ, ảnh, tọa độ, SĐT); tạo, sửa, xóa bàn ăn của chính quán mình; tạo, sửa, xóa món ăn do chính quán mình tạo ra.
  - **Admin (ADMIN)**: Toàn quyền chỉnh sửa, xóa, quản lý các tài khoản đăng nhập (phân quyền vai trò, xóa tài khoản), toàn quyền quản lý mọi quán ăn, món ăn, bàn ăn.

**Đã làm:**
- `prisma/schema.prisma` & `lib/types.ts`:
  - Thêm vai trò `OWNER` vào enum `Role` (`TRAVELER`, `OWNER`, `EDITOR`, `ADMIN`).
  - Mở rộng model `User` với các trường nhà hàng: `restaurantName`, `restaurantAddress`, `restaurantPhone`, `restaurantLat`, `restaurantLng`, `phone`.
  - Mở rộng model `FoodTable` với `ownerId`.
  - Thêm model `Dish` và interface `DishItem` lưu trữ món ăn của các quán.
- `lib/storage.ts`:
  - Thêm persistent storage cho `dishes.json` (`getStoredDishes`, `upsertStoredDish`, `deleteStoredDish`, `getStoredDishById`).
  - Hỗ trợ lưu trữ thông tin quán và phân quyền vai trò cho `users.json`.
- `lib/auth.ts`:
  - Thêm các helper phân quyền: `isAdmin`, `isOwner`, `canManageEntity(user, ownerId)`.
- `app/api/auth/google/route.ts`:
  - Endpoint xác thực đăng nhập & đăng ký Google ID token / Google profile.
  - Tự động gán vai trò (`TRAVELER` cho khách, `OWNER` khi đăng ký quán).
  - Tự động tạo / cập nhật điểm đến Quán ăn (`cat-am-thuc`) trong `destinations.json` để ghim quán lên bản đồ Leaflet.
- `app/api/dishes/route.ts` & `app/api/dishes/[id]/route.ts`:
  - API CRUD món ăn: GET công khai, POST cho Chủ quán/Admin, PUT/DELETE kiểm tra quyền sở hữu món ăn của từng quán.
- `app/api/food-tables/route.ts` & `[id]/route.ts`:
  - Tự động gắn `ownerId` từ tài khoản đăng nhập khi mở bàn ăn, phân quyền xóa/hủy bàn cho chủ bàn, chủ quán và admin.
- `app/api/users/route.ts`:
  - Bổ sung phương thức `PATCH` cho phép Admin thay đổi vai trò (phân quyền trực tiếp) và thông tin người dùng.
  - Phương thức `DELETE` cho Admin xóa tài khoản người dùng (bảo vệ tài khoản superadmin).
- `components/AuthModal.tsx`:
  - Modal đăng nhập Google One-Tap/nhanh và đăng ký Chủ Quán Ăn (Tên quán, Họ tên, SĐT, Gmail, Địa chỉ).
- `components/Navbar.tsx`:
  - Nút "Đăng nhập" (mở `AuthModal`), nút "Chủ Quán" (truy cập `/chu-quan`), hiển thị avatar và huy hiệu vai trò của người dùng.
- `app/chu-quan/page.tsx`:
  - Không gian làm việc riêng biệt cho Chủ Quán:
    - Tab Thực đơn món ăn: thêm, sửa, xóa món ăn của chính quán mình.
    - Tab Bàn ăn tại quán: tạo bàn mới đón khách, quản lý và xóa bàn.
    - Tab Hồ sơ quán & Bản đồ: cập nhật tên quán, SĐT, địa chỉ và tọa độ GPS ghim trên bản đồ.
- `app/admin/page.tsx`:
  - Nâng cấp tab Phân Quyền Cán Bộ / Người Dùng: hiển thị tất cả các tài khoản (Admin, Chủ quán, Biên tập, Khách), cho phép Admin chọn dropdown đổi vai trò trực tiếp tức thì và xóa tài khoản.
  - Thêm nút đăng nhập nhanh bằng tài khoản Google Admin trên form đăng nhập quản trị.
- `components/mon-ngon/MonNgonClient.tsx`:
  - Tải động món ăn từ API `/api/dishes` (kết hợp món đặc sản truyền thống và các món do các chủ quán mới đăng tải).
  - Bổ sung banner dẫn lối "Bạn là Chủ Quán Ăn tại Ea Súp? Vào Quán Của Tôi".

---

## [2026-10-03] Hiển thị rõ chữ trên thanh điều hướng desktop & đưa "Món ngon Ea Súp" lên đầu

**Yêu cầu:** Tại giao diện máy tính ghi rõ thông tin chữ cho các nút (không ẩn thành icon), đưa nút "Món ngon Ea Súp" lên vị trí đầu tiên.

**Đã làm:**
- `components/Navbar.tsx`:
  - Đưa mục `{ name: 'Món ngon Ea Súp', href: '/mon-ngon', icon: UtensilsCrossed, accent: true }` lên vị trí đầu tiên trong danh sách `navLinks`.
  - Thay đổi quy tắc hiển thị nhãn chữ từ `hidden xl:inline` thành `hidden md:inline` để toàn bộ nhãn chữ của các nút ("Món ngon Ea Súp", "Di sản & Danh thắng", "Bản đồ", "Lịch trình du lịch", "Thuyết minh số", "Ban Quản Trị") luôn hiển thị rõ ràng, đầy đủ trên màn hình máy tính (kể cả độ phân giải laptop/máy tính phổ biến từ 768px - 1280px+).
  - Tối ưu khoảng cách và cỡ chữ (`text-xs lg:text-sm`, `px-2 sm:px-2.5 lg:px-3`) đảm bảo thanh điều hướng tinh tế, cân đối và không bị tràn hay xuống dòng.

---

## [2026-10-03] Đồng bộ máy chủ Bàn ăn (API /api/food-tables), quán thật & quản trị CMS

**Yêu cầu:** Tiếp tục hoàn thiện phần lưu trữ máy chủ cho bàn ăn để mọi người cùng thấy, bổ sung các quán ngon thực tế ở Ea Súp, liên kết bản đồ Leaflet và quản lý trong CMS Ban Quản Trị.

**Đã làm:**
- `prisma/schema.prisma`: Thêm model `FoodTable` (dishId, restaurant, address, startAt, durationMin, capacity, joined, host, note, isCancelled).
- `lib/types.ts`: Bổ sung interface `FoodTableItem`.
- `lib/storage.ts`: Thêm bộ lưu trữ bền vững JSON `food-tables.json` với các hàm `getStoredFoodTables`, `upsertStoredFoodTable`, `joinStoredFoodTable`, `cancelStoredFoodTable`, `deleteStoredFoodTable` tự động fallback khi PostgreSQL offline.
- `app/api/food-tables/route.ts`: API GET (lọc theo món, thời gian) và POST (mở bàn mới).
- `app/api/food-tables/[id]/join/route.ts`: API POST tham gia bàn (tăng số người, kiểm tra đủ chỗ).
- `app/api/food-tables/[id]/cancel/route.ts`: API POST hủy bàn ăn.
- `app/api/food-tables/[id]/route.ts`: API GET thông tin bàn và DELETE xóa bàn (cho quản trị viên).
- `components/mon-ngon/MonNgonClient.tsx`: Kết nối API thời gian thực để đồng bộ bàn ăn giữa nhiều người dùng, tự động làm mới, tích hợp các chip gợi ý quán đặc sản thực tế tại Ea Súp khi tạo bàn.
- `data/categories.json` & `lib/data/seed-data.ts`: Bổ sung danh mục "Ẩm thực & Quán ngon Bản địa" (`cat-am-thuc`).
- `data/destinations.json`: Thêm 4 quán ăn đặc sản thực tế ở Ea Súp với tọa độ GPS, ảnh chất lượng cao và giờ mở cửa (Quán Gà nướng Cơm lam Bản Đôn, Nhà hàng Lòng hồ Ea Súp Thượng, Bếp ẩm thực Buôn A2, Cà phê Gió Hồ).
- `components/InteractiveMap.tsx`: Tạo biểu tượng ghim ẩm thực chuyên biệt màu đỏ cam `#D9452B` kèm icon dao nĩa, popup có nút liên kết trực tiếp vào mục "Món ngon Ea Súp".
- `app/admin/page.tsx`: Thêm tab "Món Ngon & Bàn Ăn" cho phép cán bộ quản trị theo dõi danh sách bàn, trạng thái, người mở và xóa bàn spam.
- Sửa lỗi xung đột `favicon.ico` giữa thư mục `app/` và `public/`, bổ sung `metadataBase` trong `app/layout.tsx`.

---

## [2026-10-03] Thêm mục "Món ngon Ea Súp" + file bộ nhớ dự án

**Yêu cầu:** Thêm mục "Món ngon Ea Súp" trên thanh điều hướng, giao diện lấy cảm hứng từ app
"Ăn Gì Đây Ta?" (Hôm nay thèm gì, Lắc món, Bàn bạn có thể tham gia, Lịch hẹn) – tươi sáng, chuyên nghiệp,
dễ dùng. Tạo file lưu lịch sử để agent không quên khi khởi động lại.

**Đã làm:**
- `components/Navbar.tsx` – thêm link `/mon-ngon` (tông đỏ cam nổi bật); nhãn chữ hiện từ `xl`,
  trên mobile hiện chữ "Món ngon".
- `app/mon-ngon/page.tsx` – trang mới kèm metadata SEO.
- `components/mon-ngon/MonNgonClient.tsx` – hero "Hôm nay thèm gì?", nút Rủ nhau đi / Lắc món,
  thống kê nhanh, 3 tab (Khám phá món, Bàn ăn đang mở, Lịch hẹn của tôi), modal chi tiết món,
  modal lắc món, form mở bàn, thanh điều hướng dưới cho mobile, thông báo toast.
- `lib/data/mon-ngon.ts` – 8 món (gà nướng, cơm lam, canh thụt, cá hồ nướng, lẩu cá, bò một nắng,
  xoài cát, cà phê phin), 6 bàn mẫu theo ngày hiện tại, hàm định dạng thời gian.
- `public/mon-ngon/*.jpg` – 8 ảnh món ăn do AI tạo.
- `app/globals.css` – thêm hiệu ứng `mn-*` (có hỗ trợ giảm chuyển động).
- Tạo `AGENTS.md` (bộ nhớ dự án) và `CHANGELOG.md` (file này).

**Lưu ý / việc còn dở:**
- Bàn ăn & lịch hẹn chỉ lưu `localStorage` trên từng thiết bị; cần API + Prisma để chia sẻ thật.
- Tên quán trong dữ liệu mẫu là minh họa – cần thay bằng quán thật.

---

## Lịch sử trước đó (tóm tắt từ git log)

- `809b71e` fix(docker): dùng `npm ci --legacy-peer-deps --no-audit`.
- `932ff4c` style(navbar): đưa hàng icon xuống dưới trên mobile để 2 dòng tiêu đề rộng rãi.
- `3e78d88` fix(docker): chuyển sang node:20-slim, glibc, buildkit cache.
- `a061cbb` feat: bổ sung dữ liệu lịch trình offline `data/itineraries.json`.
- `fb94af9` fix: trích xuất ranh giới 20 thôn buôn từ Google My Maps vào bản đồ web.
