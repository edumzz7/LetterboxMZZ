import * as localData from './localData';
import apiClient from './apiClient';
import { getTvDetailsWithCache } from './tmdbCache';
import type {
  ActivityEntry,
  CineMatchMode,
  CineMatchSuggestion,
  MovieStatus,
  PersonalMovie,
  RankedUser,
  SeriesEntry,
  SeriesStatus,
  UserFavorite,
  TrendingMovie,
  UserOscarPrediction,
  AnticipatedMovie,
} from '../types/app';

const AVATAR_IDS = ['avatar_clapper', 'avatar_popcorn', 'avatar_projector', 'avatar_girl', 'avatar_robot'];

// Backend availability tracking
function isBackendUnavailable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    message.includes('Failed to fetch') ||
    message.includes('Network request failed') ||
    message.includes('fetch') ||
    message.includes('ERR_NETWORK')
  );
}

async function withFallback<T>(remote: () => Promise<T>, local: () => Promise<T>) {
  try {
    return await remote();
  } catch (error) {
    if (isBackendUnavailable(error)) {
      console.warn('API indisponível. Usando modo local para esta requisição.', error);
      return local();
    }
    throw error;
  }
}

export function isIncomingNotificationMessage(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes('para voce') || normalized.includes('ao seu filme') || normalized.includes('novo membro');
}

function fallbackAvatar(userId: string) {
  const index = Math.abs(Array.from(userId).reduce((sum, char) => sum + char.charCodeAt(0), 0)) % AVATAR_IDS.length;
  return AVATAR_IDS[index];
}

let cachedSessionUser: { id: string; username: string } | null = null;

function clearAppDataCache() {
  cachedSessionUser = null;
}

// ==========================================
// User Favorites (Meus Amigos)
// ==========================================

export async function listFavorites(ownerUserId: string): Promise<UserFavorite[]> {
  return withFallback(
    async () => {
      const response = await apiClient.get<UserFavorite[]>('/users/me/favorites');
      return response.data;
    },
    () => localData.listFavorites(ownerUserId),
  );
}

export async function listUserAchievementIds(userId: string): Promise<string[]> {
  return withFallback(
    async () => {
      const response = await apiClient.get<{ key?: string; id?: string }[]>(`/users/${userId}/achievements`);
      return response.data
        .map((achievement) => achievement.key ?? achievement.id)
        .filter((key): key is string => Boolean(key));
    },
    async () => {
      const [favorites, favoritedByCount] = await Promise.all([
        localData.listFavorites(userId),
        localData.countFavoritedBy(userId),
      ]);

      return [
        ...(favorites.length >= 10 ? ['vereador'] : []),
        ...(favoritedByCount >= 10 ? ['eleito'] : []),
      ];
    },
  );
}

export async function addFavorite(favoriteUserId: string, ownerUserId: string): Promise<UserFavorite> {
  return withFallback(
    async () => {
      const response = await apiClient.post<UserFavorite>('/users/me/favorites', { favoriteUserId });
      return response.data;
    },
    () => localData.addFavorite(favoriteUserId, ownerUserId),
  );
}

export async function removeFavorite(favoriteId: string): Promise<void> {
  return withFallback(
    async () => {
      await apiClient.delete(`/users/me/favorites/${favoriteId}`);
    },
    () => localData.removeFavorite(favoriteId),
  );
}

// ==========================================
// REMOVED: Appwrite-specific functions that are no longer used
// These have been replaced by the new API endpoints
// ==========================================
// - checkAndApplySelfDeduction
// - checkAndApplySelfDeductionWithMeta
// - getSessionProfile
// - requireSessionUser
// - hasUpdatePermission
// - movieIdentityKey
// - seriesIdentityKey
// - repairPersonalMovieDoc
// - repairSeriesDoc
// - grantMCoins
// - awardMCoins
// - upsertUserOscarMovie
// - upsertPersonalOscarMovie
// ==========================================

export async function loginUser(identifier: string, password: string) {
  clearAppDataCache();
  return withFallback(
    async () => {
      await apiClient.post('/auth/sign-in', { login: identifier, password });
      const { data } = await apiClient.get<{ id: string; username: string }>('/auth/me');
      cachedSessionUser = { id: data.id, username: data.username };
      return cachedSessionUser;
    },
    () => localData.loginUser(identifier, password),
  );
}

export async function registerUser(username: string, email: string, password: string) {
  return withFallback(
    async () => {
      await apiClient.post('/auth/sign-up', {
        username,
        email,
        password,
        confirmPassword: password,
      });
      const { data } = await apiClient.get<{ id: string; username: string }>('/auth/me');
      cachedSessionUser = { id: data.id, username: data.username };
      return cachedSessionUser;
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
      await apiClient.patch('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword: newPassword,
      });
    },
    () => localData.changePassword(userId, currentPassword, newPassword),
  );
}

export async function requestPasswordReset(email: string) {
  return withFallback(
    async () => {
      await apiClient.post('/auth/password-reset', { email });
    },
    async () => {
      // Local mode fallback - just log the request
      console.log('Password reset requested for:', email);
    },
  );
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  password: string,
  confirmPassword: string,
) {
  clearAppDataCache();
  return withFallback(
    async () => {
      await apiClient.patch('/auth/password-reset', {
        email,
        code,
        password,
        confirmPassword,
      });
      const { data } = await apiClient.get<{ id: string; username: string }>('/auth/me');
      cachedSessionUser = { id: data.id, username: data.username };
      return cachedSessionUser;
    },
    async () => {
      throw new Error('Reset de senha não disponível no modo local.');
    },
  );
}

export async function adminResetPassword(
  targetUsername: string,
  newPassword: string,
) {
  return withFallback(
    async () => {
      // Client SDK cannot reset another user's password —
      // only server-side Admin API can. Throw a descriptive error.
      throw new Error(
        `Para resetar a senha de "${targetUsername}", use o painel de administração da API ou contate um administrador.`,
      );
    },
    () => localData.adminResetPassword(targetUsername, newPassword),
  );
}

export async function listUsers() {
  // REMOVED: Old Appwrite implementation
  // Now using listRankedUsers() which calls the new API
  return listRankedUsers();
}

export async function listRankedUsers() {
  return withFallback(
    async () => {
      const apiResponse = await apiClient.get<{
        id: string;
        username: string;
        totalPoints: number;
        rank: number;
        createdAt: string;
        preferences: {
          favoriteMovie: string | null;
          bestMovieWatched: string | null;
          favoriteSeries: string | null;
          favoriteGenre: string | null;
          watchPreference: 'home' | 'cinema' | null;
          displayName: string | null;
          avatarPath: string | null;
        } | null;
      }[]>('/users');

      return apiResponse.data.map((apiUser) => {
        const prefs = apiUser.preferences;

        // Parse avatarPath if it's a JSON string
        let avatarId = prefs?.avatarPath ?? fallbackAvatar(apiUser.id);
        let displayName = prefs?.displayName ?? undefined;

        if (avatarId && avatarId.startsWith('{')) {
          try {
            const parsed = JSON.parse(avatarId);
            avatarId = parsed.avatarId ?? fallbackAvatar(apiUser.id);
            displayName = parsed.displayName ?? displayName;
          } catch {
            // If parsing fails, use fallback
            avatarId = fallbackAvatar(apiUser.id);
          }
        }

        return {
          id: apiUser.id,
          username: apiUser.username,
          created_at: apiUser.createdAt,
          user_id: apiUser.id,
          mcoins: apiUser.totalPoints,
          rank: apiUser.rank,
          avatar_id: avatarId,
          display_name: displayName,
          favorite_movie: prefs?.favoriteMovie ?? undefined,
          favorite_movie_2: prefs?.bestMovieWatched ?? undefined,
          favorite_genre: prefs?.favoriteGenre ?? undefined,
          favorite_series: prefs?.favoriteSeries ?? undefined,
          watch_preference: prefs?.watchPreference ?? undefined,
        } as RankedUser;
      });
    },
    () => localData.listRankedUsers(),
  );
}

type ApiActivity = {
  id: string;
  userId: string;
  type: string;
  referenceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  message?: string;
};

function activityMessage(a: ApiActivity): string {
  const meta = a.metadata ?? {};
  const title = (meta.title as string) ?? '';
  const username = (meta.username as string) ?? '';
  const targetUsername = (meta.targetUsername as string) ?? '';

  switch (a.type) {
    case 'new_member':
      return `Novo membro! @${username} entrou no cinerats.`;
    case 'favorited_user':
      if (username && targetUsername) return `@${username} favoritou @${targetUsername}.`;
      if (targetUsername) return `Favoritou @${targetUsername}.`;
      if (username) return `@${username} favoritou um usuário.`;
      return 'Favoritou um usuário.';
    case 'watched_movie':
      if (username && title) return `@${username} assistiu ${title}.`;
      if (title) return `Assistiu ${title}.`;
      if (username) return `@${username} assistiu um filme.`;
      return 'Assistiu um filme.';
    case 'watched_episode': {
      const s = meta.season as number | undefined;
      const ep = meta.episode as number | undefined;
      if (username && title && s && ep) return `@${username} assistiu ${title} T${s}E${ep}.`;
      if (title && s && ep) return `Assistiu ${title} T${s}E${ep}.`;
      if (username && title) return `@${username} assistiu ${title}.`;
      if (title) return `Assistiu ${title}.`;
      if (username) return `@${username} assistiu um episódio.`;
      return 'Assistiu um episódio.';
    }
    case 'watched_documentary':
      if (username && title) return `@${username} assistiu ${title}.`;
      if (title) return `Assistiu ${title}.`;
      if (username) return `@${username} assistiu um documentário.`;
      return 'Assistiu um documentário.';
    case 'reviewed_media':
      if (username && title) return `@${username} avaliou ${title}.`;
      if (title) return `Avaliou ${title}.`;
      if (username) return `@${username} avaliou uma mídia.`;
      return 'Avaliou uma mídia.';
    case 'added_to_watchlist':
      if (username && title) return `@${username} adicionou ${title} à watchlist.`;
      if (title) return `Adicionou ${title} à watchlist.`;
      if (username) return `@${username} adicionou à watchlist.`;
      return 'Adicionou à watchlist.';
    case 'recommended_media':
      if (username && title) return `@${username} recomendou ${title}.`;
      if (title) return `Recomendou ${title}.`;
      if (username) return `@${username} fez uma recomendação.`;
      return 'Fez uma recomendação.';
    default:
      return (meta.message as string) ?? 'Atividade registrada.';
  }
}

function mapApiActivity(a: ApiActivity, usersMap?: Map<string, string>): ActivityEntry {
  // Use message from API if available, otherwise build it (fallback for local mode)
  let message = a.message;

  if (!message) {
    // Fallback: Enrich metadata with username from users map if available
    const enrichedActivity = { ...a };
    if (usersMap && !enrichedActivity.metadata?.username) {
      const username = usersMap.get(a.userId);
      if (username) {
        enrichedActivity.metadata = {
          ...enrichedActivity.metadata,
          username,
        };
      }
    }
    message = activityMessage(enrichedActivity);
  }

  return {
    id: a.id,
    user_id: a.userId,
    message,
    mcoins_delta: 0,
    created_at: a.createdAt,
  };
}

export async function listActivities(limit = 30) {
  return withFallback(
    async () => {
      const res = await apiClient.get<ApiActivity[]>(`/activities?limit=${limit}`);
      // API now returns messages, no need to enrich with usernames
      return res.data.map((activity) => mapApiActivity(activity));
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
      const includesGlobal = userIds.includes('global');

      let activities: ApiActivity[];

      if (includesGlobal) {
        // Use the feed endpoint — it already merges own + favorites + new_member activities
        const res = await apiClient.get<ApiActivity[]>(`/activities?limit=${limit}`);
        activities = res.data;
      } else {
        // Single user profile view — fetch per user
        const results = await Promise.all(
          userIds.map((id) =>
            apiClient.get<ApiActivity[]>(`/users/${id}/activities`).then((r) => r.data).catch(() => [] as ApiActivity[]),
          ),
        );
        activities = results.flat();
        activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        activities = activities.slice(0, limit);
      }

      // API now returns messages, no need to enrich with usernames
      return activities.map((activity) => mapApiActivity(activity));
    },
    () => localData.listUserActivity(userIds[0], limit),
  );
}

export async function getCurrentSessionUser() {
  return withFallback(
    async () => {
      if (cachedSessionUser) return cachedSessionUser;
      try {
        const { data } = await apiClient.get<{ id: string; username: string }>('/auth/me');
        cachedSessionUser = { id: data.id, username: data.username };
        return cachedSessionUser;
      } catch {
        return null;
      }
    },
    () => localData.getCurrentSessionUser(),
  );
}

export async function logoutUser() {
  clearAppDataCache();
  return withFallback(
    async () => {
      try {
        await apiClient.post('/auth/sign-out');
      } catch {
        // Ignore errors and proceed with local cleanup.
      }
    },
    () => localData.logoutUser(),
  );
}

export async function deleteCurrentUser(userId: string, currentPassword: string) {
  clearAppDataCache();
  return withFallback(
    async () => {
      if (!currentPassword.trim()) {
        throw new Error('Informe sua senha atual para confirmar a exclusao.');
      }

      await apiClient.delete('/auth/delete-account', { data: { password: currentPassword } });

      clearAppDataCache();
    },
    () => localData.deleteCurrentUser(userId, currentPassword),
  );
}

export async function updateUserAvatar(userId: string, avatarId: string) {
  return withFallback(
    async () => {
      await apiClient.put('/users/me/preferences', { avatarPath: avatarId });
    },
    () => localData.updateUserAvatar(userId, avatarId),
  );
}

export async function uploadAvatarImage(file: File): Promise<string> {
  return withFallback(
    async () => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.put<{ avatarPath: string }>('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.avatarPath;
    },
    async () => {
      // Fallback: create data URL for local mode
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('Falha ao ler imagem.'));
        reader.readAsDataURL(file);
      });
    },
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
      const apiPrefs: Record<string, string | undefined> = {};
      if (data.favorite_movie !== undefined) apiPrefs.favoriteMovie = data.favorite_movie;
      if (data.favorite_movie_2 !== undefined) apiPrefs.bestMovieWatched = data.favorite_movie_2;
      if (data.favorite_series !== undefined) apiPrefs.favoriteSeries = data.favorite_series;
      if (data.favorite_genre !== undefined) apiPrefs.favoriteGenre = data.favorite_genre;
      if (data.watch_preference !== undefined) apiPrefs.watchPreference = data.watch_preference;
      if (data.display_name !== undefined) apiPrefs.displayName = data.display_name;

      if (Object.keys(apiPrefs).length > 0) {
        await apiClient.put('/users/me/preferences', apiPrefs);
      }
    },
    () => localData.updateUserProfile(userId, data),
  );
}

export async function listPersonalMovies(userId: string) {
  return withFallback(
    async () => {
      const [watchEntriesRes, watchlistRes, reviewsRes] = await Promise.all([
        apiClient.get<{ id: string; type: string; points: number; providerExternalId: string; season?: number | null; episode?: number | null; createdAt: string; title: string; posterPath: string | null; isRetroactive?: boolean; is_retroactive?: boolean }[]>(`/users/${userId}/watch-entries`),
        apiClient.get<{ id: string; providerExternalId: string; type: string; title: string; posterPath: string | null; season?: number | null; episode?: number | null; createdAt: string }[]>(`/watchlist/users/${userId}`),
        apiClient.get<{ id: string; mediaItemId: string; providerExternalId: string; type: 'movie' | 'series'; rating: number; review: string | null; createdAt: string; title: string; posterPath: string | null }[]>(`/users/${userId}/reviews`),
      ]);

      // Create a map of reviews by providerExternalId for movies
      const reviewsMap = new Map(
        reviewsRes.data
          .filter((r) => r.type === 'movie')
          .map((r) => [r.providerExternalId, r])
      );

      const watched: PersonalMovie[] = watchEntriesRes.data
        .filter((e) => e.type === 'movie')
        .map((e) => {
          const review = reviewsMap.get(e.providerExternalId);
          return {
            id: e.id,
            user_id: userId,
            titulo: e.title ?? '',
            ano_lancamento: null,
            capa_url: e.posterPath ?? null,
            plataforma_slug: null,
            status: 'watched' as MovieStatus,
            source: 'manual' as const,
            source_movie_id: e.providerExternalId ?? null,
            avaliacao: review?.rating ?? null,
            rating: review?.rating ?? null,
            review: review?.review ?? null,
            streaming_data: null,
            created_at: e.createdAt,
            is_retroactive: Boolean(e.isRetroactive ?? e.is_retroactive) || e.points === 0,
          };
        });

      const watchlist: PersonalMovie[] = watchlistRes.data
        .filter((e) => e.type === 'movie')
        .map((e) => ({
          id: e.id,
          user_id: userId,
          titulo: e.title ?? '',
          ano_lancamento: null,
          capa_url: e.posterPath ?? null,
          plataforma_slug: null,
          status: 'watchlist' as MovieStatus,
          source: 'manual' as const,
          source_movie_id: e.providerExternalId ?? null,
          avaliacao: null,
          rating: null,
          review: null,
          streaming_data: null,
          created_at: e.createdAt,
        }));

      const all = [...watched, ...watchlist];
      all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return all;
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
      const providerExternalId = movie.source_movie_id ?? '';

      if (movie.status === 'watchlist') {
        const res = await apiClient.post<{ id: string; providerExternalId: string; type: string; title: string; posterPath: string | null; season?: number | null; episode?: number | null; createdAt: string }>('/watchlist', {
          type: 'movie',
          providerExternalId,
        });
        return {
          id: res.data.id,
          user_id: userId,
          titulo: res.data.title ?? movie.titulo,
          ano_lancamento: movie.ano_lancamento ?? null,
          capa_url: res.data.posterPath ?? movie.capa_url ?? null,
          plataforma_slug: movie.plataforma_slug ?? null,
          status: 'watchlist' as MovieStatus,
          source: movie.source ?? ('manual' as const),
          source_movie_id: res.data.providerExternalId ?? null,
          avaliacao: movie.avaliacao ?? null,
          rating: movie.rating ?? null,
          review: movie.review ?? null,
          streaming_data: movie.streaming_data ?? null,
          created_at: res.data.createdAt,
          is_retroactive: movie.is_retroactive,
        } as PersonalMovie;
      }

      // status === 'watched'
      const res = await apiClient.post<{ id: string; type: string; points: number; providerExternalId: string; season?: number | null; episode?: number | null; createdAt: string }>('/watch-entries', {
        type: 'movie',
        providerExternalId,
        isRetroactive: movie.is_retroactive ?? false,
      });
      return {
        id: res.data.id,
        user_id: userId,
        titulo: movie.titulo,
        ano_lancamento: movie.ano_lancamento ?? null,
        capa_url: movie.capa_url ?? null,
        plataforma_slug: movie.plataforma_slug ?? null,
        status: 'watched' as MovieStatus,
        source: movie.source ?? ('manual' as const),
        source_movie_id: res.data.providerExternalId ?? null,
        avaliacao: movie.avaliacao ?? null,
        rating: movie.rating ?? null,
        review: movie.review ?? null,
        streaming_data: movie.streaming_data ?? null,
        created_at: res.data.createdAt,
        is_retroactive: movie.is_retroactive,
      } as PersonalMovie;
    },
    () => localData.addPersonalMovie(userId, movie),
  );
}

export async function updatePersonalMovie(
  movieId: string,
  updates: Partial<Pick<PersonalMovie, 'status' | 'plataforma_slug' | 'avaliacao' | 'is_retroactive'>>,
  userId?: string | null,
) {
  return withFallback(
    async () => {
      // Move a watched item back to the watchlist.
      if (updates.status === 'watchlist') {
        const watchEntriesRes = await apiClient.get<{
          id: string;
          providerExternalId: string;
          type: string;
          title: string;
          posterPath: string | null;
        }[]>(userId ? `/users/${userId}/watch-entries` : '/watch-entries');
        const item = watchEntriesRes.data.find((entry) => entry.id === movieId);

        if (item) {
          await apiClient.delete(`/watch-entries/${movieId}`);
          const res = await apiClient.post<{
            id: string;
            providerExternalId: string;
            type: string;
            title: string;
            posterPath: string | null;
            createdAt: string;
          }>('/watchlist', {
            type: item.type,
            providerExternalId: item.providerExternalId,
          });

          return {
            id: res.data.id,
            user_id: '',
            titulo: res.data.title ?? item.title,
            ano_lancamento: null,
            capa_url: res.data.posterPath ?? item.posterPath,
            plataforma_slug: updates.plataforma_slug ?? null,
            status: 'watchlist' as MovieStatus,
            source: 'manual' as const,
            source_movie_id: res.data.providerExternalId ?? item.providerExternalId,
            avaliacao: updates.avaliacao ?? null,
            rating: null,
            review: null,
            streaming_data: null,
            created_at: res.data.createdAt,
          } as PersonalMovie;
        }
      }

      // If status changed to 'watched', move from watchlist to watch-entries
      if (updates.status === 'watched') {
        // We need to get the current item to find its providerExternalId.
        // Try to delete from watchlist (it may be a watchlist item being moved to watched).
        // The caller provides the movieId which is the watchlist entry id.
        try {
          // Get the current watchlist to find the item details
          const watchlistRes = await apiClient.get<{ id: string; providerExternalId: string; type: string; title: string; posterPath: string | null; createdAt: string }[]>('/watchlist');
          const item = watchlistRes.data.find((e) => e.id === movieId);
          if (item) {
            await apiClient.delete(`/watchlist/${movieId}`);
            const res = await apiClient.post<{ id: string; type: string; points: number; providerExternalId: string; createdAt: string }>('/watch-entries', {
              type: item.type,
              providerExternalId: item.providerExternalId,
              isRetroactive: updates.is_retroactive ?? false,
            });
            return {
              id: res.data.id,
              user_id: '',
              titulo: item.title,
              ano_lancamento: null,
              capa_url: item.posterPath ?? null,
              plataforma_slug: updates.plataforma_slug ?? null,
              status: 'watched' as MovieStatus,
              source: 'manual' as const,
              source_movie_id: item.providerExternalId ?? null,
              avaliacao: updates.avaliacao ?? null,
              rating: null,
              review: null,
              streaming_data: null,
              created_at: res.data.createdAt,
              is_retroactive: updates.is_retroactive,
            } as PersonalMovie;
          }
        } catch {
          // Not a watchlist item, ignore
        }
      }

      // For other field-level updates (plataforma, avaliacao) the API doesn't
      // support partial updates on watch-entries/watchlist, so fall back to localData.
      return localData.updatePersonalMovie(movieId, updates);
    },
    () => localData.updatePersonalMovie(movieId, updates),
  );
}

// REMOVED: deleteActivitiesForTitle - activities are now managed automatically by the API

export async function deletePersonalMovie(movieId: string) {
  return withFallback(
    async () => {
      try {
        await apiClient.delete(`/watch-entries/${movieId}`);
      } catch {
        await apiClient.delete(`/watchlist/${movieId}`);
      }
    },
    () => localData.deletePersonalMovie(movieId),
  );
}

export async function listSeries(userId: string) {
  return withFallback(
    async () => {
      const [watchEntriesRes, watchlistRes, reviewsRes] = await Promise.all([
        apiClient.get<{ id: string; type: string; points: number; providerExternalId: string; season?: number | null; episode?: number | null; createdAt: string; title: string; posterPath: string | null; isRetroactive?: boolean; is_retroactive?: boolean }[]>(`/users/${userId}/watch-entries`),
        apiClient.get<{ id: string; providerExternalId: string; type: string; title: string; posterPath: string | null; season?: number | null; episode?: number | null; createdAt: string }[]>(`/watchlist/users/${userId}`),
        apiClient.get<{ id: string; mediaItemId: string; providerExternalId: string; type: 'movie' | 'series'; rating: number; review: string | null; createdAt: string; title: string; posterPath: string | null }[]>(`/users/${userId}/reviews`),
      ]);

      const seriesEntries = watchEntriesRes.data.filter((e) => e.type === 'series');
      const seriesWatchlist = watchlistRes.data.filter((e) => e.type === 'series');

      // Create a map of reviews by providerExternalId for series
      const reviewsMap = new Map(
        reviewsRes.data
          .filter((r) => r.type === 'series')
          .map((r) => [r.providerExternalId, r])
      );

      // Collect unique TMDB IDs to fetch season totals
      const tmdbIds = new Set<string>();
      for (const e of seriesEntries) if (e.providerExternalId) tmdbIds.add(e.providerExternalId);
      for (const e of seriesWatchlist) if (e.providerExternalId) tmdbIds.add(e.providerExternalId);

      // Fetch TMDB details in parallel (deduplicated) with localStorage cache
      const tmdbDetailsMap = new Map<string, { season_number: number; episode_count: number }[]>();
      await Promise.all(
        [...tmdbIds].map(async (tmdbId) => {
          const details = await getTvDetailsWithCache(Number(tmdbId));
          if (details) tmdbDetailsMap.set(tmdbId, details.seasons);
        }),
      );

      const getSeasonTotal = (tmdbId: string | null, season: number): number => {
        if (!tmdbId) return 0;
        const seasons = tmdbDetailsMap.get(tmdbId);
        if (!seasons) return 0;
        const s = seasons.find((item) => item.season_number === season);
        return s?.episode_count ?? 0;
      };
      const getSeriesProgressStatus = (
        tmdbId: string | null,
        season: number,
        watchedEpisodes: number,
      ): SeriesStatus => {
        const seasons = tmdbId
          ? (tmdbDetailsMap.get(tmdbId) || [])
              .filter((item) => item.season_number > 0)
              .sort((a, b) => a.season_number - b.season_number)
          : [];
        const lastSeason = seasons[seasons.length - 1];
        const seasonTotal = getSeasonTotal(tmdbId, season);
        const completedEntireSeries = Boolean(
          lastSeason
          && season === lastSeason.season_number
          && seasonTotal > 0
          && watchedEpisodes >= seasonTotal,
        );
        return completedEntireSeries ? 'watched' : 'watching';
      };

      const watched: SeriesEntry[] = seriesEntries.map((e) => {
        const temporada = e.season ?? 1;
        const episodios_vistos = e.episode ?? 0;
        const total_episodios = getSeasonTotal(e.providerExternalId, temporada);
        const review = reviewsMap.get(e.providerExternalId);
        return {
          id: e.id,
          user_id: userId,
          titulo: e.title ?? '',
          capa_url: e.posterPath ?? null,
          status: getSeriesProgressStatus(e.providerExternalId, temporada, episodios_vistos),
          temporada,
          total_episodios,
          episodios_vistos,
          plataforma_slug: null,
          source_movie_id: e.providerExternalId ?? null,
          avaliacao: review?.rating ?? null,
          rating: review?.rating ?? null,
          review: review?.review ?? null,
          streaming_data: null,
          created_at: e.createdAt,
          is_retroactive: Boolean(e.isRetroactive ?? e.is_retroactive) || e.points === 0,
        };
      });

      const watchlist: SeriesEntry[] = seriesWatchlist.map((e) => ({
        id: e.id,
        user_id: userId,
        titulo: e.title ?? '',
        capa_url: e.posterPath ?? null,
        status: 'watchlist' as SeriesStatus,
        temporada: e.season ?? 1,
        total_episodios: getSeasonTotal(e.providerExternalId, e.season ?? 1),
        episodios_vistos: 0,
        plataforma_slug: null,
        source_movie_id: e.providerExternalId ?? null,
        avaliacao: null,
        rating: null,
        review: null,
        streaming_data: null,
        created_at: e.createdAt,
      }));

      const all = [...watched, ...watchlist];
      all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return all;
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
      const providerExternalId = series.source_movie_id ?? series.titulo;
      const season = Math.max(1, series.temporada || 1);
      const episode = series.episodios_vistos > 0 ? series.episodios_vistos : undefined;

      if (series.status === 'watchlist') {
        const res = await apiClient.post<{ id: string; providerExternalId: string; type: string; title: string; posterPath: string | null; season?: number | null; episode?: number | null; createdAt: string }>('/watchlist', {
          type: 'series',
          providerExternalId,
          season,
          episode,
        });
        return {
          id: res.data.id,
          user_id: userId,
          titulo: res.data.title ?? series.titulo,
          capa_url: res.data.posterPath ?? series.capa_url ?? null,
          status: 'watchlist' as SeriesStatus,
          temporada: res.data.season ?? season,
          total_episodios: series.total_episodios,
          episodios_vistos: 0,
          plataforma_slug: series.plataforma_slug ?? null,
          avaliacao: series.avaliacao ?? null,
          rating: series.rating ?? null,
          review: series.review ?? null,
          streaming_data: series.streaming_data ?? null,
          created_at: res.data.createdAt,
          is_retroactive: series.is_retroactive,
        } as SeriesEntry;
      }

      // watching or watched → create watch-entry
      const res = await apiClient.post<{ id: string; type: string; points: number; providerExternalId: string; season?: number | null; episode?: number | null; createdAt: string }>('/watch-entries', {
        type: 'series',
        providerExternalId,
        season,
        episode,
        isRetroactive: series.is_retroactive ?? false,
      });
      return {
        id: res.data.id,
        user_id: userId,
        titulo: series.titulo,
        capa_url: series.capa_url ?? null,
        status: series.status,
        temporada: res.data.season ?? season,
        total_episodios: series.total_episodios,
        episodios_vistos: series.episodios_vistos,
        plataforma_slug: series.plataforma_slug ?? null,
        avaliacao: series.avaliacao ?? null,
        rating: series.rating ?? null,
        review: series.review ?? null,
        streaming_data: series.streaming_data ?? null,
        created_at: res.data.createdAt,
        is_retroactive: series.is_retroactive,
      } as SeriesEntry;
    },
    () => localData.addSeries(userId, series),
  );
}

export async function updateSeries(
  seriesId: string,
  updates: Partial<
    Pick<
      SeriesEntry,
      'status' | 'temporada' | 'total_episodios' | 'episodios_vistos' | 'plataforma_slug' | 'avaliacao' | 'source_movie_id' | 'is_retroactive'
    >
  >,
) {
  return withFallback(
    async () => {
      // Resolve the providerExternalId from updates or by looking up the current item
      let providerExternalId = updates.source_movie_id ?? null;
      let itemTitle: string | null = null;
      let itemPosterPath: string | null = null;

      if (!providerExternalId) {
        // Try to find the item in watchlist first, then watch-entries
        try {
          const watchlistRes = await apiClient.get<{ id: string; providerExternalId: string; type: string; title: string; posterPath: string | null; season?: number | null; episode?: number | null; createdAt: string }[]>('/watchlist');
          const wlItem = watchlistRes.data.find((e) => e.id === seriesId);
          if (wlItem) {
            providerExternalId = wlItem.providerExternalId;
            itemTitle = wlItem.title;
            itemPosterPath = wlItem.posterPath;
          }
        } catch { /* ignore */ }

        if (!providerExternalId) {
          try {
            const weRes = await apiClient.get<{ id: string; type: string; providerExternalId: string; title: string; posterPath: string | null; season?: number | null; episode?: number | null; createdAt: string }[]>('/watch-entries');
            const weItem = weRes.data.find((e) => e.id === seriesId);
            if (weItem) {
              providerExternalId = weItem.providerExternalId;
              itemTitle = weItem.title;
              itemPosterPath = weItem.posterPath;
            }
          } catch { /* ignore */ }
        }
      }

      if (!providerExternalId) {
        return localData.updateSeries(seriesId, updates);
      }

      // Move a watched/watching series back to the watchlist.
      if (updates.status === 'watchlist') {
        const watchEntriesRes = await apiClient.get<{
          id: string;
          providerExternalId: string;
          type: string;
          title: string;
          posterPath: string | null;
          season?: number | null;
        }[]>('/watch-entries');
        const item = watchEntriesRes.data.find((entry) => entry.id === seriesId);

        if (item) {
          await apiClient.delete(`/watch-entries/${seriesId}`);
          const season = Math.max(1, updates.temporada ?? item.season ?? 1);
          const res = await apiClient.post<{
            id: string;
            providerExternalId: string;
            type: string;
            title: string;
            posterPath: string | null;
            season?: number | null;
            createdAt: string;
          }>('/watchlist', {
            type: 'series',
            providerExternalId: item.providerExternalId,
            season,
          });

          return {
            id: res.data.id,
            user_id: '',
            titulo: res.data.title ?? item.title,
            capa_url: res.data.posterPath ?? item.posterPath,
            status: 'watchlist',
            source_movie_id: res.data.providerExternalId ?? item.providerExternalId,
            temporada: res.data.season ?? season,
            total_episodios: updates.total_episodios ?? 0,
            episodios_vistos: 0,
            plataforma_slug: updates.plataforma_slug ?? null,
            avaliacao: updates.avaliacao ?? null,
            rating: null,
            review: null,
            streaming_data: null,
            created_at: res.data.createdAt,
          } as SeriesEntry;
        }
      }

      // If status changed to 'watched' or 'watching' from watchlist, move from watchlist to watch-entries
      if (updates.status === 'watched' || updates.status === 'watching') {
        try {
          const watchlistRes = await apiClient.get<{ id: string; providerExternalId: string; type: string; title: string; posterPath: string | null; createdAt: string }[]>('/watchlist');
          const item = watchlistRes.data.find((e) => e.id === seriesId);
          if (item) {
            await apiClient.delete(`/watchlist/${seriesId}`);
            const res = await apiClient.post<{ id: string; type: string; points: number; providerExternalId: string; season?: number | null; episode?: number | null; createdAt: string }>('/watch-entries', {
              type: 'series',
              providerExternalId: item.providerExternalId,
              season: updates.temporada,
              episode: updates.episodios_vistos,
              isRetroactive: updates.is_retroactive ?? false,
            });
            return {
              id: res.data.id,
              user_id: '',
              titulo: item.title,
              capa_url: item.posterPath ?? null,
              status: updates.status,
              source_movie_id: item.providerExternalId,
              temporada: res.data.season ?? updates.temporada ?? 1,
              total_episodios: updates.total_episodios ?? 0,
              episodios_vistos: updates.episodios_vistos ?? 0,
              plataforma_slug: updates.plataforma_slug ?? null,
              avaliacao: updates.avaliacao ?? null,
              rating: null,
              review: null,
              streaming_data: null,
              created_at: res.data.createdAt,
              is_retroactive: updates.is_retroactive,
            } as SeriesEntry;
          }
        } catch {
          // Not a watchlist item — fall through to episode progress
        }
      }

      // Episode progress: append a new watch-entry (table is append-only)
      if (updates.episodios_vistos !== undefined) {
        // Get current series data to determine previous episode
        let previousEpisode = 0;
        let previousSeason = updates.temporada ?? 1;

        try {
          const weRes = await apiClient.get<{ id: string; type: string; providerExternalId: string; season?: number | null; episode?: number | null; createdAt: string }[]>('/watch-entries');
          const seriesEntries = weRes.data
            .filter((e) => e.type === 'series' && e.providerExternalId === providerExternalId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          if (seriesEntries.length > 0) {
            const lastEntry = seriesEntries[0];
            previousEpisode = lastEntry.episode ?? 0;
            previousSeason = lastEntry.season ?? 1;
          }
        } catch {
          // If we can't get previous data, just mark the single episode
          previousEpisode = 0;
        }

        const currentSeason = updates.temporada ?? 1;
        const currentEpisode = updates.episodios_vistos;

        // Calculate episodes to mark
        const episodes: Array<{ season: number; episode: number }> = [];

        if (currentSeason === previousSeason) {
          // Same season: mark all episodes from previous + 1 to current
          for (let ep = previousEpisode + 1; ep <= currentEpisode; ep++) {
            episodes.push({ season: currentSeason, episode: ep });
          }
        } else if (currentSeason > previousSeason) {
          // Different season: need to fetch TMDB data to know how many episodes each season has
          try {
            const tmdbDetails = await getTvDetailsWithCache(Number(providerExternalId));
            if (tmdbDetails && tmdbDetails.seasons) {
              const regularSeasons = tmdbDetails.seasons
                .filter((s) => s.season_number > 0)
                .sort((a, b) => a.season_number - b.season_number);

              // Complete previous season
              const prevSeasonData = regularSeasons.find((s) => s.season_number === previousSeason);
              if (prevSeasonData) {
                for (let ep = previousEpisode + 1; ep <= prevSeasonData.episode_count; ep++) {
                  episodes.push({ season: previousSeason, episode: ep });
                }
              }

              // Complete all intermediate seasons
              for (let s = previousSeason + 1; s < currentSeason; s++) {
                const seasonData = regularSeasons.find((season) => season.season_number === s);
                if (seasonData) {
                  for (let ep = 1; ep <= seasonData.episode_count; ep++) {
                    episodes.push({ season: s, episode: ep });
                  }
                }
              }

              // Mark episodes in current season up to currentEpisode
              for (let ep = 1; ep <= currentEpisode; ep++) {
                episodes.push({ season: currentSeason, episode: ep });
              }
            } else {
              // Fallback: just mark the current episode if can't get TMDB data
              episodes.push({ season: currentSeason, episode: currentEpisode });
            }
          } catch {
            // Fallback: just mark the current episode
            episodes.push({ season: currentSeason, episode: currentEpisode });
          }
        } else {
          // Going backwards? Just mark the single episode
          episodes.push({ season: currentSeason, episode: currentEpisode });
        }

        // Remove duplicates and episodes already watched
        const uniqueEpisodes = episodes.filter((ep, index, self) =>
          index === self.findIndex((e) => e.season === ep.season && e.episode === ep.episode)
        );

        if (uniqueEpisodes.length === 0) {
          // No episodes to mark, just return current state
          return localData.updateSeries(seriesId, updates);
        }

        // Use batch endpoint if multiple episodes, single endpoint otherwise
        if (uniqueEpisodes.length > 1) {
          const res = await apiClient.post<{
            entries: Array<{ id: string; type: string; points: number; season: number; episode: number; createdAt: string }>;
            totalPoints: number;
            providerExternalId: string;
          }>('/watch-entries/batch', {
            type: 'series',
            providerExternalId,
            episodes: uniqueEpisodes,
            isRetroactive: updates.is_retroactive ?? false,
          });

          // Return the last entry as the "current" state
          const lastEntry = res.data.entries[res.data.entries.length - 1];
          return {
            id: lastEntry.id,
            user_id: '',
            titulo: itemTitle ?? '',
            capa_url: itemPosterPath ?? null,
            status: updates.status ?? 'watching',
            source_movie_id: providerExternalId,
            temporada: lastEntry.season,
            total_episodios: updates.total_episodios ?? 0,
            episodios_vistos: lastEntry.episode,
            plataforma_slug: updates.plataforma_slug ?? null,
            avaliacao: updates.avaliacao ?? null,
            rating: null,
            review: null,
            streaming_data: null,
            created_at: lastEntry.createdAt,
            is_retroactive: updates.is_retroactive,
          } as SeriesEntry;
        } else {
          // Single episode: use existing endpoint
          const res = await apiClient.post<{ id: string; type: string; points: number; providerExternalId: string; season?: number | null; episode?: number | null; createdAt: string }>('/watch-entries', {
            type: 'series',
            providerExternalId,
            season: uniqueEpisodes[0].season,
            episode: uniqueEpisodes[0].episode,
            isRetroactive: updates.is_retroactive ?? false,
          });
          return {
            id: res.data.id,
            user_id: '',
            titulo: itemTitle ?? '',
            capa_url: itemPosterPath ?? null,
            status: updates.status ?? 'watching',
            source_movie_id: providerExternalId,
            temporada: res.data.season ?? updates.temporada ?? 1,
            total_episodios: updates.total_episodios ?? 0,
            episodios_vistos: updates.episodios_vistos,
            plataforma_slug: updates.plataforma_slug ?? null,
            avaliacao: updates.avaliacao ?? null,
            rating: null,
            review: null,
            streaming_data: null,
            created_at: res.data.createdAt,
            is_retroactive: updates.is_retroactive,
          } as SeriesEntry;
        }
      }

      // For other field-level updates (plataforma, avaliacao) fall back to localData
      return localData.updateSeries(seriesId, updates);
    },
    () => localData.updateSeries(seriesId, updates),
  );
}


export async function updatePersonalMovieStreaming(movieId: string, streamingData: string) {
  return withFallback(
    async () => {
      // The API does not support streaming data updates on watch-entries/watchlist.
      // Fall back to localData for this field.
      return localData.updatePersonalMovieStreaming(movieId, streamingData);
    },
    () => localData.updatePersonalMovieStreaming(movieId, streamingData),
  );
}

export async function updateSeriesStreaming(seriesId: string, streamingData: string) {
  return withFallback(
    async () => {
      // The API does not support streaming data updates on watch-entries/watchlist.
      // Fall back to localData for this field.
      return localData.updateSeriesStreaming(seriesId, streamingData);
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
      const type = mediaType === 'tv' ? 'series' : 'movie';
      await apiClient.post('/recommendations', {
        toUserId,
        type,
        providerExternalId: movie.source_movie_id ?? '',
      });
    },
    () => localData.suggestMovieToUser(fromUserId, toUserId, movie, mediaType),
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
      // We need the providerExternalId for the review. Try to find the movie in watch-entries.
      const watchEntriesRes = await apiClient.get<{ id: string; providerExternalId: string; type: string; title: string }[]>('/watch-entries');
      const entry = watchEntriesRes.data.find((e) => e.id === movieId);
      const providerExternalId = entry?.providerExternalId ?? movieId;

      // Prepare request body
      const requestBody: {
        providerExternalId: string;
        type: string;
        rating: number;
        review?: string;
      } = {
        providerExternalId,
        type: 'movie',
        rating: stars,
      };

      // Only include review if it has content
      if (review && review.trim()) {
        requestBody.review = review;
      }

      await apiClient.post('/reviews', requestBody);
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
      // We need the providerExternalId for the review. Try to find the series in watch-entries.
      const watchEntriesRes = await apiClient.get<{ id: string; providerExternalId: string; type: string; title: string }[]>('/watch-entries');
      const entry = watchEntriesRes.data.find((e) => e.id === seriesId);
      const providerExternalId = entry?.providerExternalId ?? seriesId;

      // Prepare request body
      const requestBody: {
        providerExternalId: string;
        type: string;
        rating: number;
        review?: string;
      } = {
        providerExternalId,
        type: 'series',
        rating: stars,
      };

      // Only include review if it has content
      if (review && review.trim()) {
        requestBody.review = review;
      }

      await apiClient.post('/reviews', requestBody);
    },
    () => localData.rateSeries(actorUserId, seriesId, stars, review),
  );
}

export async function listMediaReviews(providerExternalId: string, type: 'movie' | 'series') {
  return withFallback(
    async () => {
      const { data } = await apiClient.get<{
        watchersCount: number;
        averageRating: number;
        reviews: {
          id: string;
          userId: string;
          username: string;
          rating: number;
          review: string | null;
          createdAt: string;
        }[];
      }>('/reviews', {
        params: { providerExternalId, type },
      });
      return {
        watchersCount: Number.isFinite(Number(data.watchersCount))
          ? Math.max(0, Math.floor(Number(data.watchersCount)))
          : data.reviews.length,
        averageRating: Number(data.averageRating) || 0,
        reviews: data.reviews,
      };
    },
    async () => {
      // Local mode: return empty stats since we don't have review data locally
      return {
        watchersCount: 0,
        averageRating: 0,
        reviews: [],
      };
    },
  );
}

export async function listUserReviews(userId: string) {
  return withFallback(
    async () => {
      const { data } = await apiClient.get<{
        id: string;
        userId: string;
        providerExternalId: string;
        type: 'movie' | 'series';
        rating: number;
        review: string | null;
        createdAt: string;
        title: string;
        posterPath: string | null;
      }[]>(`/users/${userId}/reviews`);
      return data;
    },
    async () => {
      // Local mode: return empty array
      return [];
    },
  );
}

export async function deleteReview(reviewId: string) {
  return withFallback(
    async () => {
      await apiClient.delete(`/reviews/${reviewId}`);
    },
    async () => {
      // Local mode: no-op
    },
  );
}

export async function getMovieCineratsStats(sourceMovieId: string | null, title: string) {
  return withFallback(
    async () => {
      if (!sourceMovieId) {
        // Fallback to local data if no TMDB ID
        return localData.getMovieCineratsStats(sourceMovieId, title);
      }

      // The dynamic media page needs the all-time watcher count.
      // Trending is a separate 30-day popularity metric and must not be used here.
      const mediaStats = await listMediaReviews(sourceMovieId, 'movie');
      const reviews = mediaStats.reviews;
      const watchersCount = mediaStats.watchersCount;

      // Calculate average rating
      const ratings = reviews.map((r) => Number(r.rating)).filter((r) => r > 0);
      const averageRating = ratings.length > 0
        ? Number((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1))
        : 0;

      return {
        watchersCount,
        averageRating,
        reviews: reviews.map((r) => ({
          userId: r.userId,
          username: r.username,
          review: r.review,
          rating: r.rating,
          createdAt: r.createdAt,
        })),
      };
    },
    () => localData.getMovieCineratsStats(sourceMovieId, title),
  );
}

export async function getSeriesCineratsStats(sourceMovieId: string | null, title: string) {
  return withFallback(
    async () => {
      if (!sourceMovieId) {
        // Fallback to local data if no TMDB ID
        return localData.getSeriesCineratsStats(title);
      }

      // Use the all-time watcher count returned by the media stats endpoint.
      // The trending metric is intentionally not used on the dynamic page.
      const mediaStats = await listMediaReviews(sourceMovieId, 'series');
      const reviews = mediaStats.reviews;

      // Calculate stats
      const ratings = reviews.map((r) => Number(r.rating)).filter((r) => r > 0);
      const averageRating = ratings.length > 0
        ? Number((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1))
        : 0;

      return {
        watchersCount: mediaStats.watchersCount,
        averageRating,
        reviews: reviews.map((r) => ({
          userId: r.userId,
          username: r.username,
          review: r.review,
          rating: r.rating,
          createdAt: r.createdAt,
        })),
      };
    },
    () => localData.getSeriesCineratsStats(title),
  );
}

export async function deleteSeries(seriesId: string) {
  return withFallback(
    async () => {
      try {
        await apiClient.delete(`/watch-entries/${seriesId}`);
      } catch {
        await apiClient.delete(`/watchlist/${seriesId}`);
      }
    },
    () => localData.deleteSeries(seriesId),
  );
}

// REMOVED: pickRandom - no longer needed

export async function getCineMatchSuggestion(
  currentUserId: string,
  friendUserId: string,
  mode: CineMatchMode,
): Promise<CineMatchSuggestion | null> {
  return withFallback(
    async () => {
      const res = await apiClient.get<{ providerExternalId: string; title: string; posterPath: string | null; type: string } | null>('/cinematch', {
        params: { friendId: friendUserId, mode },
      });

      if (!res.data) return null;

      return {
        titulo: res.data.title,
        capa_url: res.data.posterPath,
        origem: mode,
        reason: mode === 'geral'
          ? 'Watchlist em comum encontrada para os dois.'
          : 'Oscar pendente para os dois usuarios.',
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
      const res = await apiClient.get<{ title: string; posterPath: string | null; providerExternalId: string; type?: string; mediaType?: string; userCount: number; userIds: string[]; lastWatchedAt: string }[]>('/watch-entries/trending');
      return res.data.map((e) => ({
        title: e.title,
        coverUrl: e.posterPath,
        tmdbId: e.providerExternalId,
        mediaType: e.mediaType === 'tv' || e.mediaType === 'series' || e.type === 'tv' || e.type === 'series' ? 'tv' as const : e.mediaType === 'movie' || e.type === 'movie' ? 'movie' as const : undefined,
        userCount: e.userCount,
        userIds: e.userIds,
        lastWatchedAt: e.lastWatchedAt,
      }));
    },
    () => localData.getTrendingMovies(),
  );
}

const categoryToApi: Record<string, string> = {
  melhor_filme: 'best_picture',
  melhor_ator: 'best_actor',
  melhor_atriz: 'best_actress',
  melhor_internacional: 'best_international_film',
  melhor_roteiro: 'best_screenplay',
};

const categoryFromApi: Record<string, string> = Object.fromEntries(
  Object.entries(categoryToApi).map(([k, v]) => [v, k]),
);

export async function getOscarPredictionsForUser(userId: string): Promise<UserOscarPrediction[]> {
  return withFallback(
    async () => {
      const res = await apiClient.get<{ id: string; category: string; providerExternalId: string; name: string; imagePath: string | null; createdAt: string }[]>(`/users/${userId}/oscar-predictions`);
      return res.data.map((p) => ({
        id: p.id,
        user_id: userId,
        category: categoryFromApi[p.category] ?? p.category,
        tmdb_id: p.providerExternalId,
        title: p.name,
        poster_path: p.imagePath ?? '',
        created_at: p.createdAt,
      }));
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
      const res = await apiClient.put<{ id: string; category: string; providerExternalId: string; name: string; imagePath: string | null; createdAt: string }>('/oscar-predictions', {
        category: categoryToApi[category] ?? category,
        providerExternalId: tmdbId,
        name: title,
        imagePath: posterPath,
      });
      return {
        id: res.data.id,
        user_id: userId,
        category: categoryFromApi[res.data.category] ?? res.data.category,
        tmdb_id: res.data.providerExternalId,
        title: res.data.name,
        poster_path: res.data.imagePath ?? '',
        created_at: res.data.createdAt,
      };
    },
    () => localData.saveOscarPrediction(userId, category, tmdbId, title, posterPath),
  );
}

export async function getAnticipatedMovies(): Promise<AnticipatedMovie[]> {
  return withFallback(
    async () => {
      const res = await apiClient.get<{ title: string; posterPath: string | null; providerExternalId: string; type?: string; mediaType?: string; userCount?: number; userIds?: string[] }[]>('/watchlist/anticipated');
      return res.data.map((e) => ({
        title: e.title,
        coverUrl: e.posterPath,
        tmdbId: e.providerExternalId,
        mediaType: e.mediaType === 'tv' || e.mediaType === 'series' || e.type === 'tv' || e.type === 'series' ? 'tv' as const : e.mediaType === 'movie' || e.type === 'movie' ? 'movie' as const : undefined,
        userCount: e.userCount ?? e.userIds?.length ?? 0,
        userIds: e.userIds ?? [],
      }));
    },
    () => localData.getAnticipatedMovies(),
  );
}

// Data Import (Tv Time) API
// API returns data in camelCase format
export interface DataImport {
  id: string;
  userId?: string;
  platform: string;
  status: 'pending' | 'importing_movies' | 'importing_series' | 'done' | 'failed';
  lastStatus?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  finishedAt?: string | null;
}

export interface ImportError {
  id: string;
  importId?: string;
  rowData?: Record<string, unknown> | null;
  errorMessage: string;
  createdAt: string;
  mediaTitle?: string;
  mediaType?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

export async function uploadTvTimeImport(file: File): Promise<DataImport> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('platform', 'tv_time');

  const response = await apiClient.post<DataImport>('/users/data-imports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // API returns data in camelCase
  return response.data;
}

export async function listUserImports(): Promise<DataImport[]> {
  const response = await apiClient.get<DataImport[]>('/users/data-imports');
  // API returns data in camelCase
  return response.data;
}

export async function getImportStatusById(importId: string): Promise<DataImport> {
  const response = await apiClient.get<DataImport>(`/users/data-imports/${importId}`);
  // API returns data in camelCase
  return response.data;
}

export async function getImportErrors(importId: string): Promise<ImportError[]> {
  const response = await apiClient.get<ImportError[]>(`/users/data-imports/${importId}/errors`);
  // API returns data in camelCase
  return response.data;
}

export async function downloadImportErrorsCSV(importId: string): Promise<void> {
  const response = await apiClient.get(`/users/data-imports/${importId}/errors/export`, {
    responseType: 'blob',
  });

  // Create download link
  const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `erros-importacao-${importId}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

