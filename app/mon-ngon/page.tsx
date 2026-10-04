import type { Metadata } from 'next';
import MonNgonClient from '@/components/mon-ngon/MonNgonClient';

export const metadata: Metadata = {
  title: 'Món ngon Ea Súp | Hôm nay thèm gì? Rủ nhau đi ăn',
  description:
    'Khám phá món ngon đặc sản Ea Súp: gà nướng, cơm lam, canh thụt Ê Đê, cá hồ Ea Súp Thượng, xoài cát OCOP. Lắc món ngẫu nhiên, tìm bàn ăn và hẹn bạn bè tại quán.',
  openGraph: {
    title: 'Món ngon Ea Súp | Hôm nay thèm gì?',
    description: 'Chọn món bạn thèm, tìm bàn tại quán gần bạn và cùng ăn với những người yêu ẩm thực Ea Súp.',
    images: [{ url: '/mon-ngon/ga-nuong.jpg' }],
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function MonNgonPage() {
  return <MonNgonClient />;
}
