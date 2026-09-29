export type Role = 'TRAVELER' | 'EDITOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  createdAt: string;
}

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
