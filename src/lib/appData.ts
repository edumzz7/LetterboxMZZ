import type { Models } from 'appwrite';
import { databases, ID, Query } from './appwrite';
import { hashPassword, normalizeUsername, verifyPassword } from './auth';
import { DEFAULT_OSCAR_MOVIES, readLegacyMovieData, readLegacySeriesData } from './catalog';
import type {
  ActivityEntry,
  AppUser,
  CineMatchMode,
  CineMatchSuggestion,
  MovieStatus,
  OscarMovie,
  OscarMovieWithStatus,
  PersonalMovie,
  RankedUser,
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
  status: SeriesStatus;
};

type AppwriteMetadataDoc = Models.Document & {
  user_id: string;
  mcoins: number;
  avatar_id: string;
};

type AppwriteActivityDoc = Models.Document & {
  user_id: string;
  message: string;
  mcoins_delta: number;
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
const COLLECTION_USUARIOS_METADATA =
  import.meta.env.VITE_APPWRITE_COLLECTION_USUARIOS_METADATA ?? 'usuarios_metadata';
const COLLECTION_ATIVIDADES = import.meta.env.VITE_APPWRITE_COLLECTION_ATIVIDADES ?? 'atividades';

const SEED_USERNAME = import.meta.env.VITE_SEED_USERNAME?.trim();
const SEED_PASSWORD = import.meta.env.VITE_SEED_PASSWORD?.trim();
const PUBLIC_APP_URL = (import.meta.env.VITE_PUBLIC_APP_URL ?? 'https://letterbox-mzz.vercel.app').replace(
  /\/$/,
  '',
);
const FALLBACK_POSTER_URL = 'https://placehold.co/600x900/png';
const AVATAR_IDS = ['reel', 'clapper', 'popcorn', 'projector', 'ticket'];

const TRIGGER_POINTS = {
  ASSISTIU_FILME: 30,
  INICIOU_SERIE: 20,
  SERIE_100: 50,
  INDICOU_FILME: 5,
  FILME_INDICADO_ASSISTIDO: 40,
  SERIE_INDICADA_100: 60,
  BONUS_CURADOR: 30,
} as const;

type TriggerKey = keyof typeof TRIGGER_POINTS;

function ensureValidUrl(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return FALLBACK_POSTER_URL;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (trimmed.startsWith('/')) {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${trimmed}`;
    }
    return `${PUBLIC_APP_URL}${trimmed}`;
  }

  return `https://${trimmed}`;
}

function titleKey(title: string) {
  return title.trim().toLowerCase();
}

function wrapPermissionError(error: unknown, collectionId: string) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: number }).code : undefined;
  if (code === 401 || code === 403) {
    return new Error(`Sem permissao de escrita em '${collectionId}'. Configure permissoes 'Any' (Create/Read/Update/Delete) no Appwrite.`);
  }

  return error;
}

async function createDocument<T extends Record<string, unknown>>(collectionId: string, data: T) {
  try {
    return await databases.createDocument(DATABASE_ID, collectionId, ID.unique(), data);
  } catch (error) {
    throw wrapPermissionError(error, collectionId);
  }
}

async function updateDocument<T extends Record<string, unknown>>(collectionId: string, documentId: string, data: T) {
  try {
    return await databases.updateDocument(DATABASE_ID, collectionId, documentId, data);
  } catch (error) {
    throw wrapPermissionError(error, collectionId);
  }
}

async function deleteDocument(collectionId: string, documentId: string) {
  try {
    await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
  } catch (error) {
    throw wrapPermissionError(error, collectionId);
  }
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
    status: doc.status ?? getSeriesStatus(episodiosVistos, totalEpisodios),
    temporada: 1,
    total_episodios: totalEpisodios,
    episodios_vistos: episodiosVistos,
    plataforma_slug: doc.plataforma ?? null,
    created_at: doc.$createdAt,
  };
}

function parseRecommendedSource(sourceMovieId: string | null | undefined) {
  if (!sourceMovieId) return null;
  const match = sourceMovieId.match(/^tmdb:(\d+)\|rec:([A-Za-z0-9_-]+)$/);
  if (!match) return null;
  return { tmdbId: match[1], recommenderId: match[2] };
}

function mapActivity(doc: AppwriteActivityDoc): ActivityEntry {
  return {
    id: doc.$id,
    user_id: doc.user_id,
    message: doc.message,
    mcoins_delta: doc.mcoins_delta,
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

function fallbackAvatar(userId: string) {
  const index = Math.abs(Array.from(userId).reduce((sum, char) => sum + char.charCodeAt(0), 0)) % AVATAR_IDS.length;
  return AVATAR_IDS[index];
}

async function ensureUserMetadata(userId: string) {
  const existing = await firstDocument<AppwriteMetadataDoc>(COLLECTION_USUARIOS_METADATA, [
    Query.equal('user_id', [userId]),
  ]);

  if (existing) return existing;

  return (await createDocument(COLLECTION_USUARIOS_METADATA, {
    user_id: userId,
    mcoins: 0,
    avatar_id: fallbackAvatar(userId),
  })) as unknown as AppwriteMetadataDoc;
}

async function getUsernameById(userId: string) {
  try {
    const doc = (await databases.getDocument(DATABASE_ID, COLLECTION_APP_USERS, userId)) as unknown as AppwriteUserDoc;
    return doc.username;
  } catch {
    return 'Usuario';
  }
}

async function addActivity(userId: string, message: string, mcoinsDelta: number) {
  await createDocument(COLLECTION_ATIVIDADES, {
    user_id: userId,
    message,
    mcoins_delta: mcoinsDelta,
  });
}

async function awardMCoins(userId: string, trigger: TriggerKey, message: string) {
  const delta = TRIGGER_POINTS[trigger];
  const metadata = await ensureUserMetadata(userId);

  await updateDocument(COLLECTION_USUARIOS_METADATA, metadata.$id, {
    mcoins: Math.max(0, (metadata.mcoins ?? 0) + delta),
  });

  const username = await getUsernameById(userId);
  await addActivity(userId, `${username} ${message} (+${delta} MC)`, delta);
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
    await updateDocument(COLLECTION_USER_OSCAR_MOVIES, existing.$id, payload);
    return existing;
  }

  await createDocument(COLLECTION_USER_OSCAR_MOVIES, payload);
  return null;
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
    await updateDocument(COLLECTION_PERSONAL_MOVIES, existing.$id, payload);
    return;
  }

  await createDocument(COLLECTION_PERSONAL_MOVIES, payload);
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
        createDocument(COLLECTION_OSCAR_MOVIES, {
          titulo: movie.titulo,
          capaUrl: ensureValidUrl(movie.capa_url),
          plataforma: movie.plataforma_slug ?? 'stremio',
          categoria: movie.categoria_principal ?? 'Melhor Filme',
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
    const insertedUser = (await createDocument(COLLECTION_APP_USERS, {
      username: normalized,
      password_hash: passwordHash,
    })) as unknown as AppwriteUserDoc;
    userId = insertedUser.$id;
    await ensureUserMetadata(userId);
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
        createDocument(COLLECTION_PERSONAL_MOVIES, {
          ...movie,
          user_id: userId,
        }),
      ),
    );
  }

  if (seriesDocs.length === 0 && legacySeries.length > 0) {
    await Promise.all(
      legacySeries.map((series) =>
        createDocument(COLLECTION_PERSONAL_SERIES, {
          titulo: series.titulo,
          capaUrl: ensureValidUrl(series.capa_url),
          plataforma: series.plataforma_slug ?? 'stremio',
          episodiosVistos: Math.max(0, series.episodios_vistos),
          totalEpisodios: Math.max(1, series.total_episodios),
          status: series.status,
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

  await ensureUserMetadata(data.$id);
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
    const data = (await createDocument(COLLECTION_APP_USERS, {
      username: normalized,
      password_hash: passwordHash,
    })) as unknown as AppwriteUserDoc;

    await ensureUserMetadata(data.$id);
    await addActivity(data.$id, `${data.username} entrou no LetterboxZZO.`, 0);

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

export async function listRankedUsers() {
  const [users, metadata] = await Promise.all([
    listUsers(),
    listDocuments<AppwriteMetadataDoc>(COLLECTION_USUARIOS_METADATA),
  ]);

  const metadataByUser = new Map(metadata.map((item) => [item.user_id, item]));

  const ranked = users
    .map((user) => {
      const userMeta = metadataByUser.get(user.id);
      return {
        ...user,
        user_id: user.id,
        mcoins: userMeta?.mcoins ?? 0,
        avatar_id: userMeta?.avatar_id ?? fallbackAvatar(user.id),
      };
    })
    .sort((a, b) => b.mcoins - a.mcoins || a.username.localeCompare(b.username));

  return ranked.map((user, index) => ({ ...user, rank: index + 1 })) as RankedUser[];
}

export async function listActivities(limit = 30) {
  const data = await listDocuments<AppwriteActivityDoc>(COLLECTION_ATIVIDADES, [
    Query.orderDesc('$createdAt'),
    Query.limit(limit),
  ]);

  return data.map(mapActivity);
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

export async function addOscarMovie(userId: string, movie: Omit<OscarMovie, 'id'>) {
  const data = await createDocument(COLLECTION_OSCAR_MOVIES, {
    titulo: movie.titulo,
    capaUrl: ensureValidUrl(movie.capa_url),
    plataforma: movie.plataforma_slug ?? 'stremio',
    categoria: movie.categoria_principal ?? 'Melhor Filme',
    ano: movie.ano_oscar,
  });

  await awardMCoins(userId, 'INDICOU_FILME', `${movie.titulo} foi indicado para a lista.`);
  return mapOscarMovie(data as unknown as AppwriteOscarMovieDoc);
}

export async function setOscarMovieStatus(userId: string, movie: OscarMovie, status: MovieStatus) {
  const previous = await upsertUserOscarMovie(userId, movie.id, status);
  await upsertPersonalOscarMovie(userId, movie, status);

  if (status === 'watched' && previous?.status !== 'watched') {
    await awardMCoins(userId, 'ASSISTIU_FILME', `Assistiu ao filme ${movie.titulo}.`);
  }
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
  const data = await createDocument(COLLECTION_PERSONAL_MOVIES, {
    ...movie,
    user_id: userId,
  });

  return mapPersonalMovie(data as unknown as AppwritePersonalMovieDoc);
}

export async function updatePersonalMovie(
  movieId: string,
  updates: Partial<Pick<PersonalMovie, 'status' | 'plataforma_slug'>>,
) {
  const current = await databases.getDocument(DATABASE_ID, COLLECTION_PERSONAL_MOVIES, movieId);

  const data = await updateDocument(
    COLLECTION_PERSONAL_MOVIES,
    movieId,
    updates as Record<string, string | number | null>,
  );

  const currentDoc = current as unknown as AppwritePersonalMovieDoc;
  const nextDoc = data as unknown as AppwritePersonalMovieDoc;

  if (currentDoc.status !== 'watched' && nextDoc.status === 'watched') {
    const recommendation = parseRecommendedSource(nextDoc.source_movie_id);
    if (recommendation) {
      await awardMCoins(nextDoc.user_id, 'FILME_INDICADO_ASSISTIDO', `Assistiu ao filme indicado: ${nextDoc.titulo}.`);
      await awardMCoins(
        recommendation.recommenderId,
        'BONUS_CURADOR',
        `Seu filme indicado (${nextDoc.titulo}) foi assistido.`,
      );
    } else {
      await awardMCoins(nextDoc.user_id, 'ASSISTIU_FILME', `Assistiu ao filme ${nextDoc.titulo}.`);
    }
  }

  return mapPersonalMovie(nextDoc);
}

export async function deletePersonalMovie(movieId: string) {
  await deleteDocument(COLLECTION_PERSONAL_MOVIES, movieId);
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
  const data = await createDocument(COLLECTION_PERSONAL_SERIES, {
    titulo: series.titulo,
    capaUrl: ensureValidUrl(series.capa_url),
    plataforma: series.plataforma_slug ?? 'stremio',
    episodiosVistos: Math.max(0, series.episodios_vistos),
    totalEpisodios: Math.max(1, series.total_episodios),
    status: series.status,
  });

  await awardMCoins(userId, 'INICIOU_SERIE', `Iniciou a serie ${series.titulo}.`);
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
  const current = (await databases.getDocument(DATABASE_ID, COLLECTION_PERSONAL_SERIES, seriesId)) as unknown as AppwriteSeriesDoc;

  const mappedUpdates: Record<string, number | string | null> = {};
  if (updates.episodios_vistos !== undefined) mappedUpdates.episodiosVistos = updates.episodios_vistos;
  if (updates.total_episodios !== undefined) mappedUpdates.totalEpisodios = updates.total_episodios;
  if (updates.plataforma_slug !== undefined) mappedUpdates.plataforma = updates.plataforma_slug;
  if (updates.status !== undefined) mappedUpdates.status = updates.status;

  const data = (await updateDocument(COLLECTION_PERSONAL_SERIES, seriesId, mappedUpdates)) as unknown as AppwriteSeriesDoc;

  if (current.status !== 'watched' && data.status === 'watched') {
    const viewerId = (current as { user_id?: string }).user_id ?? '';
    if (viewerId) {
      await awardMCoins(viewerId, 'SERIE_100', `Finalizou 100% da serie ${data.titulo}.`);
    }
  }

  return mapSeries(data);
}


export async function updateOscarMoviePlatform(movieId: string, platformSlug: string) {
  await updateDocument(COLLECTION_OSCAR_MOVIES, movieId, {
    plataforma: platformSlug,
  });
}

export async function suggestMovieToUser(
  fromUserId: string,
  toUserId: string,
  movie: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'>,
) {
  await createDocument(COLLECTION_PERSONAL_MOVIES, {
    ...movie,
    source_movie_id: movie.source_movie_id
      ? `tmdb:${movie.source_movie_id}|rec:${fromUserId}`
      : null,
    user_id: toUserId,
  });

  await awardMCoins(fromUserId, 'INDICOU_FILME', `indicou o filme ${movie.titulo}.`);
}
export async function deleteSeries(seriesId: string) {
  await deleteDocument(COLLECTION_PERSONAL_SERIES, seriesId);
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

export async function getCineMatchSuggestion(
  currentUserId: string,
  friendUserId: string,
  mode: CineMatchMode,
): Promise<CineMatchSuggestion | null> {
  if (mode === 'geral') {
    const [meOscar, friendOscar, mePersonal, friendPersonal] = await Promise.all([
      getOscarMoviesForUser(currentUserId),
      getOscarMoviesForUser(friendUserId),
      listPersonalMovies(currentUserId),
      listPersonalMovies(friendUserId),
    ]);

    const meWatchlist = [...meOscar.filter((item) => item.status === 'watchlist'), ...mePersonal.filter((item) => item.status === 'watchlist')];
    const friendWatchlist = [...friendOscar.filter((item) => item.status === 'watchlist'), ...friendPersonal.filter((item) => item.status === 'watchlist')];

    const friendByTitle = new Map(friendWatchlist.map((item) => [titleKey(item.titulo), item]));
    const common = meWatchlist.filter((item) => friendByTitle.has(titleKey(item.titulo)));
    const picked = pickRandom(common);

    if (!picked) return null;

    return {
      titulo: picked.titulo,
      capa_url: picked.capa_url,
      origem: 'geral',
      reason: 'Watchlist em comum encontrada para os dois.',
    };
  }

  const [allOscar, myStatuses, friendStatuses] = await Promise.all([
    listDocuments<AppwriteOscarMovieDoc>(COLLECTION_OSCAR_MOVIES),
    listDocuments<AppwriteUserOscarMovieDoc>(COLLECTION_USER_OSCAR_MOVIES, [Query.equal('user_id', [currentUserId])]),
    listDocuments<AppwriteUserOscarMovieDoc>(COLLECTION_USER_OSCAR_MOVIES, [Query.equal('user_id', [friendUserId])]),
  ]);

  const watchedByMe = new Set(myStatuses.filter((item) => item.status === 'watched').map((item) => item.oscar_movie_id));
  const watchedByFriend = new Set(friendStatuses.filter((item) => item.status === 'watched').map((item) => item.oscar_movie_id));

  const available = allOscar.filter((movie) => !watchedByMe.has(movie.$id) && !watchedByFriend.has(movie.$id));
  const picked = pickRandom(available);

  if (!picked) return null;

  return {
    titulo: picked.titulo,
    capa_url: picked.capaUrl,
    origem: 'oscar',
    reason: 'Oscar pendente para os dois usuarios.',
  };
}

export function getSeriesStatus(episodiosVistos: number, totalEpisodios: number): SeriesStatus {
  return totalEpisodios > 0 && episodiosVistos >= totalEpisodios ? 'watched' : 'watching';
}











