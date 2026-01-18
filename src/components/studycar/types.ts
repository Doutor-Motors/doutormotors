// Types for Study Car System

export interface CarBrand {
  id: string;
  name: string;
  image: string;
  url?: string;
}

export interface CarModel {
  id: string;
  name: string;
  years: string;
  image: string;
  url?: string;
}

export interface Procedure {
  id: string;
  name: string;
  nameEn: string;
  url: string;
}

export interface VideoCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  thumbnail?: string;
  url?: string;
  vehicleContext?: string;
  procedures?: Procedure[];
}

export interface RelatedVideo {
  url: string;
  name: string;
}

export interface VideoDetails {
  title: string;
  description?: string;
  videoDescription?: string;
  videoUrl?: string | null;
  sourceUrl?: string;
  steps?: string[];
  markdown?: string;
  transcriptionUsed?: boolean;
  fromCache?: boolean;
  cacheExpiresAt?: string;
  error?: boolean;
  errorMessage?: string;
  // Vídeos relacionados encontrados na mesma página
  relatedVideos?: RelatedVideo[];
}

export type ViewState = "brands" | "models" | "categories" | "procedures" | "video";
