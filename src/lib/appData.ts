import { supabase } from './supabase';
import { hashPassword, normalizeUsername } from './auth';
import { DEFAULT_OSCAR_MOVIES, readLegacyMovieData, readLegacySeriesData } from './catalog';
import type {
  AppUser,
  OscarMovie,
  OscarMovieWithStatus,
  PersonalMovie,
  SeriesEntry,
  MovieStatus,
  SeriesStatus,
} from '../types/app';

type UserRow = AppUser & { password_hash: string };

const BOOTSTRAP_KEY = 'letterboxmzz_bootstrap_v1';

function titleKey(title: string) {
  return title.trim().toLowerCase();
}

export async function bootstrapApp() {
  if (typeof window === 'undefined') return;
  if (sessionStorage.getItem(BOOTSTRAP_KEY)) return;

  const { count } = await supabase
    .from('oscar_movies')
    .select('*', { count: 'exact', head: true });

  if (!count) {
    const { error } = await supabase.from('oscar_movies').insert(DEFAULT_OSCAR_MOVIES);
    if (error) throw error;
  }

  const normalized = normalizeUsername('edumzz');
  const existingUser = await supabase
    .from('app_users')
    .select('*')
    .eq('username', normalized)
    .maybeSingle<UserRow>();

  if (existingUser.error) throw existingUser.error;

  let userId = existingUser.data?.id;

  if (!userId) {
    const passwordHash = await hashPassword('finho');
    const insertedUser = await supabase
      .from('app_users')
      .insert({ username: normalized, password_hash: passwordHash })
      .select('id')
      .single<{ id: string }>();

    if (insertedUser.error) throw insertedUser.error;
    userId = insertedUser.data.id;
  }

  const personalCount = await supabase
    .from('personal_movies')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (personalCount.error) throw personalCount.error;

  const seriesCount = await supabase
    .from('personal_series')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (seriesCount.error) throw seriesCount.error;

  const oscarMoviesResult = await supabase
    .from('oscar_movies')
    .select('*')
    .order('ano_oscar', { ascending: false })
    .order('titulo', { ascending: true });
  if (oscarMoviesResult.error) throw oscarMoviesResult.error;

  const { personalMovies, oscarStatuses } = readLegacyMovieData();
  const legacySeries = readLegacySeriesData();

  if ((personalCount.count ?? 0) === 0 && personalMovies.length > 0) {
    const { error } = await supabase
      .from('personal_movies')
      .insert(personalMovies.map((movie) => ({ ...movie, user_id: userId })));
    if (error) throw error;
  }

  if ((seriesCount.count ?? 0) === 0 && legacySeries.length > 0) {
    const { error } = await supabase
      .from('personal_series')
      .insert(legacySeries.map((series) => ({ ...series, user_id: userId })));
    if (error) throw error;
  }

  if (oscarStatuses.size > 0) {
    const payload = oscarMoviesResult.data
      .map((movie) => {
        const status = oscarStatuses.get(titleKey(movie.titulo));
        if (!status) return null;
        return { user_id: userId, oscar_movie_id: movie.id, status };
      })
      .filter(Boolean);

    if (payload.length > 0) {
      const { error } = await supabase
        .from('user_oscar_movies')
        .upsert(payload, { onConflict: 'user_id,oscar_movie_id' });
      if (error) throw error;
    }
  }

  sessionStorage.setItem(BOOTSTRAP_KEY, '1');
}

export async function loginUser(username: string, password: string) {
  const normalized = normalizeUsername(username);
  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from('app_users')
    .select('id, username, password_hash')
    .eq('username', normalized)
    .maybeSingle<UserRow>();

  if (error) throw error;
  if (!data || data.password_hash !== passwordHash) {
    throw new Error('Usuario ou senha invalidos.');
  }

  return { id: data.id, username: data.username };
}

export async function registerUser(username: string, password: string) {
  const normalized = normalizeUsername(username);
  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from('app_users')
    .insert({ username: normalized, password_hash: passwordHash })
    .select('id, username')
    .single<AppUser>();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Esse username ja esta em uso.');
    }
    throw error;
  }

  return { id: data.id, username: data.username };
}

export async function listUsers() {
  const { data, error } = await supabase
    .from('app_users')
    .select('id, username, created_at')
    .order('username', { ascending: true });

  if (error) throw error;
  return data as AppUser[];
}

export async function getOscarMoviesForUser(userId: string) {
  const [moviesResult, statusesResult] = await Promise.all([
    supabase
      .from('oscar_movies')
      .select('*')
      .order('ano_oscar', { ascending: false })
      .order('titulo', { ascending: true }),
    supabase
      .from('user_oscar_movies')
      .select('oscar_movie_id, status')
      .eq('user_id', userId),
  ]);

  if (moviesResult.error) throw moviesResult.error;
  if (statusesResult.error) throw statusesResult.error;

  const statusByMovie = new Map(
    (statusesResult.data ?? []).map((item) => [item.oscar_movie_id, item.status as MovieStatus]),
  );

  return (moviesResult.data as OscarMovie[]).map((movie) => ({
    ...movie,
    status: statusByMovie.get(movie.id) ?? 'watchlist',
  })) as OscarMovieWithStatus[];
}

export async function addOscarMovie(movie: Omit<OscarMovie, 'id'>) {
  const { data, error } = await supabase
    .from('oscar_movies')
    .insert(movie)
    .select('*')
    .single<OscarMovie>();

  if (error) throw error;
  return data;
}

export async function setOscarMovieStatus(userId: string, movie: OscarMovie, status: MovieStatus) {
  const { error: oscarError } = await supabase
    .from('user_oscar_movies')
    .upsert(
      {
        user_id: userId,
        oscar_movie_id: movie.id,
        status,
      },
      { onConflict: 'user_id,oscar_movie_id' },
    );

  if (oscarError) throw oscarError;

  const personalPayload = {
    user_id: userId,
    titulo: movie.titulo,
    ano_lancamento: movie.ano_oscar,
    capa_url: movie.capa_url,
    plataforma_slug: movie.plataforma_slug,
    status,
    source: 'oscar' as const,
    source_movie_id: movie.id,
  };

  const { error: personalError } = await supabase
    .from('personal_movies')
    .upsert(personalPayload, { onConflict: 'user_id,source_movie_id' });

  if (personalError) throw personalError;
}

export async function listPersonalMovies(userId: string) {
  const { data, error } = await supabase
    .from('personal_movies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as PersonalMovie[];
}

export async function addPersonalMovie(
  userId: string,
  movie: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'>,
) {
  const { data, error } = await supabase
    .from('personal_movies')
    .insert({ ...movie, user_id: userId })
    .select('*')
    .single<PersonalMovie>();

  if (error) throw error;
  return data;
}

export async function updatePersonalMovie(
  movieId: string,
  updates: Partial<Pick<PersonalMovie, 'status' | 'plataforma_slug'>>,
) {
  const { data, error } = await supabase
    .from('personal_movies')
    .update(updates)
    .eq('id', movieId)
    .select('*')
    .single<PersonalMovie>();

  if (error) throw error;
  return data;
}

export async function deletePersonalMovie(movieId: string) {
  const { error } = await supabase.from('personal_movies').delete().eq('id', movieId);
  if (error) throw error;
}

export async function listSeries(userId: string) {
  const { data, error } = await supabase
    .from('personal_series')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SeriesEntry[];
}

export async function addSeries(
  userId: string,
  series: Omit<SeriesEntry, 'id' | 'user_id' | 'created_at'>,
) {
  const { data, error } = await supabase
    .from('personal_series')
    .insert({ ...series, user_id: userId })
    .select('*')
    .single<SeriesEntry>();

  if (error) throw error;
  return data;
}

export async function updateSeries(
  seriesId: string,
  updates: Partial<
    Pick<
      SeriesEntry,
      'status' | 'temporada' | 'total_episodios' | 'episodios_vistos' | 'plataforma_slug'
    >
  >,
) {
  const { data, error } = await supabase
    .from('personal_series')
    .update(updates)
    .eq('id', seriesId)
    .select('*')
    .single<SeriesEntry>();

  if (error) throw error;
  return data;
}

export async function deleteSeries(seriesId: string) {
  const { error } = await supabase.from('personal_series').delete().eq('id', seriesId);
  if (error) throw error;
}

export function getSeriesStatus(episodiosVistos: number, totalEpisodios: number): SeriesStatus {
  return totalEpisodios > 0 && episodiosVistos >= totalEpisodios ? 'watched' : 'watching';
}
