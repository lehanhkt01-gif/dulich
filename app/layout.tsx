import type { Metadata } from 'next';
import { Noto_Serif, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const notoSerif = Noto_Serif({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DANH THẮNG KÝ | Nền Tảng Số Hóa Di Tích & Danh Lam Ea Súp, Tây Nguyên',
  description:
    'Hệ thống số hóa di tích lịch sử, danh lam thắng cảnh, văn hóa cồng chiêng buôn làng và du lịch sinh thái nông nghiệp huyện Ea Súp, tỉnh Đắk Lắk. Bản đồ GIS du lịch, thuyết minh âm thanh đa phương tiện.',
  keywords: [
    'Danh thắng ký',
    'Ea Súp',
    'Tháp Chàm Yang PRông',
    'Hồ Ea Súp Thượng',
    'Du lịch Đắk Lắk',
    'Cồng chiêng Tây Nguyên',
    'Du lịch sinh thái Yok Đôn',
    'Bản đồ du lịch Ea Súp',
  ],
  authors: [{ name: 'Ban Biên Tập Di Sản Ea Súp' }],
  openGraph: {
    title: 'DANH THẮNG KÝ | Số hóa Di tích & Danh lam Ea Súp, Tây Nguyên',
    description: 'Bản đồ GIS du lịch, thuyết minh âm thanh đa phương tiện và di sản Tây Nguyên',
    type: 'website',
    locale: 'vi_VN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${notoSerif.variable} ${inter.variable}`}>
      <head>
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
