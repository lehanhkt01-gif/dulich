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
