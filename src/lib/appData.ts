import type { Models } from 'appwrite';
import { databases, ID, Query } from './appwrite';
import { hashPassword, normalizeUsername, verifyPassword } from './auth';
import { DEFAULT_OSCAR_MOVIES, readLegacyMovieData, readLegacySeriesData } from './catalog';
import type {
  AppUser,
  MovieStatus,
  OscarMovie,
  OscarMovieWithStatus,
  PersonalMovie,
  SeriesEntry,
  SeriesStatus,
} from '../types/app';

type UserRow = AppUser & { password_hash: string };

type AppwriteUserDoc = Models.Document & {
  username: string;
  password_hash: string;
};

type AppwriteOscarMovieDoc = Models.Document & {
  titulo: string;
  ano: number;
  categoria: string | null;
  capaUrl: string | null;
  plataforma: string | null;
};

type AppwriteUserOscarMovieDoc = Models.Document & {
  user_id: string;
  oscar_movie_id: string;
  status: MovieStatus;
};

type AppwritePersonalMovieDoc = Models.Document & {
  user_id: string;
  titulo: string;
  ano_lancamento: number | null;
  capa_url: string | null;
  plataforma_slug: string | null;
  status: MovieStatus;
  source: 'manual' | 'oscar';
  source_movie_id: string | null;
};

type AppwriteSeriesDoc = Models.Document & {
  titulo: string;
  capaUrl: string | null;
  plataforma: string | null;
  totalEpisodios: number;
  episodiosVistos: number;
};

const BOOTSTRAP_KEY = 'letterboxmzz_bootstrap_v1';
const QUERY_LIMIT = 5000;

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID ?? 'letterboxmzz';
const COLLECTION_APP_USERS = import.meta.env.VITE_APPWRITE_COLLECTION_APP_USERS ?? 'app_users';
const COLLECTION_OSCAR_MOVIES =
  import.meta.env.VITE_APPWRITE_COLLECTION_OSCAR_MOVIES ?? 'filmes_oscar';
const COLLECTION_USER_OSCAR_MOVIES =
  import.meta.env.VITE_APPWRITE_COLLECTION_USER_OSCAR_MOVIES ?? 'user_oscar_movies';
const COLLECTION_PERSONAL_MOVIES =
  import.meta.env.VITE_APPWRITE_COLLECTION_PERSONAL_MOVIES ?? 'personal_movies';
const COLLECTION_PERSONAL_SERIES =
  import.meta.env.VITE_APPWRITE_COLLECTION_PERSONAL_SERIES ?? 'series_pessoais';
const SEED_USERNAME = import.meta.env.VITE_SEED_USERNAME?.trim();
const SEED_PASSWORD = import.meta.env.VITE_SEED_PASSWORD?.trim();

function titleKey(title: string) {
  return title.trim().toLowerCase();
}

function mapUser(doc: AppwriteUserDoc): UserRow {
  return {
    id: doc.$id,
    username: doc.username,
    password_hash: doc.password_hash,
    created_at: doc.$createdAt,
  };
}

function mapOscarMovie(doc: AppwriteOscarMovieDoc): OscarMovie {
  return {
    id: doc.$id,
    titulo: doc.titulo,
    ano_oscar: doc.ano,
    categoria_principal: doc.categoria ?? null,
    capa_url: doc.capaUrl ?? null,
    plataforma_slug: doc.plataforma ?? null,
  };
}

function mapPersonalMovie(doc: AppwritePersonalMovieDoc): PersonalMovie {
  return {
    id: doc.$id,
    user_id: doc.user_id,
    titulo: doc.titulo,
    ano_lancamento: doc.ano_lancamento ?? null,
    capa_url: doc.capa_url ?? null,
    plataforma_slug: doc.plataforma_slug ?? null,
    status: doc.status,
    source: doc.source,
    source_movie_id: doc.source_movie_id ?? null,
    created_at: doc.$createdAt,
  };
}

function mapSeries(doc: AppwriteSeriesDoc): SeriesEntry {
  const totalEpisodios = doc.totalEpisodios ?? 0;
  const episodiosVistos = doc.episodiosVistos ?? 0;
  return {
    id: doc.$id,
    user_id: '',
    titulo: doc.titulo,
    capa_url: doc.capaUrl ?? null,
    status: getSeriesStatus(episodiosVistos, totalEpisodios),
    temporada: 1,
    total_episodios: totalEpisodios,
    episodios_vistos: episodiosVistos,
    plataforma_slug: doc.plataforma ?? null,
    created_at: doc.$createdAt,
  };
}

async function listDocuments<T extends Models.Document>(collectionId: string, queries: string[] = []) {
  const result = await databases.listDocuments(DATABASE_ID, collectionId, [
    Query.limit(QUERY_LIMIT),
    ...queries,
  ]);
  return result.documents as unknown as T[];
}

async function firstDocument<T extends Models.Document>(collectionId: string, queries: string[]) {
  const docs = await listDocuments<T>(collectionId, [Query.limit(1), ...queries]);
  return docs[0] ?? null;
}

function isConflictError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 409
  );
}

async function upsertUserOscarMovie(userId: string, oscarMovieId: string, status: MovieStatus) {
  const existing = await firstDocument<AppwriteUserOscarMovieDoc>(COLLECTION_USER_OSCAR_MOVIES, [
    Query.equal('user_id', [userId]),
    Query.equal('oscar_movie_id', [oscarMovieId]),
  ]);

  const payload = {
    user_id: userId,
    oscar_movie_id: oscarMovieId,
    status,
  };

  if (existing) {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_USER_OSCAR_MOVIES,
      existing.$id,
      payload,
    );
    return;
  }

  await databases.createDocument(DATABASE_ID, COLLECTION_USER_OSCAR_MOVIES, ID.unique(), payload);
}

async function upsertPersonalOscarMovie(userId: string, movie: OscarMovie, status: MovieStatus) {
  const existing = await firstDocument<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
    Query.equal('user_id', [userId]),
    Query.equal('source_movie_id', [movie.id]),
  ]);

  const payload = {
    user_id: userId,
    titulo: movie.titulo,
    ano_lancamento: movie.ano_oscar,
    capa_url: movie.capa_url,
    plataforma_slug: movie.plataforma_slug,
    status,
    source: 'oscar' as const,
    source_movie_id: movie.id,
  };

  if (existing) {
    await databases.updateDocument(DATABASE_ID, COLLECTION_PERSONAL_MOVIES, existing.$id, payload);
    return;
  }

  await databases.createDocument(DATABASE_ID, COLLECTION_PERSONAL_MOVIES, ID.unique(), payload);
}

export async function bootstrapApp() {
  if (typeof window === 'undefined') return;
  if (sessionStorage.getItem(BOOTSTRAP_KEY)) return;

  const existingOscarMovies = await listDocuments<AppwriteOscarMovieDoc>(COLLECTION_OSCAR_MOVIES, [
    Query.limit(1),
  ]);

  if (existingOscarMovies.length === 0) {
    await Promise.all(
      DEFAULT_OSCAR_MOVIES.map((movie) =>
        databases.createDocument(DATABASE_ID, COLLECTION_OSCAR_MOVIES, ID.unique(), {
          titulo: movie.titulo,
          capaUrl: movie.capa_url,
          plataforma: movie.plataforma_slug,
          categoria: movie.categoria_principal,
          ano: movie.ano_oscar,
        }),
      ),
    );
  }

  if (!SEED_USERNAME || !SEED_PASSWORD) {
    sessionStorage.setItem(BOOTSTRAP_KEY, '1');
    return;
  }

  const normalized = normalizeUsername(SEED_USERNAME);
  const existingUser = await firstDocument<AppwriteUserDoc>(COLLECTION_APP_USERS, [
    Query.equal('username', [normalized]),
  ]);

  let userId = existingUser?.$id;

  if (!userId) {
    const passwordHash = await hashPassword(SEED_PASSWORD);
    const insertedUser = await databases.createDocument(DATABASE_ID, COLLECTION_APP_USERS, ID.unique(), {
      username: normalized,
      password_hash: passwordHash,
    });
    userId = insertedUser.$id;
  }

  const personalDocs = await listDocuments<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
    Query.equal('user_id', [userId]),
    Query.limit(1),
  ]);

  const seriesDocs = await listDocuments<AppwriteSeriesDoc>(COLLECTION_PERSONAL_SERIES, [Query.limit(1)]);

  const oscarMovies = await listDocuments<AppwriteOscarMovieDoc>(COLLECTION_OSCAR_MOVIES, [
    Query.orderDesc('ano'),
    Query.orderAsc('titulo'),
  ]);

  const { personalMovies, oscarStatuses } = readLegacyMovieData();
  const legacySeries = readLegacySeriesData();

  if (personalDocs.length === 0 && personalMovies.length > 0) {
    await Promise.all(
      personalMovies.map((movie) =>
        databases.createDocument(DATABASE_ID, COLLECTION_PERSONAL_MOVIES, ID.unique(), {
          ...movie,
          user_id: userId,
        }),
      ),
    );
  }

  if (seriesDocs.length === 0 && legacySeries.length > 0) {
    await Promise.all(
      legacySeries.map((series) =>
        databases.createDocument(DATABASE_ID, COLLECTION_PERSONAL_SERIES, ID.unique(), {
          titulo: series.titulo,
          capaUrl: series.capa_url,
          plataforma: series.plataforma_slug,
          episodiosVistos: series.episodios_vistos,
          totalEpisodios: series.total_episodios,
        }),
      ),
    );
  }

  if (oscarStatuses.size > 0) {
    const updates = oscarMovies
      .map((movie) => {
        const status = oscarStatuses.get(titleKey(movie.titulo));
        if (!status) return null;
        return { movie, status };
      })
      .filter(Boolean) as { movie: AppwriteOscarMovieDoc; status: MovieStatus }[];

    await Promise.all(
      updates.map(({ movie, status }) => upsertUserOscarMovie(userId, movie.$id, status)),
    );
  }

  sessionStorage.setItem(BOOTSTRAP_KEY, '1');
}

export async function loginUser(username: string, password: string) {
  const normalized = normalizeUsername(username);

  const data = await firstDocument<AppwriteUserDoc>(COLLECTION_APP_USERS, [
    Query.equal('username', [normalized]),
  ]);

  if (!data || !(await verifyPassword(password, data.password_hash))) {
    throw new Error('Usuario ou senha invalidos.');
  }

  return { id: data.$id, username: data.username };
}

export async function registerUser(username: string, password: string) {
  const normalized = normalizeUsername(username);
  const passwordHash = await hashPassword(password);

  const existing = await firstDocument<AppwriteUserDoc>(COLLECTION_APP_USERS, [
    Query.equal('username', [normalized]),
  ]);

  if (existing) {
    throw new Error('Esse username ja esta em uso.');
  }

  try {
    const data = await databases.createDocument(DATABASE_ID, COLLECTION_APP_USERS, ID.unique(), {
      username: normalized,
      password_hash: passwordHash,
    });

    return { id: data.$id, username: data.username as string };
  } catch (error) {
    if (isConflictError(error)) {
      throw new Error('Esse username ja esta em uso.');
    }
    throw error;
  }
}

export async function listUsers() {
  const data = await listDocuments<AppwriteUserDoc>(COLLECTION_APP_USERS, [Query.orderAsc('username')]);
  return data.map(mapUser) as AppUser[];
}

export async function getOscarMoviesForUser(userId: string) {
  const [moviesResult, statusesResult] = await Promise.all([
    listDocuments<AppwriteOscarMovieDoc>(COLLECTION_OSCAR_MOVIES, [
      Query.orderDesc('ano'),
      Query.orderAsc('titulo'),
    ]),
    listDocuments<AppwriteUserOscarMovieDoc>(COLLECTION_USER_OSCAR_MOVIES, [
      Query.equal('user_id', [userId]),
    ]),
  ]);

  const statusByMovie = new Map(
    statusesResult.map((item) => [item.oscar_movie_id, item.status as MovieStatus]),
  );

  return moviesResult.map((movie) => ({
    ...mapOscarMovie(movie),
    status: statusByMovie.get(movie.$id) ?? 'watchlist',
  })) as OscarMovieWithStatus[];
}

export async function addOscarMovie(movie: Omit<OscarMovie, 'id'>) {
  const data = await databases.createDocument(DATABASE_ID, COLLECTION_OSCAR_MOVIES, ID.unique(), {
    titulo: movie.titulo,
    capaUrl: movie.capa_url,
    plataforma: movie.plataforma_slug,
    categoria: movie.categoria_principal,
    ano: movie.ano_oscar,
  });
  return mapOscarMovie(data as unknown as AppwriteOscarMovieDoc);
}

export async function setOscarMovieStatus(userId: string, movie: OscarMovie, status: MovieStatus) {
  await upsertUserOscarMovie(userId, movie.id, status);
  await upsertPersonalOscarMovie(userId, movie, status);
}

export async function listPersonalMovies(userId: string) {
  const data = await listDocuments<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
    Query.equal('user_id', [userId]),
    Query.orderDesc('$createdAt'),
  ]);
  return data.map(mapPersonalMovie) as PersonalMovie[];
}

export async function addPersonalMovie(
  userId: string,
  movie: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'>,
) {
  const data = await databases.createDocument(DATABASE_ID, COLLECTION_PERSONAL_MOVIES, ID.unique(), {
    ...movie,
    user_id: userId,
  });
  return mapPersonalMovie(data as unknown as AppwritePersonalMovieDoc);
}

export async function updatePersonalMovie(
  movieId: string,
  updates: Partial<Pick<PersonalMovie, 'status' | 'plataforma_slug'>>,
) {
  const data = await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_PERSONAL_MOVIES,
    movieId,
    updates,
  );
  return mapPersonalMovie(data as unknown as AppwritePersonalMovieDoc);
}

export async function deletePersonalMovie(movieId: string) {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_PERSONAL_MOVIES, movieId);
}

export async function listSeries(userId: string) {
  const data = await listDocuments<AppwriteSeriesDoc>(COLLECTION_PERSONAL_SERIES, [
    Query.orderDesc('$createdAt'),
  ]);
  return data.map((doc) => ({ ...mapSeries(doc), user_id: userId })) as SeriesEntry[];
}

export async function addSeries(
  userId: string,
  series: Omit<SeriesEntry, 'id' | 'user_id' | 'created_at'>,
) {
  const data = await databases.createDocument(DATABASE_ID, COLLECTION_PERSONAL_SERIES, ID.unique(), {
    titulo: series.titulo,
    capaUrl: series.capa_url,
    plataforma: series.plataforma_slug,
    episodiosVistos: series.episodios_vistos,
    totalEpisodios: series.total_episodios,
  });
  return { ...mapSeries(data as unknown as AppwriteSeriesDoc), user_id: userId };
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
  const mappedUpdates: Record<string, number | string | null> = {};
  if (updates.episodios_vistos !== undefined) mappedUpdates.episodiosVistos = updates.episodios_vistos;
  if (updates.total_episodios !== undefined) mappedUpdates.totalEpisodios = updates.total_episodios;
  if (updates.plataforma_slug !== undefined) mappedUpdates.plataforma = updates.plataforma_slug;

  const data = await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_PERSONAL_SERIES,
    seriesId,
    mappedUpdates,
  );
  return mapSeries(data as unknown as AppwriteSeriesDoc);
}

export async function deleteSeries(seriesId: string) {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_PERSONAL_SERIES, seriesId);
}

export function getSeriesStatus(episodiosVistos: number, totalEpisodios: number): SeriesStatus {
  return totalEpisodios > 0 && episodiosVistos >= totalEpisodios ? 'watched' : 'watching';
}
