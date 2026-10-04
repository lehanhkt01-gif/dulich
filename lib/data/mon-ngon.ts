/**
 * DỮ LIỆU MỤC "MÓN NGON EA SÚP"
 * --------------------------------------------------------------------------
 * - DISHES: danh mục món đặc sản / món phổ biến tại Ea Súp (ảnh trong /public/mon-ngon).
 * - SAMPLE_TABLES: "bàn ăn" mẫu để minh họa tính năng rủ nhau đi ăn.
 *   ⚠️ Tên quán & địa chỉ là DỮ LIỆU MẪU, cần thay bằng quán thật khi vận hành.
 * - Bàn do người dùng tạo / tham gia được lưu ở localStorage (xem STORAGE_KEYS).
 */

export type DishCategory = 'nuong' | 'canh-lau' | 'com-xoi' | 'dac-san' | 'do-uong';

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  shortDesc: string;
  story: string;
  image: string;
  priceRange: string;
  tags: string[];
}

export interface FoodTable {
  id: string;
  dishId: string;
  restaurant: string;
  address: string;
  /** ISO string thời điểm bắt đầu */
  startAt: string;
  durationMin: number;
  capacity: number;
  joined: number;
  host: string;
  note?: string;
  /** true nếu do người dùng trên máy này tạo */
  mine?: boolean;
}

export type TimeSlot = 'all' | 'sang' | 'trua' | 'chieu' | 'toi';

export const CATEGORIES: { id: DishCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Tất cả', emoji: '🍽️' },
  { id: 'nuong', label: 'Nướng', emoji: '🔥' },
  { id: 'canh-lau', label: 'Canh & lẩu', emoji: '🍲' },
  { id: 'com-xoi', label: 'Cơm & xôi', emoji: '🍚' },
  { id: 'dac-san', label: 'Đặc sản', emoji: '⭐' },
  { id: 'do-uong', label: 'Đồ uống & trái cây', emoji: '☕' },
];

export const CATEGORY_LABEL: Record<DishCategory, string> = {
  nuong: 'Nướng',
  'canh-lau': 'Canh & lẩu',
  'com-xoi': 'Cơm & xôi',
  'dac-san': 'Đặc sản',
  'do-uong': 'Đồ uống',
};

export const TIME_SLOTS: { id: TimeSlot; label: string; range: string }[] = [
  { id: 'all', label: 'Bất kỳ lúc nào', range: 'Cả ngày' },
  { id: 'sang', label: 'Sáng', range: '06:00 – 10:59' },
  { id: 'trua', label: 'Trưa', range: '11:00 – 13:59' },
  { id: 'chieu', label: 'Chiều', range: '14:00 – 17:59' },
  { id: 'toi', label: 'Tối', range: '18:00 – 23:59' },
];

export const DISHES: Dish[] = [
  {
    id: 'ga-nuong',
    name: 'Gà nướng bản Đôn',
    category: 'nuong',
    shortDesc: 'Gà thả vườn nướng than hồng, chấm muối ớt lá é thơm lừng.',
    story:
      'Gà đồi thả vườn được ướp sả, mắc khén rồi nướng chậm trên than củi cho da vàng giòn, thịt chắc ngọt. Ăn kèm muối ớt lá é và rau rừng – món không thể thiếu trong những buổi họp mặt ở Ea Súp.',
    image: '/mon-ngon/ga-nuong.jpg',
    priceRange: '180.000 – 300.000đ/con',
    tags: ['Món nhóm', 'Đậm vị'],
  },
  {
    id: 'com-lam',
    name: 'Cơm lam ống tre',
    category: 'com-xoi',
    shortDesc: 'Nếp nương nướng trong ống lồ ô, dẻo thơm mùi tre rừng.',
    story:
      'Gạo nếp nương được ngâm nước suối, nhồi vào ống lồ ô non rồi nướng trên bếp lửa. Khi chẻ ống, lớp màng tre mỏng ôm lấy cơm dẻo thơm, ăn cùng muối vừng hoặc thịt nướng xiên.',
    image: '/mon-ngon/com-lam.jpg',
    priceRange: '20.000 – 40.000đ/ống',
    tags: ['Truyền thống', 'Dễ mang theo'],
  },
  {
    id: 'canh-thut',
    name: 'Canh thụt Ê Đê',
    category: 'canh-lau',
    shortDesc: 'Canh rau rừng, cà đắng, cá khô nấu và “thụt” trong ống tre.',
    story:
      'Món canh đặc trưng của đồng bào Ê Đê: cà đắng, lá bép, đọt mây, cá khô được cho vào ống tre, nướng chín rồi dùng que tre thụt nhuyễn. Vị đắng nhẹ, cay nồng, hậu ngọt rất khó quên.',
    image: '/mon-ngon/canh-thut.jpg',
    priceRange: '60.000 – 120.000đ/phần',
    tags: ['Đồng bào Ê Đê', 'Rau rừng'],
  },
  {
    id: 'ca-nuong',
    name: 'Cá hồ Ea Súp nướng',
    category: 'nuong',
    shortDesc: 'Cá nước ngọt hồ Ea Súp Thượng nướng mỡ hành, cuốn bánh tráng.',
    story:
      'Cá đánh bắt từ lòng hồ Ea Súp Thượng, thịt chắc và ngọt tự nhiên. Nướng than rồi rưới mỡ hành, đậu phộng; cuốn bánh tráng cùng xoài xanh, rau thơm và chấm nước mắm me.',
    image: '/mon-ngon/ca-nuong.jpg',
    priceRange: '150.000 – 250.000đ/con',
    tags: ['Đặc sản hồ', 'Món nhóm'],
  },
  {
    id: 'lau-ca',
    name: 'Lẩu cá lòng hồ',
    category: 'canh-lau',
    shortDesc: 'Nồi lẩu chua thanh với thơm, cà chua, cá tươi và rau đồng.',
    story:
      'Nước lẩu nấu từ xương cá, thơm (dứa) và cà chua cho vị chua thanh. Nhúng cá tươi, đậu bắp, giá và rau muống – món lý tưởng cho buổi tối mát trời bên hồ.',
    image: '/mon-ngon/lau-ca.jpg',
    priceRange: '250.000 – 400.000đ/nồi',
    tags: ['Món nhóm', 'Buổi tối'],
  },
  {
    id: 'bo-mot-nang',
    name: 'Bò một nắng muối kiến',
    category: 'dac-san',
    shortDesc: 'Thịt bò phơi một nắng, nướng sơ, chấm muối kiến vàng.',
    story:
      'Thịt bò thái miếng, tẩm gia vị rồi phơi đúng một nắng cho se mặt. Khi ăn nướng sơ trên than, xé nhỏ và chấm muối kiến vàng – vị chua cay rất riêng của núi rừng Tây Nguyên.',
    image: '/mon-ngon/bo-mot-nang.jpg',
    priceRange: '350.000 – 450.000đ/kg',
    tags: ['Quà mang về', 'Muối kiến vàng'],
  },
  {
    id: 'xoai-cat',
    name: 'Xoài cát Ea Súp',
    category: 'do-uong',
    shortDesc: 'Xoài cát OCOP 4 sao, thịt vàng ươm, ngọt đậm, ít xơ.',
    story:
      'Vùng chuyên canh hơn 3.000 ha xoài cát của Ea Súp cho trái thơm ngọt nhờ nắng gió và đất bazan. Có thể ăn tươi, làm sinh tố, hoặc chấm muối ớt khi còn xanh giòn.',
    image: '/mon-ngon/xoai-cat.jpg',
    priceRange: '25.000 – 45.000đ/kg',
    tags: ['OCOP 4 sao', 'Theo mùa'],
  },
  {
    id: 'ca-phe',
    name: 'Cà phê phin Đắk Lắk',
    category: 'do-uong',
    shortDesc: 'Robusta rang mộc pha phin, đậm đà, thơm nồng buổi sớm.',
    story:
      'Hạt robusta Đắk Lắk rang mộc, pha phin chậm rãi. Uống đen đá hay sữa đá đều đậm vị – khởi đầu hoàn hảo trước chuyến tham quan Tháp Chăm Yang Prông.',
    image: '/mon-ngon/ca-phe.jpg',
    priceRange: '15.000 – 30.000đ/ly',
    tags: ['Buổi sáng', 'Gặp gỡ'],
  },
];

export const STORAGE_KEYS = {
  myTables: 'easup_monngon_my_tables_v1',
  joined: 'easup_monngon_joined_v1',
  cancelled: 'easup_monngon_cancelled_v1',
  nickname: 'easup_monngon_nickname_v1',
};

/** Tạo bàn mẫu theo ngày hiện tại để luôn có dữ liệu "sắp diễn ra". */
export function buildSampleTables(now: Date = new Date()): FoodTable[] {
  const at = (dayOffset: number, h: number, m = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: 'sample-1',
      dishId: 'ca-phe',
      restaurant: 'Quán cà phê Bên Hồ (mẫu)',
      address: 'Ven hồ Ea Súp Thượng, xã Ea Súp, Đắk Lắk',
      startAt: at(1, 7, 0),
      durationMin: 60,
      capacity: 4,
      joined: 2,
      host: 'H’Lan',
      note: 'Cà phê sáng rồi cùng đi Tháp Chăm Yang Prông.',
    },
    {
      id: 'sample-2',
      dishId: 'ga-nuong',
      restaurant: 'Quán gà nướng Buôn Đôn (mẫu)',
      address: 'Trung tâm xã Ea Súp, Đắk Lắk',
      startAt: at(0, 18, 30),
      durationMin: 90,
      capacity: 6,
      joined: 3,
      host: 'Minh Tuấn',
      note: 'Đặt 2 con gà, chia tiền đều nhé!',
    },
    {
      id: 'sample-3',
      dishId: 'lau-ca',
      restaurant: 'Nhà hàng Lòng Hồ (mẫu)',
      address: 'Khu vực đập chính hồ Ea Súp Thượng, Đắk Lắk',
      startAt: at(1, 19, 0),
      durationMin: 120,
      capacity: 5,
      joined: 4,
      host: 'Y Khoa',
    },
    {
      id: 'sample-4',
      dishId: 'canh-thut',
      restaurant: 'Bếp buôn Ê Đê (mẫu)',
      address: 'Không gian văn hóa buôn, xã Ea Súp, Đắk Lắk',
      startAt: at(2, 11, 30),
      durationMin: 90,
      capacity: 4,
      joined: 1,
      host: 'H’Nga',
      note: 'Trải nghiệm ẩm thực đồng bào, có rượu cần.',
    },
    {
      id: 'sample-5',
      dishId: 'ca-nuong',
      restaurant: 'Quán cá nướng Hồ Thượng (mẫu)',
      address: 'Đường ven hồ Ea Súp Thượng, Đắk Lắk',
      startAt: at(2, 17, 30),
      durationMin: 90,
      capacity: 4,
      joined: 4,
      host: 'Quốc Bảo',
    },
    {
      id: 'sample-6',
      dishId: 'com-lam',
      restaurant: 'Điểm dừng chân Yok Đôn (mẫu)',
      address: 'Phân khu VQG Yok Đôn, xã Ea Súp, Đắk Lắk',
      startAt: at(3, 12, 0),
      durationMin: 60,
      capacity: 8,
      joined: 2,
      host: 'Thu Hà',
      note: 'Ăn trưa sau khi tham quan rừng khộp.',
    },
  ];
}

export function getTimeSlot(iso: string): TimeSlot {
  const h = new Date(iso).getHours();
  if (h < 11) return 'sang';
  if (h < 14) return 'trua';
  if (h < 18) return 'chieu';
  return 'toi';
}

const WEEKDAYS = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];

export function formatTableTime(iso: string, durationMin: number): string {
  const s = new Date(iso);
  const e = new Date(s.getTime() + durationMin * 60000);
  const hm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${WEEKDAYS[s.getDay()]}, ${s.getDate()}/${s.getMonth() + 1} · ${hm(s)}–${hm(e)}`;
}

export function relativeDayLabel(iso: string, now: Date = new Date()): string {
  const a = new Date(iso);
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOf(a) - startOf(now)) / 86400000);
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Ngày mai';
  if (diff === -1) return 'Hôm qua';
  if (diff > 1) return `${diff} ngày nữa`;
  return `${-diff} ngày trước`;
}
