export type Role = 'USER' | 'OWNER' | 'CADRE' | 'ADMIN' | 'TRAVELER' | 'EDITOR';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'BLOCKED';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: UserStatus;
  avatar?: string | null;
  image?: string | null;
  phone?: string | null;
  restaurantName?: string | null;
  restaurantAddress?: string | null;
  restaurantPhone?: string | null;
  restaurantLat?: number | null;
  restaurantLng?: number | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  village?: string | null;
  phone?: string | null;
  coverImage?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  isApproved: boolean;
  isPinned?: boolean;
  pinnedAt?: string | Date | null;
  ownerId: string;
  owner?: User;
  menuItems?: MenuItem[];
  tables?: Table[];
  orders?: Order[];
  bookings?: Booking[];
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  restaurant?: Restaurant;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category: string;
  isAvailable: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Table {
  id: string;
  restaurantId: string;
  restaurant?: Restaurant;
  name: string;
  capacity: number;
  status: TableStatus;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurant?: Restaurant;
  userId: string;
  user?: User;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  totalAmount: number;
  note?: string | null;
  orderItems?: OrderItem[];
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Booking {
  id: string;
  restaurantId: string;
  restaurant?: Restaurant;
  userId: string;
  user?: User;
  tableId?: string | null;
  table?: Table | null;
  customerName: string;
  customerPhone: string;
  bookingTime: string | Date;
  guestCount: number;
  status: BookingStatus;
  note?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

// Di tích & Thắng cảnh
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  photos?: string[];
  destinationId: string;
  userId?: string | null;
  userName?: string | null;
  isApproved: boolean;
  createdAt: string;
}

export interface Destination {
  id: string;
  title: string;
  slug: string;
  subTitle?: string | null;
  historicalPeriod?: string | null;
  content: string;
  audioVoiceUrl?: string | null;
  thumbnail: string;
  gallery: string[];
  address: string;
  latitude: number;
  longitude: number;
  bestSeason?: string | null;
  entryFee?: string | null;
  visitingHours?: string | null;
  culturalNotes?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  viewsCount: number;
  categoryId: string;
  category?: Category;
  createdById?: string | null;
  createdBy?: User | null;
  reviews?: Review[];
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStop {
  time: string;
  title: string;
  destinationSlug?: string;
  description: string;
  culinaryTip?: string;
}

export interface ItineraryItem {
  id: string;
  title: string;
  durationDays: string;
  targetAudience: string;
  routeDetails: RouteStop[];
  coverImage?: string | null;
  createdAt: string;
}

export interface FoodTableItem {
  id: string;
  dishId: string;
  restaurant: string;
  address: string;
  startAt: string;
  durationMin: number;
  capacity: number;
  joined: number;
  host: string;
  note?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isCancelled?: boolean;
  ownerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DishItem {
  id: string;
  name: string;
  category: 'nuong' | 'canh-lau' | 'com-xoi' | 'dac-san' | 'do-uong';
  shortDesc: string;
  story: string;
  image: string;
  priceRange: string;
  tags: string[];
  ownerId?: string | null;
  restaurantName?: string | null;
  restaurantAddress?: string | null;
  restaurantId?: string | null;
  restaurant?: DishRestaurantInfo | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Thông tin quán ăn phục vụ món (hiển thị trên thẻ món & chi tiết món) */
export interface DishRestaurantInfo {
  id: string;
  name: string;
  slug?: string | null;
  address: string;
  village?: string | null;
  phone?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  coverImage?: string | null;
  isApproved?: boolean;
  ownerName?: string | null;
  lat?: number | null;
  lng?: number | null;
}
