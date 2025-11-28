export interface Category {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  icon: string;
  color: string;
}

export interface HistoricalSite {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  short_description_uz: string;
  short_description_ru: string;
  short_description_en: string;
  description_uz?: string;
  description_ru?: string;
  description_en?: string;
  facts_uz?: string;
  facts_ru?: string;
  facts_en?: string;
  latitude: string;
  longitude: string;
  address?: string;
  how_to_get?: string;
  category: Category | null;
  built_date?: string;
  working_hours?: string;
  ticket_price?: string;
  video_url?: string;
  main_image: string | null;
  images?: SiteImage[];
  guides_count?: number;
}

export interface SiteImage {
  id: number;
  image: string;
  caption: string;
  order: number;
}

export interface Guide {
  id: number;
  full_name: string;
  bio?: string;
  avatar: string | null;
  languages: string[];
  experience_years: number;
  price_per_hour: string;
  average_tour_duration: number;
  rating: string;
  total_reviews: number;
  total_tours?: number;
  is_verified: boolean;
  specialization_sites?: HistoricalSite[];
}

export interface MapMarker {
  id: number;
  name_ru: string;
  name_uz: string;
  name_en: string;
  latitude: string;
  longitude: string;
  category__color: string;
  category__icon: string;
}

export type Language = 'uz' | 'ru' | 'en';
