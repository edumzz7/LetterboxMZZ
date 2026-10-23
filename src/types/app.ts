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
  favorite_movie_2?: string;
  favorite_genre?: string;
  favorite_series?: string;
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
  diretor?: string | null;
  avaliacao?: number | null;
  rating?: number | null;
  review?: string | null;
  streaming_data?: string | null;
  created_at: string;
  is_retroactive?: boolean;
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
  source_movie_id?: string | null;
  indicado_por_user_id?: string | null;
  avaliacao?: number | null;
  rating?: number | null;
  review?: string | null;
  streaming_data?: string | null;
  created_at: string;
  is_retroactive?: boolean;
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

export interface UserFavorite {
  id: string;
  favoriteUserId: string;
  createdAt: string;
  ownerUserId?: string;
}

export type FavoritePersonDepartment = 'Acting' | 'Directing';

export interface UserFavoritePerson {
  id: string;
  tmdbPersonId: number;
  name: string;
  profilePath: string | null;
  department: FavoritePersonDepartment;
  createdAt: string;
}

export type CineMatchMode = 'geral' | 'oscar';

export interface CineMatchSuggestion {
  titulo: string;
  capa_url: string | null;
  origem: CineMatchMode;
  reason: string;
}

export type WatchPartyMediaType = 'movie' | 'series';

export interface WatchParty {
  id: string;
  createdByUserId: string;
  partnerUserId: string;
  mediaType: WatchPartyMediaType;
  providerExternalId: string;
  title: string;
  posterPath: string | null;
  genreId: number | null;
  status: 'planned' | 'completed';
  progressSeason: number | null;
  progressEpisode: number | null;
  creatorPoints: number;
  partnerPoints: number;
  createdAt: string;
  completedAt: string | null;
}

export interface CreateWatchPartyInput {
  partnerUserId: string;
  mediaType: WatchPartyMediaType;
  providerExternalId: string;
  genreId: number | null;
}

export interface TrendingMovie {
  title: string;
  coverUrl: string | null;
  userCount: number;
  lastWatchedAt: string;
  tmdbId?: string | null;
  mediaType?: 'movie' | 'tv';
  userIds: string[];
}

export interface AnticipatedMovie {
  title: string;
  coverUrl: string | null;
  userCount: number;
  tmdbId?: string | null;
  mediaType?: 'movie' | 'tv';
  userIds: string[];
}

export interface UserOscarPrediction {
  id: string;
  user_id: string;
  category: string;
  tmdb_id: string;
  title: string;
  poster_path: string;
  created_at: string;
}

export type GroupMemberRole = 'admin' | 'member';
export type GroupViewerStatus = 'admin' | 'member' | 'invited' | 'requested' | 'none';

export interface GroupProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarPath: string | null;
}

export interface GroupSummary {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  maxMembers: number;
  isFull: boolean;
  createdAt: string;
}

export interface MyGroup extends GroupSummary {
  role: GroupMemberRole;
  joinedAt: string;
}

export interface GroupInvite {
  requestId: string;
  groupId: string;
  groupName: string;
  link: string;
  createdAt: string;
}

export interface MyGroupsResponse {
  limit: number;
  groups: MyGroup[];
  invites: GroupInvite[];
}

export interface GroupSearchResponse {
  items: GroupSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GroupMemberView extends GroupProfile {
  role: GroupMemberRole;
  joinedAt: string;
}

export interface GroupViewer {
  status: GroupViewerStatus;
  joinedAt?: string;
  requestId?: string | null;
  cooldownUntil?: string | null;
  reachedGroupLimit?: boolean;
  canRequest?: boolean;
}

export interface GroupDetails extends GroupSummary {
  admin: GroupProfile | null;
  viewer: GroupViewer;
  members?: GroupMemberView[];
}

export interface GroupRankingItem extends GroupProfile {
  rank: number;
  totalPoints: number;
  role: GroupMemberRole;
}

export interface GroupRanking {
  groupId: string;
  periodStart: string;
  periodEnd: string;
  items: GroupRankingItem[];
}

export interface GroupPendingItem {
  id: string;
  user: GroupProfile;
  createdAt: string;
}

export interface GroupPendingRequests {
  invites: GroupPendingItem[];
  requests: GroupPendingItem[];
}

export type GroupRequestAction = 'accept' | 'decline' | 'cancel';

export type SpecialNotificationType =
  | 'group_invite'
  | 'group_join_request'
  | 'group_request_accepted'
  | 'group_invite_accepted'
  | 'group_admin_transferred';

export interface SpecialNotification {
  id: string;
  type: SpecialNotificationType;
  message: string;
  link: string | null;
  referenceId: string | null;
  actorId: string | null;
  metadata: { actorUsername?: string; groupName?: string };
  readAt: string | null;
  createdAt: string;
}

export interface SpecialNotificationsResponse {
  items: SpecialNotification[];
  unreadCount: number;
}
