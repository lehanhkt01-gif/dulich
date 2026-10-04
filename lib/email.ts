import nodemailer from 'nodemailer';

/**
 * Cấu hình Email cho Hệ thống Du Lịch Ea Súp
 * - Email Admin nhận thông báo quản trị: Lehanhkt01@gmail.com
 * - Tự động phát hiện cấu hình SMTP trong env; nếu chưa có thì log mô phỏng an toàn.
 */

export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'Lehanhkt01@gmail.com';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || `"Du Lịch Ea Súp" <${SMTP_USER || 'no-reply@easup.daklak.gov.vn'}>`;

// Tạo transporter Nodemailer
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

/**
 * Hàm hỗ trợ gửi Email tổng quát
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    if (!to || !to.includes('@')) {
      console.warn('[EMAIL SKIPPED] Email người nhận không hợp lệ:', to);
      return { success: false, message: 'Email không hợp lệ' };
    }

    // Nếu chưa cấu hình mật khẩu SMTP trong env, log ra console mô phỏng an toàn
    if (!SMTP_USER || !SMTP_PASS) {
      console.log('\n======================================================');
      console.log(`📧 [MÔ PHỎNG GỬI EMAIL THÀNH CÔNG]`);
      console.log(`📩 Đến: ${to}`);
      console.log(`📌 Tiêu đề: ${subject}`);
      console.log(`======================================================\n`);
      return { success: true, message: 'Đã phát email mô phỏng (chưa cấu hình SMTP_PASS)' };
    }

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });

    console.log(`✅ [EMAIL DELIVERED] ID: ${info.messageId} -> ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ [EMAIL ERROR]:', error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

// -----------------------------------------------------------------------------
// TEMPLATE HTML CHUẨN THƯƠNG HIỆU DU LỊCH EA SÚP
// -----------------------------------------------------------------------------

function renderEmailLayout(title: string, bodyHtml: string) {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FBF9F5; margin: 0; padding: 20px; color: #1C1917; }
        .container { max-width: 600px; margin: 0 auto; bg-color: #ffffff; background: #ffffff; border-radius: 20px; border: 1px solid #E7E2D7; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #D9452B 0%, #0066CC 100%); color: #ffffff; padding: 25px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px; }
        .header p { margin: 5px 0 0; font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 25px 20px; font-size: 14px; line-height: 1.6; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 50px; font-weight: bold; font-size: 12px; text-transform: uppercase; }
        .badge-pending { background: #FEF3C7; color: #92400E; }
        .badge-approved { background: #D1FAE5; color: #065F46; }
        .badge-completed { background: #DBEAFE; color: #1E40AF; }
        .badge-rejected { background: #FEE2E2; color: #991B1B; }
        .table-custom { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
        .table-custom th { background: #FBF9F5; text-align: left; padding: 8px 12px; border-bottom: 2px solid #E7E2D7; color: #78350F; }
        .table-custom td { padding: 8px 12px; border-bottom: 1px solid #F3F4F6; }
        .footer { background: #FBF9F5; padding: 15px 20px; text-align: center; font-size: 11px; color: #78716C; border-top: 1px solid #E7E2D7; }
        .btn { display: inline-block; padding: 10px 22px; background: #D9452B; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 13px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HỆ THỐNG DU LỊCH EA SÚP</h1>
          <p>${title}</p>
        </div>
        <div class="content">
          ${bodyHtml}
        </div>
        <div class="footer">
          <p>© 2026 Đoàn Thanh Niên Ea Súp • Bản Sắc, Dấu Ấn Đại Ngàn Tây Nguyên</p>
          <p>Địa chỉ: Xã Ea Súp, Tỉnh Đắk Lắk • Hotline hỗ trợ: 0912 345 678</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// -----------------------------------------------------------------------------
// HÀM NGHIỆP VỤ GỬI EMAIL
// -----------------------------------------------------------------------------

/**
 * 1. Gửi Email thông báo khi Khách Đặt Món Thành Công (Gửi Khách & Chủ Quán)
 */
export async function sendOrderPlacedEmails({
  customerName,
  customerPhone,
  customerEmail,
  ownerEmail,
  restaurantName,
  totalAmount,
  items,
  note,
}: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  ownerEmail?: string;
  restaurantName: string;
  totalAmount: number;
  items: Array<{ name?: string; quantity: number; price: number }>;
  note?: string;
}) {
  const itemsHtml = items
    .map(
      (i) =>
        `<tr>
          <td><strong>${i.name || 'Món ăn'}</strong></td>
          <td style="text-align: center;">${i.quantity}</td>
          <td style="text-align: right;">${(i.price * i.quantity).toLocaleString('vi-VN')}đ</td>
        </tr>`
    )
    .join('');

  // A. Gửi cho Khách Hàng (nếu có email)
  if (customerEmail && customerEmail.includes('@')) {
    const customerBody = `
      <p>Xin chào <strong>${customerName}</strong>,</p>
      <p>Cảm ơn bạn đã đặt món tại <strong>${restaurantName}</strong> qua Hệ thống Du Lịch Ea Súp!</p>
      <div style="background: #FFFBEB; border: 1px solid #FCD34D; padding: 12px 15px; border-radius: 12px; margin: 15px 0;">
        <p style="margin: 0; font-weight: bold; color: #92400E;">Trạng thái đơn: <span class="badge badge-pending">Chờ Quán Duyệt</span></p>
        <p style="margin: 5px 0 0; font-size: 12px; color: #B45309;">Chủ quán sẽ kiểm tra và phê duyệt đơn của bạn trong ít phút.</p>
      </div>
      <table class="table-custom">
        <thead>
          <tr>
            <th>Món ăn</th>
            <th style="text-align: center;">SL</th>
            <th style="text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="text-align: right; font-size: 15px;"><strong>Tổng cộng: <span style="color: #D9452B;">${totalAmount.toLocaleString('vi-VN')}đ</span></strong></p>
      ${note ? `<p><strong>Ghi chú:</strong> <em>${note}</em></p>` : ''}
      <p>SĐT liên hệ nhận món: <strong>${customerPhone}</strong></p>
    `;

    await sendEmail({
      to: customerEmail,
      subject: `[Du Lịch Ea Súp] Xác nhận đơn đặt món tại ${restaurantName}`,
      html: renderEmailLayout('XÁC NHẬN ĐẶT MÓN THÀNH CÔNG', customerBody),
    });
  }

  // B. Gửi cho Chủ Quán
  if (ownerEmail && ownerEmail.includes('@')) {
    const ownerBody = `
      <p>Xin chào <strong>Chủ Quán ${restaurantName}</strong>,</p>
      <p>Quán của bạn vừa nhận được <strong>ĐƠN ĐẶT MÓN MỚI</strong> từ khách hàng!</p>
      <div style="background: #F0FDF4; border: 1px solid #86EFAC; padding: 12px 15px; border-radius: 12px; margin: 15px 0;">
        <p style="margin: 0;"><strong>Khách hàng:</strong> ${customerName}</p>
        <p style="margin: 4px 0 0;"><strong>Số điện thoại:</strong> <a href="tel:${customerPhone}" style="color: #0066CC; font-weight: bold;">${customerPhone}</a></p>
        ${note ? `<p style="margin: 4px 0 0;"><strong>Ghi chú từ khách:</strong> <em>${note}</em></p>` : ''}
      </div>
      <table class="table-custom">
        <thead>
          <tr>
            <th>Món ăn</th>
            <th style="text-align: center;">SL</th>
            <th style="text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="text-align: right; font-size: 15px;"><strong>Tổng tiền đơn: <span style="color: #D9452B;">${totalAmount.toLocaleString('vi-VN')}đ</span></strong></p>
      <p style="text-align: center;">
        <a href="http://localhost:3000/chu-quan" class="btn">VÀO KHÔNG GIAN QUÁN ĐỂ DUYỆT ĐƠN</a>
      </p>
    `;

    await sendEmail({
      to: ownerEmail,
      subject: `⚡ [ĐƠN MỚI] Khách ${customerName} vừa đặt món tại ${restaurantName}`,
      html: renderEmailLayout('CÓ ĐƠN ĐẶT MÓN MỚI CẦN DUYỆT', ownerBody),
    });
  }
}

/**
 * 2. Gửi Email cập nhật trạng thái Đơn Món (Phê duyệt, Phục vụ xong, Hủy) cho Khách Hàng
 */
export async function sendOrderStatusUpdatedEmail({
  customerName,
  customerEmail,
  restaurantName,
  status,
}: {
  customerName: string;
  customerEmail: string;
  restaurantName: string;
  status: 'APPROVED' | 'COMPLETED' | 'REJECTED' | string;
}) {
  if (!customerEmail || !customerEmail.includes('@')) return;

  let statusTitle = '';
  let statusBadge = '';
  let statusDetail = '';

  if (status === 'APPROVED') {
    statusTitle = 'ĐƠN ĐẶT MÓN ĐÃ ĐƯỢC PHÊ DUYỆT';
    statusBadge = '<span class="badge badge-approved">ĐÃ PHÊ DUYỆT</span>';
    statusDetail = `Quán <strong>${restaurantName}</strong> đã phê duyệt đơn đặt món của bạn và đang tiến hành chuẩn bị các món ăn thơm ngon chờ đón bạn!`;
  } else if (status === 'COMPLETED') {
    statusTitle = 'ĐƠN HÀNG ĐÃ PHỤC VỤ XONG';
    statusBadge = '<span class="badge badge-completed">ĐÃ PHỤC VỤ XONG</span>';
    statusDetail = `Quán <strong>${restaurantName}</strong> báo cáo đã phục vụ hoàn tất đơn hàng của bạn. Cảm ơn bạn đã thưởng thức ẩm thực tại Ea Súp!`;
  } else if (status === 'REJECTED') {
    statusTitle = 'THÔNG BÁO TỪ CHỐI / HỦY ĐƠN';
    statusBadge = '<span class="badge badge-rejected">ĐÃ HỦY ĐƠN</span>';
    statusDetail = `Rất tiếc, quán <strong>${restaurantName}</strong> không thể phục vụ đơn hàng này tại thời điểm hiện tại (do quá tải hoặc hết nguyên liệu). Mong bạn cảm thông!`;
  } else {
    statusTitle = 'CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG';
    statusBadge = `<span class="badge badge-pending">${status}</span>`;
    statusDetail = `Đơn đặt món của bạn tại <strong>${restaurantName}</strong> đã chuyển sang trạng thái: <strong>${status}</strong>.`;
  }

  const bodyHtml = `
    <p>Xin chào <strong>${customerName}</strong>,</p>
    <p>${statusDetail}</p>
    <div style="margin: 20px 0; text-align: center;">
      <p style="font-size: 13px; color: #57534E;">Trạng thái đơn mới nhất:</p>
      <div style="font-size: 16px;">${statusBadge}</div>
    </div>
    <p style="text-align: center;">
      <a href="http://localhost:3000/mon-ngon/lich-su-dat" class="btn">XEM LỊCH SỬ ĐẶT MÓN</a>
    </p>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `[Du Lịch Ea Súp] ${statusTitle} từ ${restaurantName}`,
    html: renderEmailLayout(statusTitle, bodyHtml),
  });
}

/**
 * 3. Thông báo cho ADMIN khi có Chủ Quán Mới đăng ký
 */
export async function sendNewOwnerRegisteredEmail({
  ownerName,
  ownerEmail,
  ownerPhone,
  restaurantName,
  restaurantAddress,
}: {
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  restaurantName: string;
  restaurantAddress?: string;
}) {
  const adminEmail = DEFAULT_ADMIN_EMAIL;

  const bodyHtml = `
    <p>Kính gửi <strong>Ban Quản Trị Hệ Thống (Admin)</strong>,</p>
    <p>Hệ thống vừa nhận được hồ sơ <strong>ĐĂNG KÝ MỞ QUÁN MỚI</strong> cần duyệt!</p>
    <div style="background: #FEF3C7; border: 1px solid #FCD34D; padding: 15px; border-radius: 12px; margin: 15px 0;">
      <p style="margin: 0 0 6px;">🏪 <strong>Tên Quán:</strong> ${restaurantName}</p>
      <p style="margin: 0 0 6px;">👤 <strong>Chủ Quán:</strong> ${ownerName}</p>
      <p style="margin: 0 0 6px;">📧 <strong>Gmail Đăng Ký:</strong> ${ownerEmail}</p>
      <p style="margin: 0 0 6px;">📞 <strong>Số Điện Thoại:</strong> ${ownerPhone || 'Chưa cung cấp'}</p>
      <p style="margin: 0;">📍 <strong>Địa Chỉ Quán:</strong> ${restaurantAddress || 'Xã Ea Súp, Tỉnh Đắk Lắk'}</p>
    </div>
    <p>Trạng thái hiện tại: <span class="badge badge-pending">CHỜ ADMIN PHÊ DUYỆT</span></p>
    <p style="text-align: center;">
      <a href="http://localhost:3000/admin" class="btn">VÀO CHUYÊN MỤC ADMIN ĐỂ PHÊ DUYỆT</a>
    </p>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `🔔 [ĐĂNG KÝ QUÁN MỚI] Hồ sơ quán "${restaurantName}" chờ Admin phê duyệt`,
    html: renderEmailLayout('THÔNG BÁO HỒ SƠ QUÁN MỚI', bodyHtml),
  });
}

/**
 * 4. Thông báo cho ADMIN khi Chủ Quán THAY ĐỔI THÔNG TIN QUÁN
 */
export async function sendOwnerInfoChangedEmail({
  ownerName,
  ownerEmail,
  restaurantName,
  changes,
}: {
  ownerName: string;
  ownerEmail: string;
  restaurantName: string;
  changes: Record<string, any>;
}) {
  const adminEmail = DEFAULT_ADMIN_EMAIL;

  const changeRows = Object.entries(changes)
    .map(([key, value]) => `<tr><td><strong>${key}:</strong></td><td>${value}</td></tr>`)
    .join('');

  const bodyHtml = `
    <p>Kính gửi <strong>Ban Quản Trị Hệ Thống (Admin)</strong>,</p>
    <p>Chủ quán <strong>${ownerName}</strong> (${ownerEmail}) vừa cập nhật thông tin hồ sơ quán <strong>${restaurantName}</strong>!</p>
    <table class="table-custom">
      <thead>
        <tr>
          <th>Thông tin</th>
          <th>Giá trị cập nhật</th>
        </tr>
      </thead>
      <tbody>
        ${changeRows}
      </tbody>
    </table>
    <p style="text-align: center;">
      <a href="http://localhost:3000/admin" class="btn">XEM QUẢN TRỊ ADMIN</a>
    </p>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `📝 [CẬP NHẬT THÔNG TIN] Chủ quán "${restaurantName}" vừa thay đổi thông tin quán`,
    html: renderEmailLayout('THÔNG BÁO THAY ĐỔI THÔNG TIN QUÁN', bodyHtml),
  });
}

/**
 * 5. Thông báo cho CHỦ QUÁN khi Admin PHÊ DUYỆT QUÁN THÀNH CÔNG
 */
export async function sendOwnerApprovedEmail({
  ownerName,
  ownerEmail,
  restaurantName,
}: {
  ownerName: string;
  ownerEmail: string;
  restaurantName: string;
}) {
  if (!ownerEmail || !ownerEmail.includes('@')) return;

  const bodyHtml = `
    <p>Xin chúc mừng <strong>${ownerName}</strong>,</p>
    <p>Hồ sơ quán <strong>${restaurantName}</strong> của bạn đã được <strong>Ban Quản Trị Ea Súp CHÍNH THỨC PHÊ DUYỆT!</strong></p>
    <div style="background: #D1FAE5; border: 1px solid #6EE7B7; padding: 15px; border-radius: 12px; margin: 15px 0;">
      <p style="margin: 0; color: #065F46; font-bold;">Trạng thái tài khoản: <span class="badge badge-approved">ĐÃ KÍCH HOẠT (ACTIVE)</span></p>
      <p style="margin: 8px 0 0; font-size: 13px; color: #047857;">Bây giờ bạn đã có thể đăng nhập bằng Gmail và Mật khẩu của quán để vào Không Gian Quán, thêm thực đơn và tiếp nhận đơn hàng của du khách.</p>
    </div>
    <p style="text-align: center;">
      <a href="http://localhost:3000/chu-quan" class="btn">ĐĂNG NHẬP KHÔNG GIAN QUÁN NGAY</a>
    </p>
  `;

  await sendEmail({
    to: ownerEmail,
    subject: `🎉 [CHÚC MỪNG] Hồ sơ quán "${restaurantName}" đã được Admin phê duyệt kích hoạt!`,
    html: renderEmailLayout('PHÊ DUYỆT KÍCH HOẠT THÀNH CÔNG', bodyHtml),
  });
}
