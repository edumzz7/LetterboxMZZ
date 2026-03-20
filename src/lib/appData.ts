import type { Models } from 'appwrite';
import { account, databases, ID, Query } from './appwrite';
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

type AppwriteAccountDoc = Models.User<Models.Preferences> & {
  prefs?: {
    appUserId?: string;
    username?: string;
  };
};

type AppwriteOscarMovieDoc = Models.Document & {
  titulo: string;
  ano: number;
  categoria: string | null;
  capaUrl: string | null;
  plataforma: string | null;
  rating?: number | null;
  streamingData?: string | null;
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
  avaliacao?: number | null;
  rating?: number | null;
  streamingData?: string | null;
};

type AppwriteSeriesDoc = Models.Document & {
  user_id?: string;
  titulo: string;
  capaUrl: string | null;
  plataforma: string | null;
  totalEpisodios: number;
  episodiosVistos: number;
  status: AppwriteSeriesStatus;
  rating?: number | null;
  streamingData?: string | null;
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
const MANAGED_PASSWORD_PLACEHOLDER = 'managed-by-appwrite';
const MANAGED_PASSWORD_PREFIX = 'letterboxzzo::managed::';

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
  BONUS_EPISODIOS_COMPLETOS: 30,
  INDICOU_FILME: 5,
  FILME_INDICADO_ASSISTIDO: 40,
  SERIE_INDICADA_100: 60,
  BONUS_CURADOR: 30,
} as const;

type TriggerKey = keyof typeof TRIGGER_POINTS;
type AppwriteSeriesStatus = 'naoIniciado' | 'emProgresso' | 'concluido' | 'abandonado';

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

function toAppwriteSeriesStatus(
  status: SeriesStatus | undefined,
  episodiosVistos: number,
  totalEpisodios: number,
): AppwriteSeriesStatus {
  if (status === 'watched' || (totalEpisodios > 0 && episodiosVistos >= totalEpisodios)) {
    return 'concluido';
  }
  return 'emProgresso';
}

function fromAppwriteSeriesStatus(status: AppwriteSeriesStatus | string | null | undefined): SeriesStatus {
  return status === 'concluido' ? 'watched' : 'watching';
}

function wrapPermissionError(error: unknown, collectionId: string) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: number }).code : undefined;
  if (code === 401 || code === 403) {
    return new Error(`Sem permissao de escrita em '${collectionId}'. Configure permissoes 'Any' (Create/Read/Update/Delete) no Appwrite.`);
  }

  return error;
}

async function createDocument<T extends Record<string, unknown>>(collectionId: string, data: T) {
  let payload: Record<string, unknown> = { ...data };

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await databases.createDocument(DATABASE_ID, collectionId, ID.unique(), payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const unknownAttribute = message.match(/Unknown attribute: \"([^\"]+)\"/);
      if (unknownAttribute) {
        delete payload[unknownAttribute[1]];
        continue;
      }
      throw wrapPermissionError(error, collectionId);
    }
  }
  throw new Error('Nao foi possivel criar documento com os atributos atuais.');
}

async function createDocumentWithId<T extends Record<string, unknown>>(
  collectionId: string,
  documentId: string,
  data: T,
) {
  let payload: Record<string, unknown> = { ...data };

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await databases.createDocument(DATABASE_ID, collectionId, documentId, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const unknownAttribute = message.match(/Unknown attribute: \"([^\"]+)\"/);
      if (unknownAttribute) {
        delete payload[unknownAttribute[1]];
        continue;
      }
      throw wrapPermissionError(error, collectionId);
    }
  }
  throw new Error('Nao foi possivel criar documento com os atributos atuais.');
}

async function updateDocument<T extends Record<string, unknown>>(collectionId: string, documentId: string, data: T) {
  let payload: Record<string, unknown> = { ...data };

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await databases.updateDocument(DATABASE_ID, collectionId, documentId, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const unknownAttribute = message.match(/Unknown attribute: \"([^\"]+)\"/);
      if (unknownAttribute) {
        delete payload[unknownAttribute[1]];
        continue;
      }
      throw wrapPermissionError(error, collectionId);
    }
  }
  throw new Error('Nao foi possivel atualizar documento com os atributos atuais.');
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
    rating: doc.rating ?? null,
    streaming_data: doc.streamingData ?? null,
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
    avaliacao: doc.avaliacao ?? null,
    rating: doc.rating ?? null,
    streaming_data: doc.streamingData ?? null,
    created_at: doc.$createdAt,
  };
}

function mapSeries(doc: AppwriteSeriesDoc): SeriesEntry {
  const totalEpisodios = doc.totalEpisodios ?? 0;
  const episodiosVistos = doc.episodiosVistos ?? 0;
  return {
    id: doc.$id,
    user_id: doc.user_id ?? '',
    titulo: doc.titulo,
    capa_url: doc.capaUrl ?? null,
    status: fromAppwriteSeriesStatus(doc.status) ?? getSeriesStatus(episodiosVistos, totalEpisodios),
    temporada: 1,
    total_episodios: totalEpisodios,
    episodios_vistos: episodiosVistos,
    plataforma_slug: doc.plataforma ?? null,
    rating: doc.rating ?? null,
    streaming_data: doc.streamingData ?? null,
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

function createSessionEmail(username: string) {
  return `${normalizeUsername(username)}@letterboxzzo.local`;
}

function createManagedPassword(password: string) {
  return `${MANAGED_PASSWORD_PREFIX}${password}::v1`;
}

async function ensureAppwriteSession(username: string, password: string) {
  const email = createSessionEmail(username);
  await account.createEmailPasswordSession(email, createManagedPassword(password));
  return (await account.get()) as unknown as AppwriteAccountDoc;
}

async function getCurrentAccount() {
  try {
    return (await account.get()) as unknown as AppwriteAccountDoc;
  } catch {
    return null;
  }
}

async function createManagedAccount(username: string, password: string) {
  const normalized = normalizeUsername(username);
  const email = createSessionEmail(normalized);
  try {
    return await account.create(ID.unique(), email, createManagedPassword(password), normalized);
  } catch (error) {
    if (isConflictError(error)) {
      return null;
    }
    throw error;
  }
}

async function migrateLegacyUserToManagedSession(user: AppwriteUserDoc, password: string) {
  await createManagedAccount(user.username, password);
  const managedAccount = await ensureAppwriteSession(user.username, password);
  try {
    await account.updatePrefs({
      ...(managedAccount.prefs ?? {}),
      appUserId: user.$id,
      username: user.username,
    });
  } catch {
    // Keep compatibility if prefs update is unavailable; username lookup still works.
  }
  return managedAccount;
}

async function getSessionProfile() {
  const currentAccount = await getCurrentAccount();
  if (!currentAccount) return null;

  const prefs = currentAccount.prefs ?? {};
  const profileId = typeof prefs.appUserId === 'string' ? prefs.appUserId : null;
  const normalizedName = normalizeUsername(
    typeof prefs.username === 'string' && prefs.username.trim()
      ? prefs.username
      : currentAccount.name ?? '',
  );

  let profile: AppwriteUserDoc | null = null;

  if (profileId) {
    try {
      profile = (await databases.getDocument(
        DATABASE_ID,
        COLLECTION_APP_USERS,
        profileId,
      )) as unknown as AppwriteUserDoc;
    } catch {
      profile = null;
    }
  }

  if (!profile && normalizedName) {
    profile = await firstDocument<AppwriteUserDoc>(COLLECTION_APP_USERS, [
      Query.equal('username', [normalizedName]),
    ]);
  }

  if (!profile && normalizedName) {
    profile = (await createDocument(COLLECTION_APP_USERS, {
      username: normalizedName,
      password_hash: MANAGED_PASSWORD_PLACEHOLDER,
    })) as unknown as AppwriteUserDoc;
  }

  if (!profile) return null;

  try {
    await account.updatePrefs({
      ...(currentAccount.prefs ?? {}),
      appUserId: profile.$id,
      username: profile.username,
    });
  } catch {
    // Non-fatal; profile lookup can still fall back to username.
  }

  await ensureUserMetadata(profile.$id);
  return { id: profile.$id, username: profile.username };
}

async function grantMCoins(userId: string, trigger: TriggerKey) {
  const delta = TRIGGER_POINTS[trigger];
  const metadata = await ensureUserMetadata(userId);
  await updateDocument(COLLECTION_USUARIOS_METADATA, metadata.$id, {
    mcoins: Math.max(0, (metadata.mcoins ?? 0) + delta),
  });
  return delta;
}

async function awardMCoins(userId: string, trigger: TriggerKey, message: string) {
  const [delta, username] = await Promise.all([
    grantMCoins(userId, trigger),
    getUsernameById(userId),
  ]);
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
  const existingBySource = await firstDocument<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
    Query.equal('user_id', [userId]),
    Query.equal('source_movie_id', [movie.id]),
  ]);
  const existingByTitle = await firstDocument<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
    Query.equal('user_id', [userId]),
    Query.equal('titulo', [movie.titulo]),
  ]);
  const existing = existingBySource ?? existingByTitle;

  const payload = {
    user_id: userId,
    titulo: movie.titulo,
    ano_lancamento: movie.ano_oscar,
    capa_url: movie.capa_url,
    plataforma_slug: movie.plataforma_slug,
    status,
    source: 'oscar' as const,
    source_movie_id: movie.id,
    rating: movie.rating ?? null,
    streamingData: movie.streaming_data ?? null,
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
          rating: movie.rating ?? null,
          streamingData: movie.streaming_data ?? null,
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
          user_id: userId,
          titulo: series.titulo,
          capaUrl: ensureValidUrl(series.capa_url),
          plataforma: series.plataforma_slug ?? 'stremio',
          episodiosVistos: Math.max(0, series.episodios_vistos),
          totalEpisodios: Math.max(1, series.total_episodios),
          status: toAppwriteSeriesStatus(
            series.status,
            Math.max(0, series.episodios_vistos),
            Math.max(1, series.total_episodios),
          ),
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

  try {
    await ensureAppwriteSession(normalized, password);
    const profile = await getSessionProfile();
    if (!profile) {
      throw new Error('Perfil do usuario nao encontrado.');
    }
    return profile;
  } catch {
    const legacyUser = await firstDocument<AppwriteUserDoc>(COLLECTION_APP_USERS, [
      Query.equal('username', [normalized]),
    ]);

    if (!legacyUser || !(await verifyPassword(password, legacyUser.password_hash))) {
      throw new Error('Usuario ou senha invalidos.');
    }

    await migrateLegacyUserToManagedSession(legacyUser, password);
    await ensureUserMetadata(legacyUser.$id);
    return { id: legacyUser.$id, username: legacyUser.username };
  }
}

export async function registerUser(username: string, password: string) {
  const normalized = normalizeUsername(username);

  const existing = await firstDocument<AppwriteUserDoc>(COLLECTION_APP_USERS, [
    Query.equal('username', [normalized]),
  ]);

  if (existing) {
    throw new Error('Esse username ja esta em uso.');
  }

  try {
    const createdAccount = await account.create(
      ID.unique(),
      createSessionEmail(normalized),
      createManagedPassword(password),
      normalized,
    );
    await ensureAppwriteSession(normalized, password);

    const data = (await createDocumentWithId(COLLECTION_APP_USERS, createdAccount.$id, {
      username: normalized,
      password_hash: MANAGED_PASSWORD_PLACEHOLDER,
    })) as unknown as AppwriteUserDoc;

    try {
      await account.updatePrefs({
        appUserId: data.$id,
        username: data.username,
      });
    } catch {
      // Non-fatal
    }

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

export async function getCurrentSessionUser() {
  return getSessionProfile();
}

export async function logoutUser() {
  try {
    await account.deleteSession('current');
  } catch {
    // Ignore missing session and proceed with local cleanup.
  }
}

export async function updateUserAvatar(userId: string, avatarId: string) {
  const metadata = await ensureUserMetadata(userId);
  await updateDocument(COLLECTION_USUARIOS_METADATA, metadata.$id, {
    avatar_id: avatarId,
  });
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
    rating: movie.rating ?? null,
    streamingData: movie.streaming_data ?? null,
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
  const existingByTitle = await firstDocument<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
    Query.equal('user_id', [userId]),
    Query.equal('titulo', [movie.titulo]),
  ]);
  if (existingByTitle) {
    throw new Error('Esse filme ja esta na sua lista.');
  }

  if (movie.source_movie_id) {
    const existingBySource = await firstDocument<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
      Query.equal('user_id', [userId]),
      Query.equal('source_movie_id', [movie.source_movie_id]),
    ]);
    if (existingBySource) {
      throw new Error('Esse filme ja esta na sua lista.');
    }
  }

  const data = await createDocument(COLLECTION_PERSONAL_MOVIES, {
    ...movie,
    rating: movie.rating ?? null,
    streamingData: movie.streaming_data ?? null,
    user_id: userId,
  });

  return mapPersonalMovie(data as unknown as AppwritePersonalMovieDoc);
}

export async function updatePersonalMovie(
  movieId: string,
  updates: Partial<Pick<PersonalMovie, 'status' | 'plataforma_slug' | 'avaliacao'>>,
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
  try {
    const data = await listDocuments<AppwriteSeriesDoc>(COLLECTION_PERSONAL_SERIES, [
      Query.equal('user_id', [userId]),
      Query.orderDesc('$createdAt'),
    ]);
    return data.map(mapSeries) as SeriesEntry[];
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('user_id')) {
      throw new Error("A colecao 'series_pessoais' precisa da coluna 'user_id' para isolar as series por usuario.");
    }
    throw error;
  }
}

export async function addSeries(
  userId: string,
  series: Omit<SeriesEntry, 'id' | 'user_id' | 'created_at'>,
) {
  const existing = await firstDocument<AppwriteSeriesDoc>(COLLECTION_PERSONAL_SERIES, [
    Query.equal('user_id', [userId]),
    Query.equal('titulo', [series.titulo]),
  ]);
  if (existing) {
    throw new Error('Essa serie ja esta cadastrada.');
  }

  const episodiosVistos = Math.max(0, series.episodios_vistos);
  const totalEpisodios = Math.max(1, series.total_episodios);
  const data = await createDocument(COLLECTION_PERSONAL_SERIES, {
    user_id: userId,
    titulo: series.titulo,
    capaUrl: ensureValidUrl(series.capa_url),
    plataforma: series.plataforma_slug ?? 'stremio',
    episodiosVistos,
    totalEpisodios,
    status: toAppwriteSeriesStatus(series.status, episodiosVistos, totalEpisodios),
    rating: series.rating ?? null,
    streamingData: series.streaming_data ?? null,
  });

  await awardMCoins(userId, 'INICIOU_SERIE', `Iniciou a serie ${series.titulo}.`);
  return mapSeries(data as unknown as AppwriteSeriesDoc);
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
  const nextEpisodiosVistos = updates.episodios_vistos ?? current.episodiosVistos;
  const nextTotalEpisodios = updates.total_episodios ?? current.totalEpisodios;

  if (updates.episodios_vistos !== undefined) mappedUpdates.episodiosVistos = updates.episodios_vistos;
  if (updates.total_episodios !== undefined) mappedUpdates.totalEpisodios = updates.total_episodios;
  if (updates.plataforma_slug !== undefined) mappedUpdates.plataforma = updates.plataforma_slug;
  if (updates.status !== undefined) {
    mappedUpdates.status = toAppwriteSeriesStatus(updates.status, nextEpisodiosVistos, nextTotalEpisodios);
  } else if (
    updates.episodios_vistos !== undefined ||
    updates.total_episodios !== undefined
  ) {
    mappedUpdates.status = toAppwriteSeriesStatus(undefined, nextEpisodiosVistos, nextTotalEpisodios);
  }

  const data = (await updateDocument(COLLECTION_PERSONAL_SERIES, seriesId, mappedUpdates)) as unknown as AppwriteSeriesDoc;

  const crossedCompletion =
    (current.episodiosVistos ?? 0) < (current.totalEpisodios ?? 1) &&
    (data.episodiosVistos ?? 0) >= (data.totalEpisodios ?? 1);

  if (crossedCompletion) {
    const viewerId = (current as { user_id?: string }).user_id ?? '';
    if (viewerId) {
      await awardMCoins(
        viewerId,
        'BONUS_EPISODIOS_COMPLETOS',
        `bateu 100% dos episodios de ${data.titulo}.`,
      );
    }
  }

  if (fromAppwriteSeriesStatus(current.status) !== 'watched' && fromAppwriteSeriesStatus(data.status) === 'watched') {
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

export async function updateOscarMovieStreaming(movieId: string, streamingData: string) {
  await updateDocument(COLLECTION_OSCAR_MOVIES, movieId, {
    streamingData,
  });
}

export async function updatePersonalMovieStreaming(movieId: string, streamingData: string) {
  await updateDocument(COLLECTION_PERSONAL_MOVIES, movieId, {
    streamingData,
  });
}

export async function updateSeriesStreaming(seriesId: string, streamingData: string) {
  await updateDocument(COLLECTION_PERSONAL_SERIES, seriesId, {
    streamingData,
  });
}

export async function suggestMovieToUser(
  fromUserId: string,
  toUserId: string,
  movie: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'>,
  mediaType: 'movie' | 'tv' = 'movie',
) {
  if (mediaType === 'movie') {
    const existingByTitle = await firstDocument<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
      Query.equal('user_id', [toUserId]),
      Query.equal('titulo', [movie.titulo]),
    ]);
    if (existingByTitle) {
      throw new Error('Esse filme ja esta na lista do amigo.');
    }

    await createDocument(COLLECTION_PERSONAL_MOVIES, {
      ...movie,
      source_movie_id: movie.source_movie_id
        ? `tmdb:${movie.source_movie_id}|rec:${fromUserId}`
        : null,
      rating: movie.rating ?? null,
      streamingData: movie.streaming_data ?? null,
      user_id: toUserId,
    });
  } else {
    await createDocument(COLLECTION_PERSONAL_SERIES, {
      titulo: movie.titulo,
      capaUrl: ensureValidUrl(movie.capa_url),
      plataforma: 'stremio',
      totalEpisodios: 1,
      episodiosVistos: 0,
      status: 'naoIniciado',
      rating: movie.rating ?? null,
      streamingData: movie.streaming_data ?? null,
    });
  }

  const [fromName, toName, delta] = await Promise.all([
    getUsernameById(fromUserId),
    getUsernameById(toUserId),
    grantMCoins(fromUserId, 'INDICOU_FILME'),
  ]);
  const label = mediaType === 'movie' ? 'filme' : 'serie';
  await addActivity(
    fromUserId,
    `@${fromName} indicou ${label} ${movie.titulo} para @${toName}. (+${delta} MC)`,
    delta,
  );
}

export async function reactToMovie(
  actorUserId: string,
  targetUserId: string,
  movieTitle: string,
  reaction: string,
) {
  const [actorName, targetName] = await Promise.all([
    getUsernameById(actorUserId),
    getUsernameById(targetUserId),
  ]);
  await addActivity(actorUserId, `${actorName} reagiu com ${reaction} ao filme de ${targetName} (${movieTitle}).`, 0);
}

export async function rateMovie(
  _actorUserId: string,
  movieId: string,
  _movieTitle: string,
  stars: number,
) {
  try {
    await updateDocument(COLLECTION_PERSONAL_MOVIES, movieId, {
      avaliacao: stars,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!message.includes('Unknown attribute')) {
      throw error;
    }
  }

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











