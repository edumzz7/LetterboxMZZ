import type { Models } from 'appwrite';
import { account, databases, ID, Permission, Query, Role } from './appwrite';
import * as localData from './localData';
import { normalizeUsername } from './auth';
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
  UserFavorite,
  TrendingMovie,
  UserOscarPrediction,
  AnticipatedMovie,
} from '../types/app';

type AppwriteUserDoc = Models.Document & {
  username: string;
  password_hash?: string;
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
  review?: string | null;
  streamingData?: string | null;
};

type AppwriteSeriesDoc = Models.Document & {
  user_id?: string;
  titulo: string;
  capaUrl: string | null;
  plataforma: string | null;
  temporada?: number | null;
  Temporada?: number | null;
  totalEpisodios: number;
  episodiosVistos: number;
  status: AppwriteSeriesStatus;
  avaliacao?: number | null;
  rating?: number | null;
  review?: string | null;
  streamingData?: string | null;
};

type AppwriteMetadataDoc = Models.Document & {
  user_id: string;
  mcoins: number;
  avatar_id: string;
  display_name?: string;
  favorite_movie?: string;
  favorite_movie_2?: string;
  favorite_genre?: string;
  favorite_series?: string;
  watch_preference?: 'home' | 'cinema';
};

type AppwriteActivityDoc = Models.Document & {
  user_id: string;
  message: string;
  mcoins_delta: number;
};

type AppwriteUserOscarPredictionDoc = Models.Document & {
  user_id: string;
  category: string;
  tmdb_id: string;
  title: string;
  poster_path: string;
  created_at?: string;
};

const BOOTSTRAP_KEY = 'letterboxmzz_bootstrap_v1';
const QUERY_LIMIT = 5000;

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_APP_USERS = import.meta.env.VITE_APPWRITE_COLLECTION_APP_USERS ?? 'app_users';
const COLLECTION_OSCAR_MOVIES =
  import.meta.env.VITE_APPWRITE_COLLECTION_OSCAR_MOVIES ?? 'filmes_oscar';
const COLLECTION_USER_OSCAR_MOVIES =
  import.meta.env.VITE_APPWRITE_COLLECTION_USER_OSCAR_MOVIES ?? 'user_oscar_movies';
const COLLECTION_PERSONAL_MOVIES =
  import.meta.env.VITE_APPWRITE_COLLECTION_PERSONAL_MOVIES ?? 'personal_movies';
const COLLECTION_PERSONAL_SERIES =
  import.meta.env.VITE_APPWRITE_COLLECTION_PERSONAL_SERIES ?? 'series_pessoais';
export const COLLECTION_USUARIOS_METADATA = import.meta.env.VITE_APPWRITE_COLLECTION_USUARIOS_METADATA ?? 'usuarios_metadata';
const COLLECTION_ATIVIDADES = import.meta.env.VITE_APPWRITE_COLLECTION_ATIVIDADES ?? 'atividades';
const COLLECTION_USER_FAVORITES = import.meta.env.VITE_APPWRITE_COLLECTION_USER_FAVORITES ?? 'user_favorites';
const COLLECTION_USER_OSCAR_PREDICTIONS = import.meta.env.VITE_APPWRITE_COLLECTION_USER_OSCAR_PREDICTIONS ?? 'user_oscar_predictions';
const MANAGED_PASSWORD_PLACEHOLDER = 'managed-by-appwrite';
const MANAGED_PASSWORD_PREFIX = 'letterboxzzo::managed::';
/** Base URL used for sharing links. Override with VITE_PUBLIC_APP_URL env var. */
const BASE_URL = (import.meta.env.VITE_PUBLIC_APP_URL ?? 'https://cinerats.vercel.app').replace(
  /\/$/,
  '',
);
/** @deprecated Use BASE_URL */
const PUBLIC_APP_URL = BASE_URL;
const FALLBACK_POSTER_URL = 'https://placehold.co/600x900/png';
const AVATAR_IDS = ['avatar_clapper', 'avatar_popcorn', 'avatar_projector', 'avatar_girl', 'avatar_robot'];
const LOCAL_MODE_KEY = 'letterboxmzz_force_local_v1';
const LEGACY_IMPORT_PREFIX = 'letterboxmzz_legacy_imported_v1_';
const HAS_APPWRITE_ENV = Boolean(
  import.meta.env.VITE_APPWRITE_ENDPOINT &&
    import.meta.env.VITE_APPWRITE_PROJECT_ID &&
    import.meta.env.VITE_APPWRITE_DATABASE_ID,
);
let runtimeLocalMode = !HAS_APPWRITE_ENV;

if (typeof window !== 'undefined') {
  sessionStorage.removeItem(LOCAL_MODE_KEY);
}

const TRIGGER_POINTS = {
  ASSISTIU_FILME: 30,
  INICIOU_SERIE: 20,
  SERIE_100: 50,
  INDICOU_FILME: 5,
  FILME_INDICADO_ASSISTIDO: 40,
  SERIE_INDICADA_100: 60,
  BONUS_CURADOR: 30,
  AVALIOU_ITEM: 5,
  RESENHOU_ITEM: 5,
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
  if (status === 'watchlist' || episodiosVistos <= 0) {
    return 'naoIniciado';
  }
  if (status === 'watched' || (totalEpisodios > 0 && episodiosVistos >= totalEpisodios)) {
    return 'concluido';
  }
  return 'emProgresso';
}

function fromAppwriteSeriesStatus(status: AppwriteSeriesStatus | string | null | undefined): SeriesStatus {
  if (status === 'concluido') return 'watched';
  if (status === 'naoIniciado') return 'watchlist';
  return 'watching';
}

function readSeriesSeason(doc: Pick<AppwriteSeriesDoc, 'temporada' | 'Temporada'>) {
  return Math.max(1, doc.temporada ?? doc.Temporada ?? 1);
}

function wrapPermissionError(error: unknown, collectionId: string) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: number }).code : undefined;
  if (code === 401 || code === 403) {
    return new Error(`Sem permissao de escrita em '${collectionId}'. Revise as permissoes autenticadas/documento no Appwrite.`);
  }

  return error;
}

function isBackendUnavailable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    !HAS_APPWRITE_ENV ||
    message.includes('Failed to fetch') ||
    message.includes('Network request failed') ||
    message.includes('fetch') ||
    message.includes('ERR_NETWORK')
  );
}

function shouldUseLocalMode() {
  return runtimeLocalMode;
}

function activateLocalMode() {
  runtimeLocalMode = true;
}

async function withFallback<T>(remote: () => Promise<T>, local: () => Promise<T>) {
  if (shouldUseLocalMode()) {
    return local();
  }

  try {
    return await remote();
  } catch (error) {
    if (isBackendUnavailable(error)) {
      console.warn('Appwrite indisponivel. Ativando modo local.', error);
      activateLocalMode();
      return local();
    }
    throw error;
  }
}

export async function createDocument<T extends Record<string, unknown>>(
  collectionId: string,
  data: T,
  permissions?: string[],
) {
  return createDocumentInternal(collectionId, ID.unique(), data, permissions);
}

async function createDocumentInternal<T extends Record<string, unknown>>(
  collectionId: string,
  documentId: string,
  data: T,
  permissions?: string[],
) {
  const payload: Record<string, unknown> = { ...data };

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await databases.createDocument(DATABASE_ID, collectionId, documentId, payload, permissions);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const unknownAttribute = message.match(/Unknown attribute: "([^"]+)"/);
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
  permissions?: string[],
) {
  return createDocumentInternal(collectionId, documentId, data, permissions);
}

export async function updateDocument<T extends Record<string, unknown>>(collectionId: string, documentId: string, data: T) {
  return updateDocumentWithPermissions(collectionId, documentId, data);
}

async function updateDocumentWithPermissions<T extends Record<string, unknown>>(
  collectionId: string,
  documentId: string,
  data: T,
  permissions?: string[],
) {
  const payload: Record<string, unknown> = { ...data };

  if (Object.keys(payload).length === 0) {
    return;
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await databases.updateDocument(DATABASE_ID, collectionId, documentId, payload, permissions);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const unknownAttribute = message.match(/Unknown attribute: "([^"]+)"/);
      if (unknownAttribute) {
        delete payload[unknownAttribute[1]];
        if (Object.keys(payload).length === 0) {
          return;
        }
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

function mapUser(doc: AppwriteUserDoc): AppUser {
  return {
    id: doc.$id,
    username: doc.username,
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
    review: doc.review ?? null,
    streaming_data: doc.streamingData ?? null,
    created_at: doc.$createdAt,
  };
}

function mapSeries(doc: AppwriteSeriesDoc): SeriesEntry {
  const totalEpisodios = doc.totalEpisodios ?? 0;
  const episodiosVistos = doc.episodiosVistos ?? 0;
  const derivedStatus = getSeriesStatus(episodiosVistos, totalEpisodios);
  const storedStatus = fromAppwriteSeriesStatus(doc.status);
  return {
    id: doc.$id,
    user_id: doc.user_id ?? '',
    titulo: doc.titulo,
    capa_url: doc.capaUrl ?? null,
    status: episodiosVistos <= 0 ? 'watchlist' : storedStatus === 'watched' ? 'watched' : derivedStatus,
    temporada: readSeriesSeason(doc),
    total_episodios: totalEpisodios,
    episodios_vistos: episodiosVistos,
    plataforma_slug: doc.plataforma ?? null,
    avaliacao: doc.avaliacao ?? null,
    rating: doc.rating ?? null,
    review: doc.review ?? null,
    streaming_data: doc.streamingData ?? null,
    created_at: doc.$createdAt,
  };
}

export function isIncomingNotificationMessage(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes('para voce') || normalized.includes('ao seu filme') || normalized.includes('novo membro');
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

function mapOscarPrediction(doc: AppwriteUserOscarPredictionDoc): UserOscarPrediction {
  return {
    id: doc.$id,
    user_id: doc.user_id,
    category: doc.category,
    tmdb_id: doc.tmdb_id,
    title: doc.title,
    poster_path: doc.poster_path,
    created_at: doc.created_at || doc.$createdAt,
  };
}

export async function listDocuments<T extends Models.Document>(collectionId: string, queries: string[] = []) {
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
  if (metadataCache.has(userId)) {
    return metadataCache.get(userId)!;
  }
  const existingDocs = await listDocuments<AppwriteMetadataDoc>(COLLECTION_USUARIOS_METADATA, [
    Query.equal('user_id', [userId]),
    Query.orderDesc('$updatedAt'),
  ]);
  const permissions = await ownerScopedPermissions(userId);
  const expectedUpdatePermission = permissions.find((entry) => entry.startsWith('update('));
  const writable = existingDocs.find((doc) =>
    expectedUpdatePermission ? ((doc as Models.Document).$permissions ?? []).includes(expectedUpdatePermission) : false,
  );

  let doc: AppwriteMetadataDoc;
  if (writable) {
    doc = writable;
  } else if (existingDocs[0]) {
    doc = (await createDocument(COLLECTION_USUARIOS_METADATA, {
      user_id: userId,
      mcoins: existingDocs[0].mcoins ?? 0,
      avatar_id: existingDocs[0].avatar_id ?? fallbackAvatar(userId),
    }, permissions)) as unknown as AppwriteMetadataDoc;
  } else {
    doc = (await createDocument(COLLECTION_USUARIOS_METADATA, {
      user_id: userId,
      mcoins: 0,
      avatar_id: fallbackAvatar(userId),
    }, permissions)) as unknown as AppwriteMetadataDoc;
  }

  metadataCache.set(userId, doc);
  return doc;
}

async function getUsernameById(userId: string) {
  if (usernameCache.has(userId)) return usernameCache.get(userId)!;
  try {
    const doc = (await databases.getDocument(DATABASE_ID, COLLECTION_APP_USERS, userId)) as unknown as AppwriteUserDoc;
    usernameCache.set(userId, doc.username);
    return doc.username;
  } catch {
    return 'Usuario';
  }
}

async function addActivity(userId: string, message: string, mcoinsDelta: number) {
  const permissions = await ownerScopedPermissions(userId);
  await createDocument(COLLECTION_ATIVIDADES, {
    user_id: userId,
    message,
    mcoins_delta: mcoinsDelta,
  }, permissions);
}

export async function ownerScopedPermissions(ownerUserId: string, readAny = true) {
  const currentAccount = await getCurrentAccount();
  const currentAppUserId =
    currentAccount && typeof currentAccount.prefs?.appUserId === 'string'
      ? currentAccount.prefs.appUserId
      : null;
  const ownerPrincipalId = currentAppUserId === ownerUserId && currentAccount ? currentAccount.$id : ownerUserId;
  const readRole = readAny ? Role.users() : Role.user(ownerPrincipalId);
  return [
    Permission.read(readRole),
    Permission.update(Role.user(ownerPrincipalId)),
    Permission.delete(Role.user(ownerPrincipalId)),
  ];
}

function createSessionEmail(username: string) {
  return `${normalizeUsername(username)}@letterboxzzo.local`;
}

function createManagedPassword(password: string) {
  return `${MANAGED_PASSWORD_PREFIX}${password}::v1`;
}

let cachedAccount: AppwriteAccountDoc | undefined = undefined;
const usernameCache = new Map<string, string>();
const metadataCache = new Map<string, AppwriteMetadataDoc>();

export function clearAppDataCache() {
  cachedAccount = undefined;
  usernameCache.clear();
  metadataCache.clear();
}

async function ensureAppwriteSession(username: string, password: string) {
  const email = createSessionEmail(username);
  await account.createEmailPasswordSession(email, createManagedPassword(password));
  cachedAccount = (await account.get()) as unknown as AppwriteAccountDoc;
  return cachedAccount;
}

async function getCurrentAccount() {
  if (cachedAccount) return cachedAccount;
  try {
    cachedAccount = (await account.get()) as unknown as AppwriteAccountDoc;
    return cachedAccount;
  } catch {
    return undefined;
  }
}

// ==========================================
// User Favorites (Meus Amigos)
// ==========================================

export async function listFavorites(ownerUserId: string): Promise<UserFavorite[]> {
  return withFallback(
    async () => {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_USER_FAVORITES, [
        Query.equal('owner_user_id', ownerUserId),
        Query.limit(100),
      ]);
      return response.documents.map((doc) => ({
        id: doc.$id,
        owner_user_id: doc.owner_user_id,
        favorite_user_id: doc.favorite_user_id,
        created_at: doc.$createdAt,
      }));
    },
    () => localData.listFavorites(ownerUserId),
  );
}

export async function addFavorite(ownerUserId: string, favoriteUserId: string): Promise<UserFavorite> {
  return withFallback(
    async () => {
      // Evitar duplicações
      try {
        const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_USER_FAVORITES, [
          Query.equal('owner_user_id', ownerUserId),
          Query.equal('favorite_user_id', favoriteUserId),
          Query.limit(1),
        ]);
        if (existing.documents.length > 0) {
          const doc = existing.documents[0];
          return {
            id: doc.$id,
            owner_user_id: doc.owner_user_id as string,
            favorite_user_id: doc.favorite_user_id as string,
            created_at: doc.$createdAt,
          };
        }
      } catch (err) {
        console.warn('Erro ao verificar favoritos existentes:', err);
      }

      const permissions = await ownerScopedPermissions(ownerUserId, false);
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_USER_FAVORITES,
        ID.unique(),
        {
          owner_user_id: ownerUserId,
          favorite_user_id: favoriteUserId,
        },
        permissions
      );

      return {
        id: response.$id,
        owner_user_id: response.owner_user_id,
        favorite_user_id: response.favorite_user_id,
        created_at: response.$createdAt,
      };
    },
    () => localData.addFavorite(ownerUserId, favoriteUserId),
  );
}

export async function removeFavorite(documentId: string): Promise<void> {
  return withFallback(
    async () => {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_USER_FAVORITES, documentId);
    },
    () => localData.removeFavorite(documentId),
  );
}

async function checkAndApplySelfDeduction(userId: string, username: string) {
  const metadata = await ensureUserMetadata(userId);
  return checkAndApplySelfDeductionWithMeta(userId, username, metadata);
}

async function checkAndApplySelfDeductionWithMeta(userId: string, username: string, metadata: AppwriteMetadataDoc) {
  const usersToDeduct = [
    { username: 'marcelojanssen', amount: 200 },
    { username: 'luizascopel', amount: 190 },
    { username: 'igro', amount: 30 },
    { username: 'edumzz', amount: 50 },
  ];

  const matched = usersToDeduct.find((u) => normalizeUsername(u.username) === normalizeUsername(username));
  if (!matched) return;

  const dbAvatarId = metadata.avatar_id || '';
  let parsed: any = {};
  if (dbAvatarId.startsWith('{')) {
    try {
      parsed = JSON.parse(dbAvatarId);
    } catch {}
  }

  if (!parsed.deductions_applied_v1) {
    let currentMcoins = metadata.mcoins ?? 0;
    const newMcoins = Math.max(0, currentMcoins - matched.amount);
    parsed.deductions_applied_v1 = true;
    
    const payload = {
      ...parsed,
      avatarId: parsed.avatarId || (dbAvatarId.startsWith('{') ? undefined : dbAvatarId),
    };

    const updated = await updateDocument(COLLECTION_USUARIOS_METADATA, metadata.$id, {
      mcoins: newMcoins,
      avatar_id: JSON.stringify(payload)
    }) as unknown as AppwriteMetadataDoc;
    metadataCache.set(userId, updated);

    await addActivity(userId, `pontos reajustados para correcao (-${matched.amount} MC)`, -matched.amount);
  }
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
    try {
      profile = (await createDocument(COLLECTION_APP_USERS, {
        username: normalizedName,
        password_hash: MANAGED_PASSWORD_PLACEHOLDER,
      }, await ownerScopedPermissions(currentAccount.$id))) as unknown as AppwriteUserDoc;
    } catch {
      profile = null;
    }
  }

  if (!profile) {
    if (profileId && normalizedName) {
      return { id: profileId, username: normalizedName };
    }
    return null;
  }

  // Only update prefs if they differ (saves a network call)
  if (prefs.appUserId !== profile.$id || prefs.username !== profile.username) {
    try {
      await account.updatePrefs({
        ...(currentAccount.prefs ?? {}),
        appUserId: profile.$id,
        username: profile.username,
      });
    } catch {
      // Non-fatal; profile lookup can still fall back to username.
    }
  }

  // ensureUserMetadata + checkAndApplySelfDeduction both call ensureUserMetadata.
  // Do it once and pass the result to avoid duplicate Appwrite calls.
  const metadata = await ensureUserMetadata(profile.$id);
  
  try {
    await checkAndApplySelfDeductionWithMeta(profile.$id, profile.username, metadata);
  } catch (err) {
    console.error('Failed self deduction check:', err);
  }

  return { id: profile.$id, username: profile.username };
}

async function requireSessionUser(expectedUserId: string) {
  const currentAccount = await getCurrentAccount();
  if (!currentAccount || currentAccount.$id !== expectedUserId) {
    throw new Error('Sessao invalida para esta operacao.');
  }
  return { id: currentAccount.$id, username: currentAccount.name };
}

function hasUpdatePermission(doc: Models.Document, permissions: string[]) {
  const expected = permissions.find((entry) => entry.startsWith('update('));
  return expected ? (doc.$permissions ?? []).includes(expected) : false;
}

function movieIdentityKey(doc: Pick<AppwritePersonalMovieDoc, 'source_movie_id' | 'titulo' | 'source'>) {
  if (doc.source_movie_id) return `source:${doc.source_movie_id}`;
  return `title:${doc.source}:${titleKey(doc.titulo)}`;
}

function seriesIdentityKey(doc: Pick<AppwriteSeriesDoc, 'titulo'>) {
  return titleKey(doc.titulo);
}

async function repairPersonalMovieDoc(doc: AppwritePersonalMovieDoc) {
  const permissions = await ownerScopedPermissions(doc.user_id);
  if (hasUpdatePermission(doc, permissions)) return doc;

  try {
    const newDoc = (await createDocument(COLLECTION_PERSONAL_MOVIES, {
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
      review: doc.review ?? null,
      streamingData: doc.streamingData ?? null,
    }, permissions)) as unknown as AppwritePersonalMovieDoc;
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_PERSONAL_MOVIES, doc.$id);
    } catch {}
    return newDoc;
  } catch {
    return doc;
  }
}

async function repairSeriesDoc(doc: AppwriteSeriesDoc) {
  if (!doc.user_id) return doc;
  const permissions = await ownerScopedPermissions(doc.user_id);
  if (hasUpdatePermission(doc, permissions)) return doc;

  try {
    const newDoc = (await createDocument(COLLECTION_PERSONAL_SERIES, {
      user_id: doc.user_id,
      titulo: doc.titulo,
      capaUrl: doc.capaUrl ?? null,
      plataforma: doc.plataforma ?? null,
      temporada: readSeriesSeason(doc),
      Temporada: readSeriesSeason(doc),
      totalEpisodios: doc.totalEpisodios,
      episodiosVistos: doc.episodiosVistos,
      status: doc.status,
      avaliacao: doc.avaliacao ?? null,
      rating: doc.rating ?? null,
      review: doc.review ?? null,
      streamingData: doc.streamingData ?? null,
    }, permissions)) as unknown as AppwriteSeriesDoc;
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_PERSONAL_SERIES, doc.$id);
    } catch {}
    return newDoc;
  } catch {
    return doc;
  }
}

async function grantMCoins(userId: string, trigger: TriggerKey) {
  const delta = TRIGGER_POINTS[trigger];
  const metadata = await ensureUserMetadata(userId);
  
  const dbAvatarId = metadata.avatar_id || '';
  let parsed: any = {};
  if (dbAvatarId.startsWith('{')) {
    try {
      parsed = JSON.parse(dbAvatarId);
    } catch {}
  }
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  let newMcoins = metadata.mcoins ?? 0;
  
  const isResetActive = currentMonth >= '2026-07';
  
  if (isResetActive && parsed.last_reset_month !== currentMonth) {
    // If we've crossed into a new month since the last recorded month AND we are past the initial grace period, reset!
    newMcoins = 0;
    parsed.last_reset_month = currentMonth;
  } else if (!parsed.last_reset_month) {
    // If it's the first time running this, just record the current month without resetting
    parsed.last_reset_month = currentMonth;
  }
  
  newMcoins = Math.max(0, newMcoins + delta);
  
  const payload = {
    ...parsed,
    avatarId: parsed.avatarId || (dbAvatarId.startsWith('{') ? undefined : dbAvatarId),
  };
  
  const updated = await updateDocument(COLLECTION_USUARIOS_METADATA, metadata.$id, {
    mcoins: newMcoins,
    avatar_id: JSON.stringify(payload)
  }) as unknown as AppwriteMetadataDoc;
  metadataCache.set(userId, updated);
  
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

export async function runOneTimeDeductionsForUser(userId: string, username: string) {
  // Delegates to the shared implementation to avoid duplicate API calls
  try {
    await checkAndApplySelfDeduction(userId, username);
  } catch (err) {
    console.error(`Failed to deduct for ${username}:`, err);
  }
}

export async function bootstrapApp() {
  return withFallback(
    async () => {
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

      sessionStorage.setItem(BOOTSTRAP_KEY, '1');
    },
    () => localData.bootstrapApp(),
  );
}

export async function loginUser(username: string, password: string) {
  clearAppDataCache();
  return withFallback(
    async () => {
      const normalized = normalizeUsername(username);

      try {
        await ensureAppwriteSession(normalized, password);
        const profile = await getSessionProfile();
        if (!profile) {
          throw new Error('Perfil do usuario nao encontrado.');
        }
        return profile;
      } catch {
        throw new Error('Usuario ou senha invalidos.');
      }
    },
    () => localData.loginUser(username, password),
  );
}

export async function registerUser(username: string, password: string) {
  return withFallback(
    async () => {
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
        }, await ownerScopedPermissions(createdAccount.$id))) as unknown as AppwriteUserDoc;

        try {
          await account.updatePrefs({
            appUserId: data.$id,
            username: data.username,
          });
        } catch {
          // Non-fatal
        }

        await ensureUserMetadata(data.$id);
        
        // Add activity to global timeline
        await addActivity('global', `Novo membro! @${data.username} entrou no Cinerats.`, 0);

        return { id: data.$id, username: data.username as string };
      } catch (error) {
        if (isConflictError(error)) {
          throw new Error('Esse username ja esta em uso.');
        }
        throw error;
      }
    },
    () => localData.registerUser(username, password),
  );
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  return withFallback(
    async () => {
      // Validate current password by attempting a fresh session
      const currentAccount = await getCurrentAccount();
      if (!currentAccount) throw new Error('Nenhuma sessao ativa.');

      // Re-authenticate with current password to confirm identity
      const username = currentAccount.prefs?.username as string | undefined;
      if (!username) throw new Error('Nao foi possivel identificar o usuario.');

      try {
        // Update password on Appwrite account
        // This inherently validates the current password
        await account.updatePassword(
          createManagedPassword(newPassword),
          createManagedPassword(currentPassword),
        );
      } catch (error: any) {
        if (error.code === 401) {
          throw new Error('Senha atual incorreta.');
        }
        throw new Error('Falha ao atualizar a senha no servidor.');
      }
    },
    () => localData.changePassword(userId, currentPassword, newPassword),
  );
}

export async function adminResetPassword(
  targetUsername: string,
  newPassword: string,
) {
  return withFallback(
    async () => {
      // Appwrite client SDK cannot reset another user's password —
      // only server-side Admin API can. In Appwrite mode we throw a
      // descriptive error so the UI can surface a helpful message.
      throw new Error(
        `Para resetar a senha de "${targetUsername}" no Appwrite, acesse o console em cloud.appwrite.io → Auth → Users → ${targetUsername} → Update password.`,
      );
    },
    () => localData.adminResetPassword(targetUsername, newPassword),
  );
}

export async function listUsers() {
  return withFallback(
    async () => {
      const data = await listDocuments<AppwriteUserDoc>(COLLECTION_APP_USERS, [Query.orderAsc('username')]);
      return data.map(mapUser);
    },
    () => localData.listUsers(),
  );
}

export async function listRankedUsers() {
  return withFallback(
    async () => {
      const [users, metadata] = await Promise.all([
        listUsers(),
        listDocuments<AppwriteMetadataDoc>(COLLECTION_USUARIOS_METADATA),
      ]);

      const metadataByUser = new Map<string, AppwriteMetadataDoc>();
      for (const item of metadata) {
        const current = metadataByUser.get(item.user_id);
        if (!current || item.$updatedAt > current.$updatedAt) {
          metadataByUser.set(item.user_id, item);
        }
      }

      const currentMonth = new Date().toISOString().slice(0, 7);
      const ranked = users
        .map((user) => {
          const userMeta = metadataByUser.get(user.id);
          let dbAvatarId = userMeta?.avatar_id ?? fallbackAvatar(user.id);
          let dbDisplayName: string | undefined = undefined;
          let userMcoins = userMeta?.mcoins ?? 0;
          let deductionsApplied = false;

          const isResetActive = currentMonth >= '2026-07';

          if (dbAvatarId.startsWith('{')) {
            try {
              const parsed = JSON.parse(dbAvatarId);
              dbAvatarId = parsed.avatarId || fallbackAvatar(user.id);
              dbDisplayName = parsed.displayName || undefined;
              if (isResetActive && parsed.last_reset_month !== currentMonth) {
                userMcoins = 0;
              }
              if (parsed.deductions_applied_v1) {
                deductionsApplied = true;
              }
            } catch (e) {
              console.warn('Failed to parse avatar_id JSON:', e);
              if (isResetActive) userMcoins = 0;
            }
          } else {
            if (isResetActive) userMcoins = 0;
          }

          if (!deductionsApplied) {
            let deductAmount = 0;
            const normalizedUser = normalizeUsername(user.username);
            if (normalizedUser === 'marcelojanssen') deductAmount = 200;
            else if (normalizedUser === 'luizascopel') deductAmount = 190;
            else if (normalizedUser === 'igro') deductAmount = 30;
            else if (normalizedUser === 'edumzz') deductAmount = 50;

            userMcoins = Math.max(0, userMcoins - deductAmount);
          }

          return {
            ...user,
            user_id: user.id,
            mcoins: userMcoins,
            avatar_id: dbAvatarId,
            display_name: dbDisplayName || undefined,
            favorite_movie: userMeta?.favorite_movie ?? undefined,
            favorite_movie_2: userMeta?.favorite_movie_2 ?? undefined,
            favorite_genre: userMeta?.favorite_genre ?? undefined,
            favorite_series: userMeta?.favorite_series ?? undefined,
            watch_preference: userMeta?.watch_preference ?? undefined,
          };
        })
        .sort((a, b) => b.mcoins - a.mcoins || a.username.localeCompare(b.username));

      return ranked.map((user, index) => ({ ...user, rank: index + 1 })) as RankedUser[];
    },
    () => localData.listRankedUsers(),
  );
}

export async function listActivities(limit = 30) {
  return withFallback(
    async () => {
      const data = await listDocuments<AppwriteActivityDoc>(COLLECTION_ATIVIDADES, [
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
      ]);

      return data.map(mapActivity);
    },
    () => localData.listActivities(limit),
  );
}

export async function listNotifications(_userId: string, _limit = 20) {
  // Deprecated, use listUserActivity directly instead.
  return [];
}

export async function listUserActivity(userIds: string[], limit = 20) {
  return withFallback(
    async () => {
      const data = await listDocuments<AppwriteActivityDoc>(COLLECTION_ATIVIDADES, [
        Query.equal('user_id', userIds),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
      ]);

      return data.map(mapActivity);
    },
    () => localData.listUserActivity(userIds[0], limit),
  );
}

export async function getCurrentSessionUser() {
  return withFallback(
    async () => getSessionProfile(),
    () => localData.getCurrentSessionUser(),
  );
}

export async function importLegacyDataForUser(userId: string) {
  return withFallback(
    async () => {
      if (typeof window === 'undefined') return false;

      const importKey = `${LEGACY_IMPORT_PREFIX}${userId}`;
      if (localStorage.getItem(importKey) === '1') return false;

      const rawMovies = localStorage.getItem('cinehub_movies');
      const rawSeries = localStorage.getItem('cinehub_series');
      if (!rawMovies && !rawSeries) return false;

      await requireSessionUser(userId);

      const [personalDocs, seriesDocs, oscarMovies] = await Promise.all([
        listDocuments<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
          Query.equal('user_id', [userId]),
          Query.limit(1),
        ]),
        listDocuments<AppwriteSeriesDoc>(COLLECTION_PERSONAL_SERIES, [
          Query.equal('user_id', [userId]),
          Query.limit(1),
        ]),
        listDocuments<AppwriteOscarMovieDoc>(COLLECTION_OSCAR_MOVIES, [
          Query.orderDesc('ano'),
          Query.orderAsc('titulo'),
        ]),
      ]);

      const { personalMovies, oscarStatuses } = readLegacyMovieData();
      const legacySeries = readLegacySeriesData(false);
      let changed = false;
      const permissions = await ownerScopedPermissions(userId);

      if (personalDocs.length === 0 && personalMovies.length > 0) {
        await Promise.all(
          personalMovies.map((movie) =>
            createDocument(COLLECTION_PERSONAL_MOVIES, {
              ...movie,
              user_id: userId,
            }, permissions),
          ),
        );
        changed = true;
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
            }, permissions),
          ),
        );
        changed = true;
      }

      if (oscarStatuses.size > 0) {
        const updates = oscarMovies
          .map((movie) => {
            const status = oscarStatuses.get(titleKey(movie.titulo));
            if (!status) return null;
            return { movie, status };
          })
          .filter(Boolean) as { movie: AppwriteOscarMovieDoc; status: MovieStatus }[];

        if (updates.length > 0) {
          await Promise.all(
            updates.map(({ movie, status }) => upsertUserOscarMovie(userId, movie.$id, status)),
          );
          changed = true;
        }
      }

      if (changed) {
        await addActivity(userId, 'dados legados foram importados para este perfil.', 0);
      }

      localStorage.setItem(importKey, '1');
      return changed;
    },
    () => localData.importLegacyDataForUser(userId),
  );
}

export async function logoutUser() {
  clearAppDataCache();
  return withFallback(
    async () => {
      try {
        await account.deleteSession('current');
      } catch {
        // Ignore missing session and proceed with local cleanup.
      }
    },
    () => localData.logoutUser(),
  );
}

export async function updateUserAvatar(userId: string, avatarId: string) {
  return withFallback(
    async () => {
      await requireSessionUser(userId);
      const metadata = await ensureUserMetadata(userId);
      
      let parsed: any = {};
      const currentDbAvatar = metadata.avatar_id;
      if (currentDbAvatar && currentDbAvatar.startsWith('{')) {
        try {
          parsed = JSON.parse(currentDbAvatar);
        } catch {}
      }

      const newDbAvatarValue = JSON.stringify({
        ...parsed,
        avatarId,
      });

      if (metadata.avatar_id === newDbAvatarValue) {
        return;
      }

      const updated = await updateDocument(COLLECTION_USUARIOS_METADATA, metadata.$id, {
        avatar_id: newDbAvatarValue,
      }) as unknown as AppwriteMetadataDoc;
      metadataCache.set(userId, updated);
    },
    () => localData.updateUserAvatar(userId, avatarId),
  );
}

export async function updateUserProfile(
  userId: string,
  data: {
    display_name?: string;
    favorite_movie?: string;
    favorite_movie_2?: string;
    favorite_genre?: string;
    favorite_series?: string;
    watch_preference?: 'home' | 'cinema';
  }
) {
  return withFallback(
    async () => {
      await requireSessionUser(userId);
      const metadata = await ensureUserMetadata(userId);
      const updates: Record<string, unknown> = {};

      let parsed: any = {};
      const currentDbAvatar = metadata.avatar_id || '';
      if (currentDbAvatar.startsWith('{')) {
        try {
          parsed = JSON.parse(currentDbAvatar);
        } catch {}
      }

      if (data.display_name !== undefined) {
        // Save to Auth Account name as well
        try {
          await account.updateName(data.display_name);
        } catch (err) {
          console.warn('Erro ao atualizar nome na conta Appwrite:', err);
        }
        
        const newDbAvatarValue = JSON.stringify({
          ...parsed,
          avatarId: parsed.avatarId || (currentDbAvatar.startsWith('{') ? undefined : currentDbAvatar),
          displayName: data.display_name,
        });
        if (metadata.avatar_id !== newDbAvatarValue) {
          updates.avatar_id = newDbAvatarValue;
        }
      }

      if (data.favorite_movie !== undefined && data.favorite_movie !== metadata.favorite_movie) {
        updates.favorite_movie = data.favorite_movie;
      }
      if (data.favorite_movie_2 !== undefined && data.favorite_movie_2 !== metadata.favorite_movie_2) {
        updates.favorite_movie_2 = data.favorite_movie_2;
      }
      if (data.favorite_genre !== undefined && data.favorite_genre !== metadata.favorite_genre) {
        updates.favorite_genre = data.favorite_genre;
      }
      if (data.favorite_series !== undefined && data.favorite_series !== metadata.favorite_series) {
        updates.favorite_series = data.favorite_series;
      }
      if (data.watch_preference !== undefined && data.watch_preference !== metadata.watch_preference) {
        updates.watch_preference = data.watch_preference;
      }

      if (Object.keys(updates).length === 0) {
        return;
      }

      const updated = await updateDocument(COLLECTION_USUARIOS_METADATA, metadata.$id, updates) as unknown as AppwriteMetadataDoc;
      metadataCache.set(userId, updated);
    },
    () => localData.updateUserProfile(userId, data),
  );
}

export async function getOscarMoviesForUser(userId: string) {
  return withFallback(
    async () => {
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
    },
    () => localData.getOscarMoviesForUser(userId),
  );
}

export async function addOscarMovie(userId: string, movie: Omit<OscarMovie, 'id'>) {
  return withFallback(
    async () => {
      await requireSessionUser(userId);
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
    },
    () => localData.addOscarMovie(userId, movie),
  );
}

export async function setOscarMovieStatus(userId: string, movie: OscarMovie, status: MovieStatus) {
  return withFallback(
    async () => {
      await requireSessionUser(userId);
      const previous = await upsertUserOscarMovie(userId, movie.id, status);
      await upsertPersonalOscarMovie(userId, movie, status);

      if (status === 'watched' && previous?.status !== 'watched') {
        await awardMCoins(userId, 'ASSISTIU_FILME', `Assistiu ao filme ${movie.titulo}.`);
      }
    },
    () => localData.setOscarMovieStatus(userId, movie, status),
  );
}

export async function listPersonalMovies(userId: string) {
  return withFallback(
    async () => {
      const data = await listDocuments<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
        Query.equal('user_id', [userId]),
        Query.orderDesc('$createdAt'),
      ]);
      const deduped = new Map<string, AppwritePersonalMovieDoc>();
      for (const doc of data) {
        const key = movieIdentityKey(doc);
        const current = deduped.get(key);
        if (!current || doc.$updatedAt > current.$updatedAt) {
          deduped.set(key, doc);
        }
      }
      return Array.from(deduped.values()).map(mapPersonalMovie) as PersonalMovie[];
    },
    () => localData.listPersonalMovies(userId),
  );
}

export async function addPersonalMovie(
  userId: string,
  movie: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'>,
) {
  return withFallback(
    async () => {
      await requireSessionUser(userId);
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
      }, await ownerScopedPermissions(userId));

      const created = mapPersonalMovie(data as unknown as AppwritePersonalMovieDoc);

      if (created.status === 'watched') {
        const recommendation = parseRecommendedSource(created.source_movie_id);
        if (recommendation) {
          await awardMCoins(created.user_id, 'FILME_INDICADO_ASSISTIDO', `Assistiu ao filme indicado: ${created.titulo}.`);
          await awardMCoins(
            recommendation.recommenderId,
            'BONUS_CURADOR',
            `Seu filme indicado (${created.titulo}) foi assistido.`,
          );
        } else {
          await awardMCoins(created.user_id, 'ASSISTIU_FILME', `Assistiu ao filme ${created.titulo}.`);
        }
      }

      return created;
    },
    () => localData.addPersonalMovie(userId, movie),
  );
}

export async function updatePersonalMovie(
  movieId: string,
  updates: Partial<Pick<PersonalMovie, 'status' | 'plataforma_slug' | 'avaliacao'>>,
) {
  return withFallback(
    async () => {
      const currentDoc = (await databases.getDocument(
        DATABASE_ID,
        COLLECTION_PERSONAL_MOVIES,
        movieId,
      )) as unknown as AppwritePersonalMovieDoc;
      await requireSessionUser(currentDoc.user_id);
      const writableDoc = await repairPersonalMovieDoc(currentDoc);

      const data = await updateDocument(
        COLLECTION_PERSONAL_MOVIES,
        writableDoc.$id,
        updates as Record<string, string | number | null>,
      );

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
    },
    () => localData.updatePersonalMovie(movieId, updates),
  );
}

export async function deletePersonalMovie(movieId: string) {
  return withFallback(
    async () => {
      const current = (await databases.getDocument(
        DATABASE_ID,
        COLLECTION_PERSONAL_MOVIES,
        movieId,
      )) as unknown as AppwritePersonalMovieDoc;
      await requireSessionUser(current.user_id);
      const writableDoc = await repairPersonalMovieDoc(current);
      await deleteDocument(COLLECTION_PERSONAL_MOVIES, writableDoc.$id);
    },
    () => localData.deletePersonalMovie(movieId),
  );
}

export async function listSeries(userId: string) {
  return withFallback(
    async () => {
      try {
        const data = await listDocuments<AppwriteSeriesDoc>(COLLECTION_PERSONAL_SERIES, [
          Query.equal('user_id', [userId]),
          Query.orderDesc('$createdAt'),
        ]);
        const deduped = new Map<string, AppwriteSeriesDoc>();
        for (const doc of data) {
          const key = seriesIdentityKey(doc);
          const current = deduped.get(key);
          if (!current || doc.$updatedAt > current.$updatedAt) {
            deduped.set(key, doc);
          }
        }
        return Array.from(deduped.values()).map(mapSeries) as SeriesEntry[];
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('user_id')) {
          throw new Error("A colecao 'series_pessoais' precisa da coluna 'user_id' para isolar as series por usuario.");
        }
        throw error;
      }
    },
    () => localData.listSeries(userId),
  );
}

export async function addSeries(
  userId: string,
  series: Omit<SeriesEntry, 'id' | 'user_id' | 'created_at'>,
) {
  return withFallback(
    async () => {
      await requireSessionUser(userId);
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
        temporada: Math.max(1, series.temporada || 1),
        Temporada: Math.max(1, series.temporada || 1),
        episodiosVistos,
        totalEpisodios,
        status: toAppwriteSeriesStatus(series.status, episodiosVistos, totalEpisodios),
        avaliacao: series.avaliacao ?? 0,
        rating: series.rating ?? null,
        streamingData: series.streaming_data ?? null,
      }, await ownerScopedPermissions(userId));

      if (fromAppwriteSeriesStatus((data as unknown as AppwriteSeriesDoc).status) !== 'watchlist') {
        await awardMCoins(userId, 'INICIOU_SERIE', `Iniciou a serie ${series.titulo}.`);
      }
      return mapSeries(data as unknown as AppwriteSeriesDoc);
    },
    () => localData.addSeries(userId, series),
  );
}

export async function updateSeries(
  seriesId: string,
  updates: Partial<
    Pick<
      SeriesEntry,
      'status' | 'temporada' | 'total_episodios' | 'episodios_vistos' | 'plataforma_slug' | 'avaliacao'
    >
  >,
) {
  return withFallback(
    async () => {
      const current = (await databases.getDocument(DATABASE_ID, COLLECTION_PERSONAL_SERIES, seriesId)) as unknown as AppwriteSeriesDoc;
      if (!current.user_id) {
        throw new Error("Serie sem user_id. Corrija o registro antigo antes de editar.");
      }
      await requireSessionUser(current.user_id);
      const writableDoc = await repairSeriesDoc(current);

      const mappedUpdates: Record<string, number | string | null> = {};
      const nextEpisodiosVistos = updates.episodios_vistos ?? current.episodiosVistos;
      const nextTotalEpisodios = updates.total_episodios ?? current.totalEpisodios;

      if (updates.temporada !== undefined) {
        mappedUpdates.temporada = updates.temporada;
        mappedUpdates.Temporada = updates.temporada;
      }
      if (updates.episodios_vistos !== undefined) mappedUpdates.episodiosVistos = updates.episodios_vistos;
      if (updates.total_episodios !== undefined) mappedUpdates.totalEpisodios = updates.total_episodios;
      if (updates.plataforma_slug !== undefined) mappedUpdates.plataforma = updates.plataforma_slug;
      if (updates.avaliacao !== undefined) mappedUpdates.avaliacao = updates.avaliacao;
      if (updates.status !== undefined) {
        mappedUpdates.status = toAppwriteSeriesStatus(updates.status, nextEpisodiosVistos, nextTotalEpisodios);
      } else if (
        updates.episodios_vistos !== undefined ||
        updates.total_episodios !== undefined
      ) {
        mappedUpdates.status = toAppwriteSeriesStatus(undefined, nextEpisodiosVistos, nextTotalEpisodios);
      }

      const data = (await updateDocument(
        COLLECTION_PERSONAL_SERIES,
        writableDoc.$id,
        mappedUpdates,
      )) as unknown as AppwriteSeriesDoc;

      if (
        updates.temporada !== undefined &&
        readSeriesSeason(data) !== Math.max(1, updates.temporada)
      ) {
        throw new Error("A coluna 'temporada' precisa existir em 'series_pessoais' para salvar a temporada atual.");
      }

      const previousSeriesStatus = fromAppwriteSeriesStatus(current.status);
      const nextSeriesStatus = fromAppwriteSeriesStatus(data.status);

      if (previousSeriesStatus === 'watchlist' && nextSeriesStatus === 'watching') {
        const viewerId = (current as { user_id?: string }).user_id ?? '';
        if (viewerId) {
          await awardMCoins(viewerId, 'INICIOU_SERIE', `Iniciou a serie ${data.titulo}.`);
        }
      }

      if (previousSeriesStatus !== 'watched' && nextSeriesStatus === 'watched') {
        const viewerId = (current as { user_id?: string }).user_id ?? '';
        if (viewerId) {
          await awardMCoins(viewerId, 'SERIE_100', `Finalizou 100% da serie ${data.titulo}.`);
        }
      }

      return mapSeries(data);
    },
    () => localData.updateSeries(seriesId, updates),
  );
}


export async function updateOscarMoviePlatform(movieId: string, platformSlug: string) {
  return withFallback(
    async () => {
      const session = await getSessionProfile();
      if (!session) throw new Error('Sessao invalida.');
      await updateDocument(COLLECTION_OSCAR_MOVIES, movieId, {
        plataforma: platformSlug,
      });
    },
    () => localData.updateOscarMoviePlatform(movieId, platformSlug),
  );
}

export async function updateOscarMovieStreaming(movieId: string, streamingData: string) {
  return withFallback(
    async () => {
      const session = await getSessionProfile();
      if (!session) throw new Error('Sessao invalida.');
      await updateDocument(COLLECTION_OSCAR_MOVIES, movieId, {
        streamingData,
      });
    },
    () => localData.updateOscarMovieStreaming(movieId, streamingData),
  );
}

export async function updatePersonalMovieStreaming(movieId: string, streamingData: string) {
  return withFallback(
    async () => {
      const current = (await databases.getDocument(
        DATABASE_ID,
        COLLECTION_PERSONAL_MOVIES,
        movieId,
      )) as unknown as AppwritePersonalMovieDoc;
      await requireSessionUser(current.user_id);
      const writableDoc = await repairPersonalMovieDoc(current);
      await updateDocument(COLLECTION_PERSONAL_MOVIES, writableDoc.$id, {
        streamingData,
      });
    },
    () => localData.updatePersonalMovieStreaming(movieId, streamingData),
  );
}

export async function updateSeriesStreaming(seriesId: string, streamingData: string) {
  return withFallback(
    async () => {
      const current = (await databases.getDocument(
        DATABASE_ID,
        COLLECTION_PERSONAL_SERIES,
        seriesId,
      )) as unknown as AppwriteSeriesDoc;
      if (!current.user_id) {
        throw new Error("Serie sem user_id. Corrija o registro antigo antes de editar.");
      }
      await requireSessionUser(current.user_id);
      const writableDoc = await repairSeriesDoc(current);
      await updateDocument(COLLECTION_PERSONAL_SERIES, writableDoc.$id, {
        streamingData,
      });
    },
    () => localData.updateSeriesStreaming(seriesId, streamingData),
  );
}

export async function suggestMovieToUser(
  fromUserId: string,
  toUserId: string,
  movie: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'>,
  mediaType: 'movie' | 'tv' = 'movie',
) {
  return withFallback(
    async () => {
      await requireSessionUser(fromUserId);
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
        }, await ownerScopedPermissions(fromUserId));
      } else {
        await createDocument(COLLECTION_PERSONAL_SERIES, {
          user_id: toUserId,
          titulo: movie.titulo,
          capaUrl: ensureValidUrl(movie.capa_url),
          plataforma: 'stremio',
          temporada: 1,
          Temporada: 1,
          totalEpisodios: 1,
          episodiosVistos: 0,
          status: 'naoIniciado',
          rating: movie.rating ?? null,
          streamingData: movie.streaming_data ?? null,
        }, await ownerScopedPermissions(fromUserId));
      }

      const [fromName, toName, delta] = await Promise.all([
        getUsernameById(fromUserId),
        getUsernameById(toUserId),
        grantMCoins(fromUserId, 'INDICOU_FILME'),
      ]);
      const label = mediaType === 'movie' ? 'filme' : 'serie';
      await Promise.all([
        addActivity(
          toUserId,
          `@${fromName} indicou ${label} ${movie.titulo} para voce.`,
          0,
        ),
        addActivity(
          fromUserId,
          `${fromName} indicou ${label} ${movie.titulo} para @${toName}. (+${delta} MC)`,
          delta,
        ),
      ]);
    },
    () => localData.suggestMovieToUser(fromUserId, toUserId, movie, mediaType),
  );
}

export async function reactToMovie(
  actorUserId: string,
  targetUserId: string,
  movieTitle: string,
  reaction: string,
) {
  return withFallback(
    async () => {
      await requireSessionUser(actorUserId);
      const actorName = await getUsernameById(actorUserId);
      await addActivity(targetUserId, `${actorName} reagiu com ${reaction} ao seu filme ${movieTitle}.`, 0);
    },
    () => localData.reactToMovie(actorUserId, targetUserId, movieTitle, reaction),
  );
}

export async function rateMovie(
  actorUserId: string,
  movieId: string,
  _movieTitle: string,
  stars: number,
  review?: string | null,
) {
  return withFallback(
    async () => {
      const current = (await databases.getDocument(
        DATABASE_ID,
        COLLECTION_PERSONAL_MOVIES,
        movieId,
      )) as unknown as AppwritePersonalMovieDoc;
      await requireSessionUser(actorUserId);
      if (current.user_id !== actorUserId) {
        throw new Error('Avaliacao permitida apenas para o dono do filme.');
      }
      const isWatched = current.status === 'watched';
      const prevRating = current.rating ?? current.avaliacao ?? null;
      const prevReview = current.review ?? null;

      const writableDoc = await repairPersonalMovieDoc(current);
      try {
        const updated = (await updateDocument(COLLECTION_PERSONAL_MOVIES, writableDoc.$id, {
          rating: stars,
          review: review !== undefined ? review : undefined,
        })) as unknown as AppwritePersonalMovieDoc;
        if ((updated.rating ?? updated.avaliacao ?? null) !== stars) {
          throw new Error("A coluna 'rating' (Double) precisa ser criada em 'personal_movies' para salvar avaliações com decimais.");
        }

        if (isWatched) {
          if (stars > 0 && (prevRating === null || prevRating === 0)) {
            await awardMCoins(actorUserId, 'AVALIOU_ITEM', `avaliou o filme ${current.titulo}.`);
          }
          if (review && review.trim() !== '' && (prevReview === null || prevReview.trim() === '')) {
            await awardMCoins(actorUserId, 'RESENHOU_ITEM', `escreveu uma resenha para o filme ${current.titulo}.`);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('Unknown attribute') || message.includes('document data and permissions are missing')) {
          throw new Error("A coluna 'rating' (Double) precisa ser criada no Appwrite em 'personal_movies' para salvar a nota.");
        }
        throw error;
      }
    },
    () => localData.rateMovie(actorUserId, movieId, _movieTitle, stars, review),
  );
}

export async function rateSeries(
  actorUserId: string,
  seriesId: string,
  stars: number,
  review?: string | null,
) {
  return withFallback(
    async () => {
      const current = (await databases.getDocument(
        DATABASE_ID,
        COLLECTION_PERSONAL_SERIES,
        seriesId,
      )) as unknown as AppwriteSeriesDoc;
      if (!current.user_id) {
        throw new Error("Serie sem user_id. Corrija o registro antigo antes de avaliar.");
      }
      await requireSessionUser(actorUserId);
      if (current.user_id !== actorUserId) {
        throw new Error('Avaliacao permitida apenas para o dono da serie.');
      }
      const isWatched = current.status === 'concluido';
      const prevRating = current.rating ?? current.avaliacao ?? null;
      const prevReview = current.review ?? null;

      const writableDoc = await repairSeriesDoc(current);
      try {
        const updated = (await updateDocument(COLLECTION_PERSONAL_SERIES, writableDoc.$id, {
          rating: stars,
          review: review !== undefined ? review : undefined,
        })) as unknown as AppwriteSeriesDoc;
        if ((updated.rating ?? updated.avaliacao ?? null) !== stars) {
          throw new Error("A coluna 'rating' (Double) precisa ser criada em 'personal_series' para salvar avaliações com decimais.");
        }

        if (isWatched) {
          if (stars > 0 && (prevRating === null || prevRating === 0)) {
            await awardMCoins(actorUserId, 'AVALIOU_ITEM', `avaliou a serie ${current.titulo}.`);
          }
          if (review && review.trim() !== '' && (prevReview === null || prevReview.trim() === '')) {
            await awardMCoins(actorUserId, 'RESENHOU_ITEM', `escreveu uma resenha para a serie ${current.titulo}.`);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('Unknown attribute') || message.includes('document data and permissions are missing')) {
          throw new Error("A coluna 'rating' (Double) precisa ser criada no Appwrite em 'personal_series' para salvar a nota.");
        }
        throw error;
      }
    },
    () => localData.rateSeries(actorUserId, seriesId, stars, review),
  );
}

export async function deleteSeries(seriesId: string) {
  return withFallback(
    async () => {
      const current = (await databases.getDocument(
        DATABASE_ID,
        COLLECTION_PERSONAL_SERIES,
        seriesId,
      )) as unknown as AppwriteSeriesDoc;
      if (!current.user_id) {
        throw new Error("Serie sem user_id. Corrija o registro antigo antes de excluir.");
      }
      await requireSessionUser(current.user_id);
      const writableDoc = await repairSeriesDoc(current);
      await deleteDocument(COLLECTION_PERSONAL_SERIES, writableDoc.$id);
    },
    () => localData.deleteSeries(seriesId),
  );
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

export async function getCineMatchSuggestion(
  currentUserId: string,
  friendUserId: string,
  mode: CineMatchMode,
): Promise<CineMatchSuggestion | null> {
  return withFallback(
    async () => {
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
    },
    () => localData.getCineMatchSuggestion(currentUserId, friendUserId, mode),
  );
}

export function getSeriesStatus(episodiosVistos: number, totalEpisodios: number): SeriesStatus {
  if (episodiosVistos <= 0) return 'watchlist';
  return totalEpisodios > 0 && episodiosVistos >= totalEpisodios ? 'watched' : 'watching';
}

export async function getTrendingMovies(): Promise<TrendingMovie[]> {
  return withFallback(
    async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const docs = await listDocuments<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
        Query.equal('status', 'watched'),
        Query.greaterThanEqual('$createdAt', thirtyDaysAgo.toISOString()),
      ]);

      const watcherSets = new Map<string, { title: string; coverUrl: string | null; tmdbId?: string | null; watchers: Set<string>; lastWatchedAt: string }>();

      for (const doc of docs) {
        const key = doc.source_movie_id || doc.titulo.toLowerCase().trim();
        let group = watcherSets.get(key);
        if (!group) {
          group = {
            title: doc.titulo,
            coverUrl: doc.capa_url ?? null,
            tmdbId: doc.source_movie_id,
            watchers: new Set<string>(),
            lastWatchedAt: doc.$createdAt,
          };
          watcherSets.set(key, group);
        }
        group.watchers.add(doc.user_id);
        if (doc.$createdAt > group.lastWatchedAt) {
          group.lastWatchedAt = doc.$createdAt;
        }
      }

      const grouped = Array.from(watcherSets.values()).map((g) => ({
        title: g.title,
        coverUrl: g.coverUrl,
        tmdbId: g.tmdbId,
        userCount: g.watchers.size,
        userIds: Array.from(g.watchers),
        lastWatchedAt: g.lastWatchedAt,
      }));

      grouped.sort((a, b) => {
        if (b.userCount !== a.userCount) {
          return b.userCount - a.userCount;
        }
        return new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime();
      });

      return grouped.slice(0, 5);
    },
    () => localData.getTrendingMovies(),
  );
}

export async function getOscarPredictionsForUser(userId: string): Promise<UserOscarPrediction[]> {
  return withFallback(
    async () => {
      const docs = await listDocuments<AppwriteUserOscarPredictionDoc>(COLLECTION_USER_OSCAR_PREDICTIONS, [
        Query.equal('user_id', [userId]),
      ]);
      return docs.map(mapOscarPrediction);
    },
    () => localData.getOscarPredictionsForUser(userId),
  );
}

export async function saveOscarPrediction(
  userId: string,
  category: string,
  tmdbId: string,
  title: string,
  posterPath: string
): Promise<UserOscarPrediction> {
  return withFallback(
    async () => {
      await requireSessionUser(userId);

      // 1. Delete previous prediction if it exists
      const existingDocs = await listDocuments<AppwriteUserOscarPredictionDoc>(COLLECTION_USER_OSCAR_PREDICTIONS, [
        Query.equal('user_id', [userId]),
        Query.equal('category', [category]),
      ]);

      for (const doc of existingDocs) {
        try {
          await deleteDocument(COLLECTION_USER_OSCAR_PREDICTIONS, doc.$id);
        } catch (err) {
          console.error(`Failed to delete old prediction ${doc.$id}:`, err);
        }
      }

      // 2. Resolve account scoped permissions for Row Security
      let permissions: string[] = [];
      try {
        permissions = await ownerScopedPermissions(userId, false);
      } catch {
        permissions = [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ];
      }

      // 3. Save new prediction
      const doc = await createDocument(
        COLLECTION_USER_OSCAR_PREDICTIONS,
        {
          user_id: userId,
          category,
          tmdb_id: tmdbId,
          title,
          poster_path: posterPath,
          created_at: new Date().toISOString(),
        },
        permissions
      );

      return mapOscarPrediction(doc as unknown as AppwriteUserOscarPredictionDoc);
    },
    () => localData.saveOscarPrediction(userId, category, tmdbId, title, posterPath),
  );
}

export async function getAnticipatedMovies(): Promise<AnticipatedMovie[]> {
  return withFallback(
    async () => {
      const docs = await listDocuments<AppwritePersonalMovieDoc>(COLLECTION_PERSONAL_MOVIES, [
        Query.equal('status', 'watchlist'),
      ]);

      const watcherSets = new Map<string, { title: string; coverUrl: string | null; tmdbId?: string | null; watchers: Set<string> }>();

      for (const doc of docs) {
        const key = doc.source_movie_id || doc.titulo.toLowerCase().trim();
        let group = watcherSets.get(key);
        if (!group) {
          group = {
            title: doc.titulo,
            coverUrl: doc.capa_url ?? null,
            tmdbId: doc.source_movie_id,
            watchers: new Set<string>(),
          };
          watcherSets.set(key, group);
        }
        group.watchers.add(doc.user_id);
      }

      const grouped = Array.from(watcherSets.values()).map((g) => ({
        title: g.title,
        coverUrl: g.coverUrl,
        tmdbId: g.tmdbId,
        userCount: g.watchers.size,
        userIds: Array.from(g.watchers),
      }));

      grouped.sort((a, b) => b.userCount - a.userCount);

      return grouped.slice(0, 5);
    },
    () => localData.getAnticipatedMovies(),
  );
}

export async function countFavoritedBy(userId: string): Promise<number> {
  return withFallback(
    async () => {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_USER_FAVORITES, [
        Query.equal('favorite_user_id', userId),
        Query.limit(1),
      ]);
      return response.total;
    },
    () => localData.countFavoritedBy(userId),
  );
}

export async function resetUserMcoinsForMonth(userId: string, currentMonth: string): Promise<void> {
  return withFallback(
    async () => {
      const metadata = await ensureUserMetadata(userId);
      const dbAvatarId = metadata.avatar_id || '';
      let parsed: any = {};
      if (dbAvatarId.startsWith('{')) {
        try {
          parsed = JSON.parse(dbAvatarId);
        } catch {}
      }
      parsed.last_reset_month = currentMonth;
      const updated = await updateDocument(COLLECTION_USUARIOS_METADATA, metadata.$id, {
        mcoins: 0,
        avatar_id: JSON.stringify(parsed),
      }) as unknown as AppwriteMetadataDoc;
      metadataCache.set(userId, updated);
    },
    () => localData.resetUserMcoinsForMonth(userId, currentMonth),
  );
}

export async function checkAndRunMonthlyReset(): Promise<void> {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  
  // Start from July 2026
  if (currentMonth < '2026-07') return;

  const activities = await listActivities(50);
  const resetPrefix = `[Reset Mensal - ${currentMonth}]`;
  const alreadyReset = activities.some((act) => act.message.includes(resetPrefix));
  if (alreadyReset) return;

  const users = await listRankedUsers();
  if (users.length === 0) return;

  // Filter out any system/test accounts if they exist
  const validUsers = users.filter((u) => u.username.toLowerCase() !== 'testoscar');
  if (validUsers.length === 0) return;

  // Find the winner (highest mcoins)
  let winner = validUsers[0];
  for (const u of validUsers) {
    if (u.mcoins > winner.mcoins) {
      winner = u;
    }
  }

  // Format winner announcement
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const prevMonthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const message = `${resetPrefix} O usuário @${winner.username} venceu o mês de ${prevMonthName} com ${winner.mcoins} MC! Parabéns! As pontuações foram zeradas para o início de um novo mês.`;

  // Reset mcoins of all users to 0
  for (const user of users) {
    await resetUserMcoinsForMonth(user.id, currentMonth);
  }

  // Post the announcement activity for all users
  await addActivity(winner.id, message, 0);
}











