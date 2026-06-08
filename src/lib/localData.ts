import { hashPassword, normalizeUsername } from './auth';
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
  SessionUser,
} from '../types/app';

const KEYS = {
  users: 'letterboxmzz_local_users_v1',
  session: 'letterboxmzz_local_session_v1',
  oscarMovies: 'letterboxmzz_local_oscar_movies_v1',
  oscarStatuses: 'letterboxmzz_local_oscar_statuses_v1',
  personalMovies: 'letterboxmzz_local_personal_movies_v1',
  series: 'letterboxmzz_local_series_v1',
  activities: 'letterboxmzz_local_activities_v1',
};
const LEGACY_IMPORT_PREFIX = 'letterboxmzz_legacy_imported_v1_';

type StoredUser = AppUser & {
  password_hash: string;
  mcoins: number;
  avatar_id: string;
  display_name?: string;
  favorite_movie?: string;
  favorite_genre?: string;
  watch_preference?: 'home' | 'cinema';
};

type StoredOscarStatus = {
  id: string;
  user_id: string;
  oscar_movie_id: string;
  status: MovieStatus;
  updated_at: string;
};

function nowIso() {
  return new Date().toISOString();
}

function randomId() {
  return crypto.randomUUID();
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readUsers() {
  return readJson<StoredUser[]>(KEYS.users, []);
}

function writeUsers(users: StoredUser[]) {
  writeJson(KEYS.users, users);
}

function readOscarMovies() {
  return readJson<OscarMovie[]>(KEYS.oscarMovies, []);
}

function writeOscarMovies(movies: OscarMovie[]) {
  writeJson(KEYS.oscarMovies, movies);
}

function readOscarStatuses() {
  return readJson<StoredOscarStatus[]>(KEYS.oscarStatuses, []);
}

function writeOscarStatuses(items: StoredOscarStatus[]) {
  writeJson(KEYS.oscarStatuses, items);
}

function readPersonalMovies() {
  return readJson<PersonalMovie[]>(KEYS.personalMovies, []);
}

function writePersonalMovies(movies: PersonalMovie[]) {
  writeJson(KEYS.personalMovies, movies);
}

function readSeries() {
  return readJson<SeriesEntry[]>(KEYS.series, []);
}

function writeSeries(items: SeriesEntry[]) {
  writeJson(KEYS.series, items);
}

function readActivitiesStore() {
  return readJson<ActivityEntry[]>(KEYS.activities, []);
}

function writeActivitiesStore(items: ActivityEntry[]) {
  writeJson(KEYS.activities, items);
}

function readSessionUserId() {
  return localStorage.getItem(KEYS.session);
}

function writeSessionUserId(userId: string | null) {
  if (!userId) {
    localStorage.removeItem(KEYS.session);
    return;
  }
  localStorage.setItem(KEYS.session, userId);
}

function titleKey(title: string) {
  return title.trim().toLowerCase();
}

function addActivity(user_id: string, message: string, mcoins_delta = 0) {
  const items = readActivitiesStore();
  items.unshift({
    id: randomId(),
    user_id,
    message,
    mcoins_delta,
    created_at: nowIso(),
  });
  writeActivitiesStore(items);
}

function updateUserMcoins(userId: string, delta: number) {
  if (!delta) return;
  const users = readUsers();
  const next = users.map((user) =>
    user.id === userId ? { ...user, mcoins: Math.max(0, user.mcoins + delta) } : user,
  );
  writeUsers(next);
}

function ensureOscarCatalog() {
  const current = readOscarMovies();
  if (current.length > 0) return current;

  const seeded = DEFAULT_OSCAR_MOVIES.map((movie) => ({
    id: randomId(),
    titulo: movie.titulo,
    ano_oscar: movie.ano_oscar,
    categoria_principal: movie.categoria_principal,
    capa_url: movie.capa_url,
    plataforma_slug: movie.plataforma_slug,
    rating: movie.rating ?? null,
    streaming_data: movie.streaming_data ?? null,
  }));
  writeOscarMovies(seeded);
  return seeded;
}

function fallbackAvatar(userId: string) {
  const options = ['avatar_clapper', 'avatar_popcorn', 'avatar_projector', 'avatar_girl', 'avatar_robot'];
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash + userId.charCodeAt(index) * (index + 1)) % options.length;
  }
  return options[hash];
}

function requireSession(expectedUserId?: string) {
  const current = getCurrentSessionUserSync();
  if (!current) throw new Error('Sessao invalida.');
  if (expectedUserId && current.id !== expectedUserId) {
    throw new Error('Operacao permitida apenas para o dono do registro.');
  }
  return current;
}

function getCurrentSessionUserSync(): SessionUser | null {
  const userId = readSessionUserId();
  if (!userId) return null;
  const user = readUsers().find((item) => item.id === userId);
  return user ? { id: user.id, username: user.username } : null;
}

export async function bootstrapApp() {
  ensureOscarCatalog();
}

export async function importLegacyDataForUser(userId: string) {
  const importKey = `${LEGACY_IMPORT_PREFIX}${userId}`;
  if (localStorage.getItem(importKey) === '1') return false;

  const rawMovies = localStorage.getItem('cinehub_movies');
  const rawSeries = localStorage.getItem('cinehub_series');
  if (!rawMovies && !rawSeries) return false;

  const { personalMovies, oscarStatuses } = readLegacyMovieData();
  const legacySeries = readLegacySeriesData(false);

  let changed = false;

  const existingPersonal = readPersonalMovies();
  if (existingPersonal.filter((item) => item.user_id === userId).length === 0 && personalMovies.length > 0) {
    existingPersonal.push(
      ...personalMovies.map((movie) => ({
        ...movie,
        id: randomId(),
        user_id: userId,
        created_at: nowIso(),
      })),
    );
    writePersonalMovies(existingPersonal);
    changed = true;
  }

  const existingSeries = readSeries();
  if (existingSeries.filter((item) => item.user_id === userId).length === 0 && legacySeries.length > 0) {
    existingSeries.push(
      ...legacySeries.map((series) => ({
        ...series,
        id: randomId(),
        user_id: userId,
        created_at: nowIso(),
      })),
    );
    writeSeries(existingSeries);
    changed = true;
  }

  if (oscarStatuses.size > 0) {
    const statuses = readOscarStatuses();
    const existingStatusIds = new Set(statuses.filter((item) => item.user_id === userId).map((item) => item.oscar_movie_id));
    for (const movie of ensureOscarCatalog()) {
      const status = oscarStatuses.get(titleKey(movie.titulo));
      if (!status || existingStatusIds.has(movie.id)) continue;
      statuses.push({
        id: randomId(),
        user_id: userId,
        oscar_movie_id: movie.id,
        status,
        updated_at: nowIso(),
      });
      changed = true;
    }
    writeOscarStatuses(statuses);
  }

  if (changed) {
    addActivity(userId, 'dados legados foram importados para este perfil.', 0);
  }

  localStorage.setItem(importKey, '1');
  return changed;
}

export async function loginUser(username: string, password: string) {
  const normalized = normalizeUsername(username);
  const password_hash = await hashPassword(password);
  const user = readUsers().find(
    (item) => item.username === normalized && item.password_hash === password_hash,
  );
  if (!user) throw new Error('Usuario ou senha invalidos.');
  writeSessionUserId(user.id);
  return { id: user.id, username: user.username };
}

export async function registerUser(username: string, password: string) {
  const normalized = normalizeUsername(username);
  const users = readUsers();
  if (users.some((item) => item.username === normalized)) {
    throw new Error('Esse username ja esta em uso.');
  }

  const user: StoredUser = {
    id: randomId(),
    username: normalized,
    password_hash: await hashPassword(password),
    created_at: nowIso(),
    mcoins: 0,
    avatar_id: fallbackAvatar(normalized),
  };
  users.push(user);
  writeUsers(users);
  writeSessionUserId(user.id);
  addActivity(user.id, `${user.username} entrou no LetterboxZZO.`, 0);
  return { id: user.id, username: user.username };
}

export async function listUsers() {
  return readUsers()
    .slice()
    .sort((a, b) => a.username.localeCompare(b.username))
    .map((item) => ({
      id: item.id,
      username: item.username,
      created_at: item.created_at,
    }));
}

export async function listRankedUsers() {
  return readUsers()
    .slice()
    .sort((a, b) => b.mcoins - a.mcoins || a.username.localeCompare(b.username))
    .map((item, index) => ({
      id: item.id,
      username: item.username,
      created_at: item.created_at,
      user_id: item.id,
      mcoins: item.mcoins,
      avatar_id: item.avatar_id,
      display_name: item.display_name,
      favorite_movie: item.favorite_movie,
      favorite_genre: item.favorite_genre,
      watch_preference: item.watch_preference,
      rank: index + 1,
    })) as RankedUser[];
}

export async function listActivities(limit = 30) {
  return readActivitiesStore().slice(0, limit);
}

export async function listNotifications(userId: string, limit = 20) {
  return readActivitiesStore()
    .filter((item) => item.user_id === userId)
    .filter((item) => {
      const normalized = item.message.toLowerCase();
      return normalized.includes('para voce') || normalized.includes('ao seu filme');
    })
    .slice(0, limit);
}

export async function listUserActivity(userId: string, limit = 20) {
  return readActivitiesStore()
    .filter((item) => item.user_id === userId)
    .filter((item) => {
      const normalized = item.message.toLowerCase();
      return !normalized.includes('para voce') && !normalized.includes('ao seu filme');
    })
    .slice(0, limit);
}

export async function getCurrentSessionUser() {
  return getCurrentSessionUserSync();
}

export async function logoutUser() {
  writeSessionUserId(null);
}

export async function updateUserAvatar(userId: string, avatarId: string) {
  requireSession(userId);
  const users = readUsers();
  writeUsers(users.map((user) => (user.id === userId ? { ...user, avatar_id: avatarId } : user)));
}

export async function updateUserProfile(
  userId: string,
  data: {
    display_name?: string;
    favorite_movie?: string;
    favorite_genre?: string;
    watch_preference?: 'home' | 'cinema';
  }
) {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error('Usuario nao encontrado.');

  users[index] = { ...users[index], ...data };
  writeUsers(users);
}

export async function getOscarMoviesForUser(userId: string) {
  const statuses = new Map(
    readOscarStatuses()
      .filter((item) => item.user_id === userId)
      .map((item) => [item.oscar_movie_id, item.status]),
  );
  return ensureOscarCatalog().map((movie) => ({
    ...movie,
    status: statuses.get(movie.id) ?? 'watchlist',
  })) as OscarMovieWithStatus[];
}

export async function addOscarMovie(userId: string, movie: Omit<OscarMovie, 'id'>) {
  requireSession(userId);
  const oscarMovies = readOscarMovies();
  const created: OscarMovie = { ...movie, id: randomId() };
  oscarMovies.push(created);
  writeOscarMovies(oscarMovies);
  updateUserMcoins(userId, 5);
  addActivity(userId, `${getCurrentSessionUserSync()?.username ?? 'Usuario'} indicou ${movie.titulo} para a lista.`, 5);
  return created;
}

export async function setOscarMovieStatus(userId: string, movie: OscarMovie, status: MovieStatus) {
  requireSession(userId);
  const items = readOscarStatuses();
  const existing = items.find((item) => item.user_id === userId && item.oscar_movie_id === movie.id);
  const previousStatus = existing?.status;

  if (existing) {
    existing.status = status;
    existing.updated_at = nowIso();
  } else {
    items.push({
      id: randomId(),
      user_id: userId,
      oscar_movie_id: movie.id,
      status,
      updated_at: nowIso(),
    });
  }
  writeOscarStatuses(items);

  const personalMovies = readPersonalMovies();
  const existingPersonal = personalMovies.find(
    (item) => item.user_id === userId && item.source === 'oscar' && item.source_movie_id === movie.id,
  );

  if (existingPersonal) {
    existingPersonal.status = status;
    existingPersonal.plataforma_slug = movie.plataforma_slug;
  } else {
    personalMovies.push({
      id: randomId(),
      user_id: userId,
      titulo: movie.titulo,
      ano_lancamento: movie.ano_oscar,
      capa_url: movie.capa_url,
      plataforma_slug: movie.plataforma_slug,
      status,
      source: 'oscar',
      source_movie_id: movie.id,
      created_at: nowIso(),
    });
  }
  writePersonalMovies(personalMovies);

  if (status === 'watched' && previousStatus !== 'watched') {
    updateUserMcoins(userId, 30);
    addActivity(userId, `assistiu ao filme ${movie.titulo}.`, 30);
  }
}

export async function listPersonalMovies(userId: string) {
  return readPersonalMovies()
    .filter((movie) => movie.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function addPersonalMovie(
  userId: string,
  movie: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'>,
) {
  requireSession(userId);
  const items = readPersonalMovies();
  if (items.some((item) => item.user_id === userId && titleKey(item.titulo) === titleKey(movie.titulo))) {
    throw new Error('Esse filme ja esta na sua lista.');
  }
  const created: PersonalMovie = {
    ...movie,
    id: randomId(),
    user_id: userId,
    created_at: nowIso(),
  };
  items.push(created);
  writePersonalMovies(items);
  if (created.status === 'watched') {
    const recommendation = created.source_movie_id?.match(/^tmdb:(\d+)\|rec:([A-Za-z0-9_-]+)$/);
    if (recommendation) {
      updateUserMcoins(created.user_id, 40);
      addActivity(created.user_id, `assistiu ao filme indicado: ${created.titulo}.`, 40);
      updateUserMcoins(recommendation[2], 30);
      addActivity(recommendation[2], `seu filme indicado (${created.titulo}) foi assistido.`, 30);
    } else {
      updateUserMcoins(created.user_id, 30);
      addActivity(created.user_id, `assistiu ao filme ${created.titulo}.`, 30);
    }
  }
  return created;
}

export async function updatePersonalMovie(
  movieId: string,
  updates: Partial<Pick<PersonalMovie, 'status' | 'plataforma_slug' | 'avaliacao'>>,
) {
  const items = readPersonalMovies();
  const index = items.findIndex((item) => item.id === movieId);
  if (index < 0) throw new Error('Filme nao encontrado.');
  requireSession(items[index].user_id);
  const previous = items[index];
  const next = { ...previous, ...updates };
  items[index] = next;
  writePersonalMovies(items);
  if (previous.status !== 'watched' && next.status === 'watched') {
    updateUserMcoins(next.user_id, 30);
    addActivity(next.user_id, `assistiu ao filme ${next.titulo}.`, 30);
  }
  return next;
}

export async function deletePersonalMovie(movieId: string) {
  const items = readPersonalMovies();
  const current = items.find((item) => item.id === movieId);
  if (!current) return;
  requireSession(current.user_id);
  writePersonalMovies(items.filter((item) => item.id !== movieId));
}

export async function listSeries(userId: string) {
  return readSeries()
    .filter((item) => item.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function addSeries(
  userId: string,
  series: Omit<SeriesEntry, 'id' | 'user_id' | 'created_at'>,
) {
  requireSession(userId);
  const items = readSeries();
  if (items.some((item) => item.user_id === userId && titleKey(item.titulo) === titleKey(series.titulo))) {
    throw new Error('Essa serie ja esta cadastrada.');
  }
  const created: SeriesEntry = {
    ...series,
    id: randomId(),
    user_id: userId,
    created_at: nowIso(),
  };
  items.push(created);
  writeSeries(items);
  if (created.status !== 'watchlist') {
    updateUserMcoins(userId, 20);
    addActivity(userId, `iniciou a serie ${series.titulo}.`, 20);
  }
  return created;
}

export async function updateSeries(
  seriesId: string,
  updates: Partial<
    Pick<SeriesEntry, 'status' | 'temporada' | 'total_episodios' | 'episodios_vistos' | 'plataforma_slug' | 'avaliacao'>
  >,
) {
  const items = readSeries();
  const index = items.findIndex((item) => item.id === seriesId);
  if (index < 0) throw new Error('Serie nao encontrada.');
  const current = items[index];
  requireSession(current.user_id);
  const next: SeriesEntry = { ...current, ...updates };
  if (updates.episodios_vistos !== undefined || updates.total_episodios !== undefined) {
    next.status = getSeriesStatus(next.episodios_vistos, next.total_episodios);
  }
  items[index] = next;
  writeSeries(items);
  if (current.status === 'watchlist' && next.status === 'watching') {
    updateUserMcoins(next.user_id, 20);
    addActivity(next.user_id, `iniciou a serie ${next.titulo}.`, 20);
  }
  if (current.status !== 'watched' && next.status === 'watched') {
    updateUserMcoins(next.user_id, 50);
    addActivity(next.user_id, `finalizou 100% da serie ${next.titulo}.`, 50);
  }
  return next;
}

export async function updateOscarMoviePlatform(movieId: string, platformSlug: string) {
  requireSession();
  const items = readOscarMovies();
  writeOscarMovies(items.map((item) => (item.id === movieId ? { ...item, plataforma_slug: platformSlug } : item)));
}

export async function updateOscarMovieStreaming(movieId: string, streamingData: string) {
  requireSession();
  const items = readOscarMovies();
  writeOscarMovies(items.map((item) => (item.id === movieId ? { ...item, streaming_data: streamingData } : item)));
}

export async function updatePersonalMovieStreaming(movieId: string, streamingData: string) {
  const items = readPersonalMovies();
  const current = items.find((item) => item.id === movieId);
  if (!current) return;
  requireSession(current.user_id);
  writePersonalMovies(items.map((item) => (item.id === movieId ? { ...item, streaming_data: streamingData } : item)));
}

export async function updateSeriesStreaming(seriesId: string, streamingData: string) {
  const items = readSeries();
  const current = items.find((item) => item.id === seriesId);
  if (!current) return;
  requireSession(current.user_id);
  writeSeries(items.map((item) => (item.id === seriesId ? { ...item, streaming_data: streamingData } : item)));
}

export async function suggestMovieToUser(
  fromUserId: string,
  toUserId: string,
  movie: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'>,
  mediaType: 'movie' | 'tv' = 'movie',
) {
  requireSession(fromUserId);
  if (mediaType === 'movie') {
    await addPersonalMovie(toUserId, {
      ...movie,
      source_movie_id: movie.source_movie_id ? `tmdb:${movie.source_movie_id}|rec:${fromUserId}` : null,
    });
  } else {
    await addSeries(toUserId, {
      titulo: movie.titulo,
      capa_url: movie.capa_url,
      status: 'watchlist',
      temporada: 1,
      total_episodios: 1,
      episodios_vistos: 0,
      plataforma_slug: 'stremio',
      streaming_data: movie.streaming_data ?? null,
      rating: movie.rating ?? null,
    });
  }
  updateUserMcoins(fromUserId, 5);
  const actor = readUsers().find((item) => item.id === fromUserId)?.username ?? 'Usuario';
  const target = readUsers().find((item) => item.id === toUserId)?.username ?? 'Usuario';
  const label = mediaType === 'movie' ? 'filme' : 'serie';
  addActivity(toUserId, `@${actor} indicou ${label} ${movie.titulo} para voce.`, 0);
  addActivity(fromUserId, `${actor} indicou ${label} ${movie.titulo} para @${target}.`, 5);
}

export async function reactToMovie(
  actorUserId: string,
  targetUserId: string,
  movieTitle: string,
  reaction: string,
) {
  requireSession(actorUserId);
  const actor = readUsers().find((item) => item.id === actorUserId)?.username ?? 'Usuario';
  addActivity(targetUserId, `${actor} reagiu com ${reaction} ao seu filme ${movieTitle}.`, 0);
}

export async function rateMovie(
  actorUserId: string,
  movieId: string,
  _movieTitle: string,
  stars: number,
  review?: string | null,
) {
  const items = readPersonalMovies();
  const current = items.find((item) => item.id === movieId);
  if (!current) return;
  requireSession(actorUserId);
  if (current.user_id !== actorUserId) {
    throw new Error('Avaliacao permitida apenas para o dono do filme.');
  }
  writePersonalMovies(items.map((item) => (item.id === movieId ? { ...item, rating: stars, review: review ?? null } : item)));
}

export async function rateSeries(
  actorUserId: string,
  seriesId: string,
  stars: number,
  review?: string | null,
) {
  const items = readSeries();
  const current = items.find((item) => item.id === seriesId);
  if (!current) return;
  requireSession(actorUserId);
  if (current.user_id !== actorUserId) {
    throw new Error('Avaliacao permitida apenas para o dono da serie.');
  }
  writeSeries(items.map((item) => (item.id === seriesId ? { ...item, rating: stars, review: review ?? null } : item)));
}

export async function deleteSeries(seriesId: string) {
  const items = readSeries();
  const current = items.find((item) => item.id === seriesId);
  if (!current) return;
  requireSession(current.user_id);
  writeSeries(items.filter((item) => item.id !== seriesId));
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
    const [myOscar, friendOscar, myMovies, friendMovies] = await Promise.all([
      getOscarMoviesForUser(currentUserId),
      getOscarMoviesForUser(friendUserId),
      listPersonalMovies(currentUserId),
      listPersonalMovies(friendUserId),
    ]);

    const pool = [
      ...myOscar.filter((item) => item.status === 'watchlist'),
      ...myMovies.filter((item) => item.status === 'watchlist'),
    ];
    const friendTitles = new Set(
      [...friendOscar.filter((item) => item.status === 'watchlist'), ...friendMovies.filter((item) => item.status === 'watchlist')].map((item) => titleKey(item.titulo)),
    );
    const picked = pickRandom(pool.filter((item) => friendTitles.has(titleKey(item.titulo))));
    if (!picked) return null;
    return {
      titulo: picked.titulo,
      capa_url: picked.capa_url,
      origem: 'geral',
      reason: 'Watchlist em comum encontrada para os dois.',
    };
  }

  const [allOscar, mine, friend] = await Promise.all([
    getOscarMoviesForUser(currentUserId),
    getOscarMoviesForUser(currentUserId),
    getOscarMoviesForUser(friendUserId),
  ]);
  const watchedByMe = new Set(mine.filter((item) => item.status === 'watched').map((item) => item.id));
  const watchedByFriend = new Set(friend.filter((item) => item.status === 'watched').map((item) => item.id));
  const picked = pickRandom(allOscar.filter((item) => !watchedByMe.has(item.id) && !watchedByFriend.has(item.id)));
  if (!picked) return null;
  return {
    titulo: picked.titulo,
    capa_url: picked.capa_url,
    origem: 'oscar',
    reason: 'Oscar pendente para os dois usuarios.',
  };
}

export function getSeriesStatus(episodiosVistos: number, totalEpisodios: number): SeriesStatus {
  if (episodiosVistos <= 0) return 'watchlist';
  return totalEpisodios > 0 && episodiosVistos >= totalEpisodios ? 'watched' : 'watching';
}

export async function getTrendingMovies(): Promise<Array<{ title: string; coverUrl: string | null; userCount: number; lastWatchedAt: string }>> {
  const movies = readPersonalMovies();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoMs = thirtyDaysAgo.getTime();

  const watchedInLast30 = movies.filter(
    (m) =>
      m.status === 'watched' &&
      new Date(m.created_at).getTime() >= thirtyDaysAgoMs
  );

  const watcherSets = new Map<string, { title: string; coverUrl: string | null; watchers: Set<string>; lastWatchedAt: string }>();

  for (const m of watchedInLast30) {
    const key = m.source_movie_id || m.titulo.toLowerCase().trim();
    let group = watcherSets.get(key);
    if (!group) {
      group = {
        title: m.titulo,
        coverUrl: m.capa_url,
        watchers: new Set<string>(),
        lastWatchedAt: m.created_at,
      };
      watcherSets.set(key, group);
    }
    group.watchers.add(m.user_id);
    if (m.created_at > group.lastWatchedAt) {
      group.lastWatchedAt = m.created_at;
    }
  }

  const grouped = Array.from(watcherSets.values()).map((g) => ({
    title: g.title,
    coverUrl: g.coverUrl,
    userCount: g.watchers.size,
    lastWatchedAt: g.lastWatchedAt,
  }));

  grouped.sort((a, b) => {
    if (b.userCount !== a.userCount) {
      return b.userCount - a.userCount;
    }
    return new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime();
  });

  return grouped.slice(0, 5);
}
