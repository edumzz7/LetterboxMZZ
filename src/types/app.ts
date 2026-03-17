export type MovieStatus = 'watchlist' | 'watched';
export type SeriesStatus = 'watching' | 'watched';

export interface AppUser {
  id: string;
  username: string;
  created_at: string;
}

export interface OscarMovie {
  id: string;
  titulo: string;
  ano_oscar: number;
  categoria_principal: string | null;
  capa_url: string | null;
  plataforma_slug: string | null;
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
  created_at: string;
}

export interface SessionUser {
  id: string;
  username: string;
}
