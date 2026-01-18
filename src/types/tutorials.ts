// ============================================
// TIPOS DO SISTEMA ESTUDE SEU CARRO
// ============================================

// Tutorial completo
export interface Tutorial {
  id: string;
  slug: string;
  source_url: string;
  title_original: string | null;
  title_pt: string | null;
  description_original: string | null;
  description_pt: string | null;
  category_original: string | null;
  category_pt: string | null;
  difficulty: TutorialDifficulty;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  video_url: string | null;
  youtube_video_id: string | null;
  steps: TutorialStep[];
  tools: string[];
  safety_tips: string[];
  vehicle_makes: string[];
  vehicle_models: string[];
  vehicle_years: string[];
  views_count: number;
  rating: number;
  is_processed: boolean;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

// Passo do tutorial
export interface TutorialStep {
  step: number;
  title: string;
  description: string;
  tools?: string[];
  tips?: string;
  timestamp?: string;
  duration_seconds?: number;
  image_url?: string;
  warning?: string;
  completed?: boolean;
}

// Categoria de tutoriais
export interface TutorialCategory {
  id: string;
  slug: string;
  name_original: string;
  name_pt: string;
  icon: string | null;
  color: string | null;
  tutorials_count: number;
  created_at: string;
}

// Resultado de busca
export interface SearchResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
  thumbnail?: string;
}

// Favorito do usuário
export interface TutorialFavorite {
  id: string;
  user_id: string;
  tutorial_id: string;
  created_at: string;
}

// Veículo selecionado
export interface SelectedVehicle {
  make: string;
  model: string;
  year: string | number;
  displayName: string;
}

// Estado do player de vídeo
export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  buffered: number;
  currentStep: number;
}

// Estado do mini player
export interface MiniPlayerState {
  isVisible: boolean;
  isMinimized: boolean;
  tutorial: Tutorial | null;
  position: { x: number; y: number };
}

// Parâmetros de busca
export interface SearchParams {
  query?: string;
  make?: string;
  model?: string;
  year?: string | number;
  category?: string;
  difficulty?: TutorialDifficulty;
  limit?: number;
  offset?: number;
}

// Resultado de sincronização
export interface SyncResult {
  synced: number;
  tutorials: Tutorial[];
  errors?: string[];
}

// Deep Link params
export interface DeepLinkParams {
  category?: string;
  slug?: string;
  make?: string;
  model?: string;
  year?: string;
  step?: number;
  time?: number;
}

// Níveis de dificuldade
export type TutorialDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Status de carregamento
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Tipo de visualização
export type ViewMode = 'grid' | 'list' | 'compact';

// Ação do player
export type PlayerAction = 
  | 'play' 
  | 'pause' 
  | 'seek' 
  | 'next_step' 
  | 'prev_step'
  | 'fullscreen'
  | 'minimize'
  | 'close';

// Ferramenta com detalhes
export interface Tool {
  name: string;
  name_pt: string;
  icon?: string;
  required: boolean;
  alternatives?: string[];
}

// Dica de segurança
export interface SafetyTip {
  type: 'warning' | 'caution' | 'danger' | 'info';
  message: string;
  icon?: string;
}

// Metadados do vídeo
export interface VideoMetadata {
  youtube_id: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  embed_url: string | null;
  quality: 'sd' | 'hd' | 'fullhd' | '4k';
}

// Progresso do usuário
export interface UserProgress {
  tutorial_id: string;
  completed_steps: number[];
  last_step: number;
  watch_time_seconds: number;
  completed_at: string | null;
  started_at: string;
}

// Filtros ativos
export interface ActiveFilters {
  category: string | null;
  difficulty: TutorialDifficulty | null;
  make: string | null;
  model: string | null;
  year: string | null;
  hasVideo: boolean;
  sortBy: 'recent' | 'popular' | 'rating' | 'duration';
}

// Estatísticas
export interface TutorialStats {
  total_tutorials: number;
  total_categories: number;
  total_views: number;
  avg_rating: number;
  by_category: Record<string, number>;
  by_difficulty: Record<TutorialDifficulty, number>;
}
