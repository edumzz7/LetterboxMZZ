export type MovieStatus = 'watchlist' | 'watched';
export type SeriesStatus = 'watchlist' | 'watching' | 'watched';

export interface AppUser {
  id: string;
  username: string;
  created_at: string;
}

export interface UserMetadata {
  user_id: string;
  mcoins: number;
  avatar_id: string;
  display_name?: string;
  favorite_movie?: string;
  favorite_genre?: string;
  watch_preference?: 'home' | 'cinema';
}

export interface RankedUser extends AppUser, UserMetadata {
  rank: number;
}

export interface OscarMovie {
  id: string;
  titulo: string;
  ano_oscar: number;
  categoria_principal: string | null;
  capa_url: string | null;
  plataforma_slug: string | null;
  rating?: number | null;
  streaming_data?: string | null;
}

export interface OscarMovieWithStatus extends OscarMovie {
  status: MovieStatus;
}

export interface PersonalMovie {
  id: string;
  user_id: string;
  titulo: string;
  ano_lancamento: number | null;
  capa_url: string | null;
  plataforma_slug: string | null;
  status: MovieStatus;
  source: 'manual' | 'oscar';
  source_movie_id: string | null;
  indicado_por_user_id?: string | null;
  avaliacao?: number | null;
  rating?: number | null;
  streaming_data?: string | null;
  created_at: string;
}

export interface SeriesEntry {
  id: string;
  user_id: string;
  titulo: string;
  capa_url: string | null;
  status: SeriesStatus;
  temporada: number;
  total_episodios: number;
  episodios_vistos: number;
  plataforma_slug: string | null;
  indicado_por_user_id?: string | null;
  avaliacao?: number | null;
  rating?: number | null;
  streaming_data?: string | null;
  created_at: string;
}

export interface SessionUser {
  id: string;
  username: string;
}

export interface ActivityEntry {
  id: string;
  user_id: string;
  message: string;
  mcoins_delta: number;
  created_at: string;
}

export type CineMatchMode = 'geral' | 'oscar';

export interface CineMatchSuggestion {
  titulo: string;
  capa_url: string | null;
  origem: CineMatchMode;
  reason: string;
}

