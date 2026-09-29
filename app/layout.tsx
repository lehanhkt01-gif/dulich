import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'DU LỊCH EA SÚP | BẢN SẮC, DẤU ẤN ĐẠI NGÀN TÂY NGUYÊN',
  description:
    'Cổng thông tin du lịch và số hóa di tích lịch sử, danh lam thắng cảnh, văn hóa cồng chiêng buôn làng xã Ea Súp, tỉnh Đắk Lắk. Bản đồ GIS du lịch tương tác tọa độ 13.070029, 107.883355.',
  keywords: [
    'Du lịch Ea Súp',
    'Bản sắc dấu ấn đại ngàn Tây Nguyên',
    'Tháp Chàm Yang PRông',
    'Hồ Ea Súp Thượng',
    'Du lịch Đắk Lắk',
    'Cồng chiêng Tây Nguyên',
    'Du lịch sinh thái Yok Đôn',
    'Bản đồ du lịch Ea Súp',
  ],
  icons: {
    icon: [
      { url: '/logo-easup-official.png' },
      { url: '/favicon.ico' },
    ],
    shortcut: ['/logo-easup-official.png'],
    apple: [
      { url: '/logo-easup-official.png' },
    ],
  },
  authors: [{ name: 'Đoàn Thanh Niên Ea Súp - Đắk Lắk' }],
  openGraph: {
    title: 'DU LỊCH EA SÚP | BẢN SẮC, DẤU ẤN ĐẠI NGÀN TÂY NGUYÊN',
    description: 'Bản đồ GIS du lịch, thuyết minh âm thanh đa phương tiện và di sản xã Ea Súp, tỉnh Đắk Lắk',
    type: 'website',
    locale: 'vi_VN',
    images: [{ url: '/logo-easup-official.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        {/* Google Fonts loaded asynchronously in browser to avoid Docker build network timeouts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Serif:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] antialiased">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
