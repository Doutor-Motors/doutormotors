import { supabase } from "@/integrations/supabase/client";

export interface CarBrand {
  id: string;
  name: string;
  image: string;
}

export interface CarModel {
  id: string;
  name: string;
  years: string;
  image: string;
  url?: string;
}

export interface MaintenanceCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  procedures: Array<{
    id: string;
    name: string;
    nameEn: string;
  }>;
  videos: Array<{
    title: string;
    url: string;
  }>;
  vehicleContext?: string | null;
}

export interface VideoDetails {
  category: MaintenanceCategory;
  carCareVideo: {
    url: string;
    title: string;
    description?: string;
    thumbnail?: string;
  } | null;
  vehicle: {
    brand: string;
    model: string;
    year?: string;
  } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchBrands(): Promise<ApiResponse<CarBrand[]>> {
  try {
    const { data, error } = await supabase.functions.invoke("carcare-api", {
      body: { action: "brands" },
    });

    if (error) {
      console.error("Error fetching brands:", error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (err) {
    console.error("Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function fetchModels(brand: string): Promise<ApiResponse<CarModel[]>> {
  try {
    const { data, error } = await supabase.functions.invoke("carcare-api", {
      body: { action: "models", brand },
    });

    if (error) {
      console.error("Error fetching models:", error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (err) {
    console.error("Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function fetchMaintenanceCategories(
  brand?: string,
  model?: string,
  year?: string
): Promise<ApiResponse<MaintenanceCategory[]>> {
  try {
    const { data, error } = await supabase.functions.invoke("carcare-api", {
      body: { action: "videos", brand, model, year },
    });

    if (error) {
      console.error("Error fetching categories:", error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (err) {
    console.error("Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function fetchVideoDetails(
  procedure: string,
  brand?: string,
  model?: string,
  year?: string
): Promise<ApiResponse<VideoDetails>> {
  try {
    const { data, error } = await supabase.functions.invoke("carcare-api", {
      body: { action: "video-details", procedure, brand, model, year },
    });

    if (error) {
      console.error("Error fetching video details:", error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (err) {
    console.error("Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// Extrai ID do YouTube da URL
export function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}
