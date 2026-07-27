import { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { Star, Flame, ChevronDown, ChevronUp, Loader2, Film, Plus, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import type { PersonalMovie, RankedUser, SeriesEntry, TrendingMovie, AnticipatedMovie } from '../../types/app';
import AvatarDisplay from './AvatarDisplay';
import { useFavorites } from '../../hooks/useFavorites';
import { usePersonalMovieMutations, usePersonalMoviesQuery } from '../../hooks/usePersonalMovies';
import { useSeriesMutations, useSeriesQuery } from '../../hooks/useSeries';
import { getTrendingMovies, getAnticipatedMovies } from '../../lib/appData';
import {
  getMediaDetailsMatchingTitle,
  getMovieDetailsWithFallback,
  getMovieRecommendations,
  getMovieSimilar,
  getTvDetailsRawWithFallback,
  getTvRecommendations,
  getTvSimilar,
  searchMulti,
} from '../../lib/tmdb';
import type { TMDBRecommendationItem } from '../../lib/tmdb';
import { generateImagePath } from '../../lib/imageUtils';

export const RECOMMENDATIONS_STORAGE_KEY_PREFIX = 'cinerats_recommendations_v4_';

type RecommendationType = 'movie' | 'tv';
type RecommendationItem = { tmdbId: number; title: string; coverUrl: string | null; type: RecommendationType };
type RecommendationLists = { movies: Array<RecommendationItem & { type: 'movie' }>; series: Array<RecommendationItem & { type: 'tv' }> };
type RecommendationSeed = { id: number; weight: number };

function normalizeTitle(value: string | null | undefined) {
  return (value || '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9à-ÿ]+/gi, ' ').trim();
}

function createSessionVariant() {
  const value = new Uint32Array(1);
  globalThis.crypto?.getRandomValues?.(value);
  return value[0] || Date.now();
}

function entryWeight(entry: PersonalMovie | SeriesEntry) {
  const rating = Number(entry.rating ?? entry.avaliacao ?? 0);
  if (rating > 0 && rating < 3) return 0;
  const statusWeight = entry.status === 'watched' ? 2 : entry.status === 'watching' ? 1.5 : 0.5;
  if (rating >= 4) return statusWeight + 3;
  if (rating >= 3) return statusWeight + 1.5;
  return statusWeight;
}

async function getRecommendationSeeds(entries: Array<PersonalMovie | SeriesEntry>, type: RecommendationType): Promise<RecommendationSeed[]> {
  const candidates = entries
    .map((entry) => ({ entry, weight: entryWeight(entry) }))
    .filter(({ weight }) => weight > 0)
    .sort((a, b) => b.weight - a.weight || b.entry.created_at.localeCompare(a.entry.created_at))
    .slice(0, 6);

  const resolved = await Promise.all(candidates.map(async ({ entry, weight }) => {
    const storedId = Number(entry.source_movie_id);
    if (Number.isFinite(storedId) && storedId > 0) return { id: storedId, weight };
    const result = (await searchMulti(entry.titulo)).find((item) => item.media_type === type);
    return result ? { id: result.id, weight } : null;
  }));

  return resolved.filter((seed): seed is RecommendationSeed => Boolean(seed));
}

async function buildRecommendations(
  entries: Array<PersonalMovie | SeriesEntry>,
  type: RecommendationType,
  sessionVariant: number,
): Promise<RecommendationItem[]> {
  const seeds = await getRecommendationSeeds(entries, type);
  if (!seeds.length) return [];

  const knownIds = new Set(entries.map((entry) => Number(entry.source_movie_id)).filter((id) => Number.isFinite(id) && id > 0));
  const knownTitles = new Set(entries.map((entry) => normalizeTitle(entry.titulo)));
  const scored = new Map<number, { item: TMDBRecommendationItem; score: number; seedIds: Set<number>; directHits: number }>();
  const minimumVotes = type === 'movie' ? 150 : 75;

  const add = (item: TMDBRecommendationItem, seed: RecommendationSeed, relation: 'recommendation' | 'similar') => {
    const title = item.title || item.name || '';
    if (!item.id || !title || !item.poster_path || item.adult || knownIds.has(item.id) || knownTitles.has(normalizeTitle(title))) return;
    const votes = Number(item.vote_count ?? 0);
    const average = Number(item.vote_average ?? 0);
    if (votes < minimumVotes || average < 6) return;

    const current = scored.get(item.id) ?? { item, score: 0, seedIds: new Set<number>(), directHits: 0 };
    current.item = item;
    current.score += seed.weight * (relation === 'recommendation' ? 1 : 0.25) + Math.min(2, average / 5) + Math.min(1.5, Math.log10(votes + 1) / 3);
    current.seedIds.add(seed.id);
    if (relation === 'recommendation') current.directHits += 1;
    scored.set(item.id, current);
  };

  const directLists = await Promise.all(seeds.map(async (seed) => ({
    seed,
    items: type === 'movie' ? await getMovieRecommendations(seed.id) : await getTvRecommendations(seed.id),
  })));
  directLists.forEach(({ seed, items }) => items.forEach((item) => add(item, seed, 'recommendation')));

  // "Similar" só complementa uma lista pobre; recomendações diretas são a fonte principal.
  if (scored.size < 3) {
    const similarLists = await Promise.all(seeds.map(async (seed) => ({
      seed,
      items: type === 'movie' ? await getMovieSimilar(seed.id) : await getTvSimilar(seed.id),
    })));
    similarLists.forEach(({ seed, items }) => items.forEach((item) => add(item, seed, 'similar')));
  }

  const ranked = Array.from(scored.values())
    .map((candidate) => ({ ...candidate, score: candidate.score + Math.max(0, candidate.seedIds.size - 1) * 3 }))
    .sort((a, b) => b.directHits - a.directHits || b.score - a.score || b.item.id - a.item.id);
  const best = ranked[0];
  const rotationPool = best
    ? ranked.filter((candidate) => candidate.directHits === best.directHits && candidate.score >= best.score * 0.72).slice(0, 8)
    : [];
  const selected = rotationPool.length > 3
    ? Array.from({ length: 3 }, (_, index) => rotationPool[(sessionVariant + index) % rotationPool.length])
    : ranked.slice(0, 3);

  return selected
    .map(({ item }) => ({
      tmdbId: item.id,
      title: (item.title || item.name) as string,
      coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      type,
    }));
}

function SidebarRecommendationItem({ 
  item, 
  currentUserId 
}: { 
  item: { tmdbId: number; title: string; coverUrl: string | null; type: 'movie' | 'tv' }; 
  currentUserId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [, setLocation] = useLocation();
  const { addMovieMutation } = usePersonalMovieMutations(currentUserId);
  const { addSeriesMutation } = useSeriesMutations(currentUserId);
  const [addedToWatchlist, setAddedToWatchlist] = useState(false);

  const { data: details, isLoading } = useQuery({
    queryKey: ['rec-details', item.type, item.tmdbId],
    queryFn: () => item.type === 'movie'
      ? getMovieDetailsWithFallback(item.tmdbId)
      : getTvDetailsRawWithFallback(item.tmdbId),
    enabled: expanded && !!item.tmdbId,
  });

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (addedToWatchlist) return;

    if (item.type === 'movie') {
      addMovieMutation.mutate({
        titulo: item.title,
        capa_url: item.coverUrl,
        source_movie_id: String(item.tmdbId),
        status: 'watchlist',
        plataforma_slug: null,
        ano_lancamento: details?.release_date ? parseInt(details.release_date.split('-')[0], 10) : null,
        source: 'manual',
      });
    } else {
      addSeriesMutation.mutate({
        titulo: item.title,
        capa_url: item.coverUrl,
        source_movie_id: String(item.tmdbId),
        status: 'watchlist',
        temporada: 1,
        total_episodios: details?.number_of_episodes || 0,
        episodios_vistos: 0,
        plataforma_slug: null,
      });
    }
    setAddedToWatchlist(true);
  };

  const handleOpenDetails = () => {
    setExpanded(false);
    setLocation(item.type === 'movie' ? `/filme/${item.tmdbId}` : `/serie/${item.tmdbId}`);
  };

  return (
    <Dialog.Root open={expanded} onOpenChange={setExpanded}>
      <Dialog.Trigger asChild>
        <div className="flex flex-col gap-2 bg-black/15 border border-[#171717] hover:border-[#333] transition-all rounded-xl p-2 cursor-pointer group">
          <div className="flex items-center gap-2.5">
            {/* Tiny Cover */}
            <div className="w-8 aspect-[2/3] rounded-md overflow-hidden border border-[#222] shrink-0 bg-brand-card">
              {item.coverUrl ? (
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={12} className="text-[#333]" />
                </div>
              )}
            </div>
            {/* Details */}
            <div className="flex flex-col min-w-0 flex-1 relative">
              <span
                className="text-xs font-light text-brand-text truncate leading-tight pr-6"
                title={item.title}
              >
                {item.title}
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[9px] uppercase tracking-wider text-brand-gold-alt font-light">
                  Recomendado
                </span>
                <button 
                  onClick={handleAddToWatchlist}
                  disabled={addedToWatchlist || addMovieMutation.isPending || addSeriesMutation.isPending}
                  className="text-brand-gold-alt hover:text-brand-gold hover:scale-125 hover:bg-white/10 p-1 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Adicionar à watchlist"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[70] w-[90vw] max-w-sm translate-x-[-50%] translate-y-[-50%] border border-[#222] bg-[#111] p-5 shadow-2xl rounded-xl">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleOpenDetails}
              className="w-24 aspect-[2/3] shrink-0 rounded overflow-hidden border border-[#222] bg-black cursor-pointer transition-colors hover:border-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              aria-label={`Abrir página de ${item.title}`}
            >
              {item.coverUrl ? (
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={24} className="text-[#333]" />
                </div>
              )}
            </button>
            <div className="flex flex-col flex-1">
              <Dialog.Title className="text-lg font-medium text-brand-text mb-1 leading-tight">
                <button
                  type="button"
                  onClick={handleOpenDetails}
                  className="text-left cursor-pointer transition-colors hover:text-brand-gold focus:outline-none focus-visible:text-brand-gold"
                >
                  {item.title}
                </button>
              </Dialog.Title>
              <span className="text-[10px] uppercase tracking-wider text-brand-gold-alt mb-3 block">
                {item.type === 'movie' ? 'Filme Recomendado' : 'Série Recomendada'}
              </span>
              <button
                onClick={handleAddToWatchlist}
                disabled={addedToWatchlist || addMovieMutation.isPending || addSeriesMutation.isPending}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-black transition-colors rounded-lg text-xs font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} /> 
                {addedToWatchlist ? 'Adicionado' : 'Watchlist'}
              </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#222]">
            <h4 className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-2">Sinopse</h4>
            <div className="text-sm font-light text-brand-text/90 leading-relaxed max-h-[40vh] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-brand-gold" /></div>
              ) : details?.overview ? (
                <p>{details.overview}</p>
              ) : (
                <p className="italic text-brand-text-muted">Sinopse não disponível no momento.</p>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SidebarMovieItem({ 
  movie, 
  currentUserId,
  allUsers,
  interestLabel = false
}: { 
  movie: TrendingMovie | AnticipatedMovie; 
  currentUserId: string;
  allUsers: RankedUser[];
  interestLabel?: boolean;
}) {
  const userCountLabel = interestLabel
    ? movie.userCount === 1 ? 'quer ver' : 'querem ver'
    : movie.userCount === 1 ? 'visto' : 'vistos';
  const usersDialogTitle = interestLabel
    ? 'Usuários que querem ver'
    : 'Usuários que registraram';
  const [expanded, setExpanded] = useState(false);
  const [showWatchers, setShowWatchers] = useState(false);
  const [, setLocation] = useLocation();
  const { addMovieMutation } = usePersonalMovieMutations(currentUserId);
  const { addSeriesMutation } = useSeriesMutations(currentUserId);
  const [addedToWatchlist, setAddedToWatchlist] = useState(false);

  const { data: details, isLoading } = useQuery({
    queryKey: ['media-details', movie.mediaType, movie.tmdbId, movie.title],
    queryFn: async () => {
      if (!movie.tmdbId) return null;
      if (movie.mediaType === 'movie') {
        const details = await getMovieDetailsWithFallback(movie.tmdbId);
        return details ? { ...details, media_type: 'movie' as const } : null;
      }
      if (movie.mediaType === 'tv') {
        const details = await getTvDetailsRawWithFallback(Number(movie.tmdbId));
        return details ? { ...details, media_type: 'tv' as const } : null;
      }
      return getMediaDetailsMatchingTitle(movie.tmdbId, movie.title);
    },
    enabled: expanded && !!movie.tmdbId,
  });

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (addedToWatchlist) return;
    if (details?.media_type === 'tv') {
      addSeriesMutation.mutate({
        titulo: movie.title,
        capa_url: movie.coverUrl || null,
        source_movie_id: movie.tmdbId || null,
        status: 'watchlist',
        temporada: 1,
        total_episodios: details.number_of_episodes || 0,
        episodios_vistos: 0,
        plataforma_slug: null,
      });
    } else {
      addMovieMutation.mutate({
      titulo: movie.title,
      capa_url: movie.coverUrl || null,
      source_movie_id: movie.tmdbId || null,
      status: 'watchlist',
      plataforma_slug: null,
      ano_lancamento: details?.release_date ? Number(details.release_date.slice(0, 4)) : null,
      source: 'manual',
      });
    }
    setAddedToWatchlist(true);
  };

  const handleOpenDetails = () => {
    if (!movie.tmdbId) return;
    setExpanded(false);
    setShowWatchers(false);
    const isSeries = movie.mediaType === 'tv' || details?.media_type === 'tv';
    setLocation(isSeries ? `/serie/${movie.tmdbId}` : `/filme/${movie.tmdbId}`);
  };

  return (
    <Dialog.Root open={expanded} onOpenChange={setExpanded}>
      <Dialog.Trigger asChild>
        <div className="flex flex-col gap-2 bg-black/15 border border-[#171717] hover:border-[#333] transition-all rounded-xl p-2 cursor-pointer group">
          <div className="flex items-center gap-2.5">
            {/* Tiny Cover */}
            <div className="w-8 aspect-[2/3] rounded-md overflow-hidden border border-[#222] shrink-0 bg-brand-card">
              {movie.coverUrl ? (
                <img
                  src={generateImagePath(movie.title, movie.coverUrl)}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={12} className="text-[#333]" />
                </div>
              )}
            </div>
            {/* Details */}
            <div className="flex flex-col min-w-0 flex-1 relative">
              <span
                className="text-xs font-light text-brand-text truncate leading-tight pr-6"
                title={movie.title}
              >
                {movie.title}
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[9px] uppercase tracking-wider text-brand-gold-alt font-light">
              {movie.userCount} {userCountLabel}
                </span>
                <button 
                  onClick={handleAddToWatchlist}
                  disabled={addedToWatchlist || addMovieMutation.isPending || addSeriesMutation.isPending}
                  className="text-brand-gold-alt hover:text-brand-gold hover:scale-125 hover:bg-white/10 p-1 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Adicionar à watchlist"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[70] w-[90vw] max-w-sm translate-x-[-50%] translate-y-[-50%] border border-[#222] bg-[#111] p-5 shadow-2xl rounded-xl">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleOpenDetails}
              disabled={!movie.tmdbId}
              className="w-24 aspect-[2/3] shrink-0 rounded overflow-hidden border border-[#222] bg-black cursor-pointer transition-colors hover:border-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold disabled:cursor-default disabled:hover:border-[#222]"
              aria-label={`Abrir página de ${movie.title}`}
            >
              {movie.coverUrl ? (
                <img
                  src={generateImagePath(movie.title, movie.coverUrl)}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={24} className="text-[#333]" />
                </div>
              )}
            </button>
            <div className="flex flex-col flex-1">
              <Dialog.Title className="text-lg font-medium text-brand-text mb-1 leading-tight">
                <button
                  type="button"
                  onClick={handleOpenDetails}
                  disabled={!movie.tmdbId}
                  className="text-left cursor-pointer transition-colors hover:text-brand-gold focus:outline-none focus-visible:text-brand-gold disabled:cursor-default disabled:hover:text-brand-text"
                >
                  {movie.title}
                </button>
              </Dialog.Title>
              <button 
                onClick={() => setShowWatchers(true)}
                className="text-xs uppercase tracking-wider text-brand-gold-alt mb-3 hover:underline text-left"
              >
                    {movie.userCount} {userCountLabel}
              </button>
              <button
                onClick={handleAddToWatchlist}
                disabled={addedToWatchlist || addMovieMutation.isPending || addSeriesMutation.isPending}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-black transition-colors rounded-lg text-xs font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} /> 
                {addedToWatchlist ? 'Adicionado' : 'Watchlist'}
              </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#222]">
            <h4 className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-2">Sinopse</h4>
            <div className="text-sm font-light text-brand-text/90 leading-relaxed max-h-[40vh] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-brand-gold" /></div>
              ) : details?.overview ? (
                <p>{details.overview}</p>
              ) : (
                <p className="italic text-brand-text-muted">Sinopse não disponível no momento.</p>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <Dialog.Root open={showWatchers} onOpenChange={setShowWatchers}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-[90] w-[90vw] max-w-sm translate-x-[-50%] translate-y-[-50%] border border-[#222] bg-[#111] p-5 shadow-2xl rounded-xl">
            <Dialog.Title className="text-sm font-medium text-brand-text mb-4 uppercase tracking-widest text-center">
                  {usersDialogTitle}
            </Dialog.Title>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {allUsers.filter(u => movie.userIds.includes(u.id)).map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <a href={`/${user.username}`} className="shrink-0 transition-transform hover:scale-110 block">
                    <AvatarDisplay avatarId={user.avatar_id} className="w-8 h-8 rounded-full border border-[#222] shadow shadow-black/50 bg-[#111] flex items-center justify-center shrink-0 overflow-hidden" emojiClassName="text-sm" />
                  </a>
                  <a href={`/${user.username}`} className="text-sm font-medium text-brand-text hover:text-brand-gold transition-colors truncate">
                    {user.display_name || user.username}
                  </a>
                </div>
              ))}
              {allUsers.filter(u => movie.userIds.includes(u.id)).length === 0 && (
                <p className="text-xs text-brand-text-muted text-center py-4">Nenhum usuário encontrado.</p>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Dialog.Root>
  );
}

interface UserSidebarProps {
  users: RankedUser[];
  currentUserId: string;
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  section?: 'ranking' | 'discover';
}

export default function UserSidebar({
  users,
  currentUserId,
  selectedUserId,
  onSelectUser,
  isOpen: _isOpen,
  onClose,
  section = 'discover',
}: UserSidebarProps) {
  const [rankingMode, setRankingMode] = useState<'geral' | 'amigos'>('geral');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { isUserFavorited, toggleFavorite } = useFavorites(currentUserId);
  const [isTrendingOpen, setIsTrendingOpen] = useState(false);
  const [isAnticipatedOpen, setIsAnticipatedOpen] = useState(false);
  const [isRecomendadosOpen, setIsRecomendadosOpen] = useState(false);
  const [recomendadosTab, setRecomendadosTab] = useState<'filmes' | 'series'>('filmes');

  const moviesQuery = usePersonalMoviesQuery(currentUserId);
  const seriesQuery = useSeriesQuery(currentUserId);

  const [recommendations, setRecommendations] = useState<{
    movies: Array<{ tmdbId: number; title: string; coverUrl: string | null; type: 'movie' }>;
    series: Array<{ tmdbId: number; title: string; coverUrl: string | null; type: 'tv' }>;
  } | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const generatedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentUserId) {
      setRecommendations(null);
      generatedForUserRef.current = null;
      return;
    }

    if (moviesQuery.isLoading || seriesQuery.isLoading) return;
    if (generatedForUserRef.current === currentUserId) return;

    const cacheKey = `${RECOMMENDATIONS_STORAGE_KEY_PREFIX}${currentUserId}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setRecommendations(JSON.parse(cached) as RecommendationLists);
        generatedForUserRef.current = currentUserId;
        return;
      }
    } catch {
      sessionStorage.removeItem(cacheKey);
    }

    const generate = async () => {
      setRecLoading(true);
      generatedForUserRef.current = currentUserId;
      try {
        const sessionVariant = createSessionVariant();
        const [movies, series] = await Promise.all([
          buildRecommendations(moviesQuery.data || [], 'movie', sessionVariant),
          buildRecommendations(seriesQuery.data || [], 'tv', sessionVariant + 1),
        ]);
        const next: RecommendationLists = {
          movies: movies.map((item) => ({ ...item, type: 'movie' })),
          series: series.map((item) => ({ ...item, type: 'tv' })),
        };
        setRecommendations(next);
        sessionStorage.setItem(cacheKey, JSON.stringify(next));
        return;
      } catch (error) {
        console.error('Error generating recommendations:', error);
        return;
      } finally {
        setRecLoading(false);
      }

      /* Legacy genre/discover implementation intentionally disabled.
         Recommendations now use the deterministic TMDB relation ranking above.
      try {
        const userMovies = moviesQuery.data || [];
        const userSeries = seriesQuery.data || [];

        const recentTitles = [
          ...userMovies.map(m => m.titulo),
          ...userSeries.map(s => s.titulo)
        ].slice(0, 5);

        let favoriteGenreId = 28; // Action default
        let favoriteDirectorId: number | null = null;

        if (recentTitles.length > 0) {
          const genreCounts: Record<number, number> = {};
          const directorCounts: Record<number, { name: string; count: number }> = {};

          const detailResults = await Promise.all(
            recentTitles.map(async (title) => {
              try {
                const searchRes = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=pt-BR&page=1`);
                if (searchRes.ok) {
                  const sData = await searchRes.json();
                  const first = sData.results?.[0];
                  if (first) {
                    const detailsRes = await fetch(`${TMDB_BASE_URL}/${first.media_type}/${first.id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=pt-BR`);
                    if (detailsRes.ok) {
                      return { details: await detailsRes.json(), type: first.media_type };
                    }
                  }
                }
              } catch (e) {
                console.error(e);
              }
              return null;
            })
          );

          for (const res of detailResults) {
            if (!res) continue;
            const genres = res.details.genres || [];
            for (const g of genres) {
              genreCounts[g.id] = (genreCounts[g.id] || 0) + 1;
            }

            if (res.type === 'movie') {
              const crew = res.details.credits?.crew || [];
              const directors = crew.filter((c: any) => c.job === 'Director');
              for (const d of directors) {
                directorCounts[d.id] = { name: d.name, count: (directorCounts[d.id]?.count || 0) + 1 };
              }
            }
          }

          let maxGenreCount = 0;
          for (const [gId, count] of Object.entries(genreCounts)) {
            if (count > maxGenreCount) {
              maxGenreCount = count;
              favoriteGenreId = Number(gId);
            }
          }

          let maxDirCount = 0;
          for (const [dId, info] of Object.entries(directorCounts)) {
            if (info.count > maxDirCount) {
              maxDirCount = info.count;
              favoriteDirectorId = Number(dId);
            }
          }
        }

        const mapTvGenreToMovie = (gId: number): number => {
          switch (gId) {
            case 10759: // Action & Adventure
              return 28; // Action
            case 10765: // Sci-Fi & Fantasy
              return 878; // Science Fiction
            case 10768: // War & Politics
              return 10752; // War
            case 10762: // Kids
              return 10751; // Family fallback
            case 10763: // News
            case 10764: // Reality
            case 10767: // Talk
              return 99; // Documentary fallback
            case 10766: // Soap
              return 18; // Drama fallback
            default:
              return gId;
          }
        };

        const mapMovieGenreToTv = (gId: number): number => {
          switch (gId) {
            case 28: // Action
            case 12: // Adventure
              return 10759; // Action & Adventure
            case 14: // Fantasy
            case 878: // Science Fiction
              return 10765; // Sci-Fi & Fantasy
            case 53: // Thriller
              return 80; // Crime
            case 27: // Horror
              return 9648; // Mystery fallback
            case 10402: // Music
              return 35; // Comedy fallback
            case 10770: // TV Movie
              return 18; // Drama fallback
            case 36: // History
            case 10752: // War
              return 10768; // War & Politics
            default:
              return gId;
          }
        };

        const movieGenreId = mapTvGenreToMovie(favoriteGenreId);
        const tvGenreId = mapMovieGenreToTv(favoriteGenreId);

        let recommendedMovies: any[] = [];
        
        const genreMoviesRes = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${movieGenreId}&language=pt-BR&sort_by=popularity.desc`);
        if (genreMoviesRes.ok) {
          const gData = await genreMoviesRes.json();
          let candidates = gData.results || [];
          candidates = candidates.filter((c: any) => {
            const candidateTitle = (c.title || '').toLowerCase().trim();
            return !userMovies.some((m) => (m.titulo || '').toLowerCase().trim() === candidateTitle);
          });
          candidates.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0) || b.id - a.id);
          recommendedMovies = candidates.slice(0, 2);
        }

        let directorMoviePicked = false;
        if (favoriteDirectorId) {
          const dirMoviesRes = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_people=${favoriteDirectorId}&language=pt-BR&sort_by=popularity.desc`);
          if (dirMoviesRes.ok) {
            const dData = await dirMoviesRes.json();
            let candidates = dData.results || [];
            candidates = candidates.filter((c: any) => {
              const candidateTitle = (c.title || '').toLowerCase().trim();
              return !userMovies.some((m) => (m.titulo || '').toLowerCase().trim() === candidateTitle);
            });
            candidates.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0) || b.id - a.id);
            if (candidates.length > 0) {
              recommendedMovies.push(candidates[0]);
              directorMoviePicked = true;
            }
          }
        }

        if (!directorMoviePicked) {
          const genreMoviesRes = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${movieGenreId}&language=pt-BR&sort_by=popularity.desc`);
          if (genreMoviesRes.ok) {
            const gData = await genreMoviesRes.json();
            let candidates = gData.results || [];
            candidates = candidates.filter((c: any) => {
              const candidateTitle = (c.title || '').toLowerCase().trim();
              return (
                !userMovies.some((m) => (m.titulo || '').toLowerCase().trim() === candidateTitle) &&
                !recommendedMovies.some((rm) => rm.id === c.id)
              );
            });
            candidates.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0) || b.id - a.id);
            if (candidates.length > 0) {
              recommendedMovies.push(candidates[0]);
            }
          }
        }

        let recommendedSeries: any[] = [];
        const genreSeriesRes = await fetch(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${tvGenreId}&language=pt-BR&sort_by=popularity.desc`);
        if (genreSeriesRes.ok) {
          const sData = await genreSeriesRes.json();
          let candidates = sData.results || [];
          candidates = candidates.filter((c: any) => {
            const candidateName = (c.name || '').toLowerCase().trim();
            return !userSeries.some((s) => (s.titulo || '').toLowerCase().trim() === candidateName);
          });
          candidates.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0) || b.id - a.id);
          recommendedSeries = candidates.slice(0, 3);
        }

        const finalMovies = recommendedMovies.slice(0, 3).map((m: any) => ({
          tmdbId: m.id,
          title: m.title,
          coverUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          type: 'movie' as const
        }));

        const finalSeries = recommendedSeries.slice(0, 3).map((s: any) => ({
          tmdbId: s.id,
          title: s.name,
          coverUrl: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
          type: 'tv' as const
        }));

        setRecommendations({
          movies: finalMovies,
          series: finalSeries
        });
      } catch (err) {
        console.error('Error generating recommendations:', err);
      } finally {
        setRecLoading(false);
      }
      */
    };

    void generate();
  }, [currentUserId, moviesQuery.data, seriesQuery.data, moviesQuery.isLoading, seriesQuery.isLoading]);

  const { data: trendingMovies, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ['trending-movies'],
    queryFn: () => getTrendingMovies(),
    enabled: isTrendingOpen,
    staleTime: 1000 * 60 * 60,
  });

  const { data: anticipatedMovies, isLoading: anticipatedLoading, error: anticipatedError } = useQuery({
    queryKey: ['anticipated-movies'],
    queryFn: () => getAnticipatedMovies(),
    enabled: isAnticipatedOpen,
    staleTime: 1000 * 60 * 60,
  });

  // Search logic
  const searchResults = users.filter(
    (u) =>
      searchQuery.trim() &&
      (u.username.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        u.display_name?.toLowerCase().includes(searchQuery.trim().toLowerCase()))
  ).slice(0, 5);

  let processedUsers = users;
  if (rankingMode === 'amigos') {
    processedUsers = users.filter((u) => isUserFavorited(u.id));
    // Re-calculate ranks for friends
    processedUsers = processedUsers.map((u, index) => ({ ...u, rank: index + 1 }));
  }

  const top5Users = processedUsers.slice(0, 5);
  const currentUserInTop5 = top5Users.some((u) => u.id === currentUserId);
  const currentUserItem = processedUsers.find((u) => u.id === currentUserId);

  return (
    <>
      <aside
        className="w-full min-w-0 rounded-3xl border border-[#151b28] bg-[#06080d] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
      >
        {section === 'ranking' && <>
        <div className="flex items-center justify-between gap-3 border-b border-[#171717] pb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">Ranking</p>
            <h2 className="text-lg uppercase tracking-[0.15em] text-brand-gold mt-1">MCoins</h2>
          </div>
          <div className="relative flex-1 max-w-[120px]">
            <input
              type="text"
              placeholder="Buscar usuário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full bg-black/40 border border-[#222] rounded-lg px-2.5 py-1.5 pr-6 text-xs text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-gold transition-colors"
            />
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-[-40px] right-[-10px] sm:left-auto sm:right-0 mt-1 bg-[#0a0a0a] border border-[#222] rounded-lg shadow-xl z-50 overflow-hidden min-w-[200px] max-h-[300px] overflow-y-auto">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    className="w-full text-left px-2.5 py-2 hover:bg-[#151515] text-brand-text transition-colors flex items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectUser(u.id);
                      setSearchQuery('');
                      setIsSearchFocused(false);
                      onClose();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <AvatarDisplay avatarId={u.avatar_id} className="w-5 h-5 shrink-0" />
                    <span className="text-xs truncate">{u.display_name || u.username} <span className="text-brand-text-muted">(@{u.username})</span></span>
                  </button>
                ))}
              </div>
            )}
            {isSearchFocused && searchQuery.trim() && searchResults.length === 0 && (
              <div className="absolute top-full left-[-40px] right-[-10px] sm:left-auto sm:right-0 mt-1 bg-[#0a0a0a] border border-[#222] rounded-lg shadow-xl z-50 p-2 text-xs text-center text-brand-text-muted min-w-[200px]">
                Nenhum resultado
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex rounded-xl border border-[#171717] bg-[#0a0a0a] p-1">
          <button
            type="button"
            onClick={() => setRankingMode('geral')}
            className={clsx(
              'flex-1 rounded-lg py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] transition',
              rankingMode === 'geral' ? 'bg-[#151515] text-brand-gold' : 'text-brand-text-muted hover:text-brand-text'
            )}
          >
            Geral
          </button>
          <button
            type="button"
            onClick={() => setRankingMode('amigos')}
            className={clsx(
              'flex-1 rounded-lg py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] transition',
              rankingMode === 'amigos' ? 'bg-[#151515] text-brand-gold' : 'text-brand-text-muted hover:text-brand-text'
            )}
          >
            Amigos
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          {top5Users.map((user) => {
            const isCurrent = user.id === currentUserId;
            const isSelected = user.id === selectedUserId;
            const isLeader = user.rank === 1;

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onSelectUser(user.id);
                  onClose();
                }}
                className={clsx(
                  'w-full rounded-xl border px-2.5 py-1.5 text-left transition',
                  isLeader
                    ? 'border-2 border-yellow-600'
                    : 'border-slate-400/40',
                  isSelected
                    ? 'bg-brand-gold/10'
                    : 'bg-black/25 hover:border-[#656565]',
                )}
              >
                <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.12em]">
                  <span className="text-brand-gold-alt">{user.rank}&ordm;</span>
                  <span className="text-brand-gold">{user.mcoins} MC</span>
                </div>

                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-full border flex items-center justify-center shrink-0',
                        isSelected ? 'border-brand-gold text-brand-gold' : 'border-[#252525] text-brand-gold-alt',
                      )}
                    >
                      <AvatarDisplay avatarId={user.avatar_id} className="w-8 h-8" emojiClassName="text-lg" />
                    </div>
                    <p className="text-sm uppercase tracking-[0.14em] text-brand-text truncate">
                      {user.display_name || user.username} {isCurrent ? '(Você)' : ''}
                    </p>
                  </div>
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(user.id);
                      }}
                      className="p-1 hover:bg-white/5 rounded-full transition-colors shrink-0"
                    >
                      <Star
                        size={16}
                        className={clsx(
                          isUserFavorited(user.id) ? 'fill-brand-gold text-brand-gold' : 'text-brand-text-muted hover:text-white'
                        )}
                      />
                    </button>
                  )}
                </div>
              </button>
            );
          })}

          {!currentUserInTop5 && currentUserItem && (
            <div className="mt-2 pt-2 border-t border-[#171717]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-text-muted mb-1.5 px-2">Sua Posição</p>
              <button
                type="button"
                onClick={() => {
                  onSelectUser(currentUserItem.id);
                  onClose();
                }}
                className={clsx(
                  'w-full rounded-xl border px-2.5 py-1.5 text-left transition',
                  selectedUserId === currentUserId
                    ? 'bg-brand-gold/10 border-slate-400/40'
                    : 'bg-black/25 border-slate-400/40 hover:border-[#656565]',
                )}
              >
                <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.12em]">
                  <span className="text-brand-gold-alt">{currentUserItem.rank}&ordm;</span>
                  <span className="text-brand-gold">{currentUserItem.mcoins} MC</span>
                </div>

                <div className="mt-0.5 flex items-center gap-2 min-w-0">
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full border flex items-center justify-center shrink-0',
                      selectedUserId === currentUserId ? 'border-brand-gold text-brand-gold' : 'border-[#252525] text-brand-gold-alt',
                    )}
                  >
                    <AvatarDisplay avatarId={currentUserItem.avatar_id} className="w-8 h-8" emojiClassName="text-lg" />
                  </div>
                  <p className="text-sm uppercase tracking-[0.14em] text-brand-text truncate">
                    {currentUserItem.display_name || currentUserItem.username} (Você)
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>

        </>}

        {section === 'discover' && <>
        {/* Collapsible Em Alta section */}
        <div>
          <button
            type="button"
            onClick={() => setIsTrendingOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left group px-2 py-1"
          >
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-brand-gold animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-brand-text-muted group-hover:text-brand-text transition-colors">
                Em alta no CineRats
              </span>
            </div>
            {isTrendingOpen ? (
              <ChevronUp size={14} className="text-brand-text-muted group-hover:text-brand-text" />
            ) : (
              <ChevronDown size={14} className="text-brand-text-muted group-hover:text-brand-text" />
            )}
          </button>

          {isTrendingOpen && (
            <div className="mt-2.5 flex flex-col gap-2 transition-all">
              {trendingLoading ? (
                <div className="flex items-center justify-center py-4 text-xs text-brand-text-muted gap-2">
                  <Loader2 size={12} className="animate-spin text-brand-gold" />
                  Carregando...
                </div>
              ) : trendingError ? (
                <div className="text-[10px] text-red-400 font-light text-center py-2">
                  Erro ao carregar tendências.
                </div>
              ) : trendingMovies && trendingMovies.length > 0 ? (
                trendingMovies.map((movie, index) => (
                  <SidebarMovieItem key={index} movie={movie} currentUserId={currentUserId} allUsers={users} />
                ))
              ) : (
                <div className="text-[10px] text-brand-text-muted font-light text-center py-4">
                  Nenhum filme assistido nos últimos 30 dias.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Mais Aguardados section */}
        <div className="mt-4 pt-3 border-t border-[#171717]">
          <button
            type="button"
            onClick={() => setIsAnticipatedOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left group px-2 py-1"
          >
            <div className="flex items-center gap-2">
              <Star size={14} className="text-brand-gold animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-brand-text-muted group-hover:text-brand-text transition-colors">
                Mais Aguardados
              </span>
            </div>
            {isAnticipatedOpen ? (
              <ChevronUp size={14} className="text-brand-text-muted group-hover:text-brand-text" />
            ) : (
              <ChevronDown size={14} className="text-brand-text-muted group-hover:text-brand-text" />
            )}
          </button>

          {isAnticipatedOpen && (
            <div className="mt-2.5 flex flex-col gap-2 transition-all">
              {anticipatedLoading ? (
                <div className="flex items-center justify-center py-4 text-xs text-brand-text-muted gap-2">
                  <Loader2 size={12} className="animate-spin text-brand-gold" />
                  Carregando...
                </div>
              ) : anticipatedError ? (
                <div className="text-[10px] text-red-400 font-light text-center py-2">
                  Erro ao carregar mais aguardados.
                </div>
              ) : anticipatedMovies && anticipatedMovies.length > 0 ? (
                anticipatedMovies.map((movie, index) => (
                  <SidebarMovieItem key={index} movie={movie} currentUserId={currentUserId} allUsers={users} interestLabel />
                ))
              ) : (
                <div className="text-[10px] text-brand-text-muted font-light text-center py-4">
                  Nenhum filme nos mais aguardados.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Recomendados section */}
        <div className="mt-4 pt-3 border-t border-[#171717]">
          <button
            type="button"
            onClick={() => setIsRecomendadosOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left group px-2 py-1"
          >
            <div className="flex items-center gap-2">
              <Award size={14} className="text-brand-gold animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-brand-text-muted group-hover:text-brand-text transition-colors">
                Recomendados pra você
              </span>
            </div>
            {isRecomendadosOpen ? (
              <ChevronUp size={14} className="text-brand-text-muted group-hover:text-brand-text" />
            ) : (
              <ChevronDown size={14} className="text-brand-text-muted group-hover:text-brand-text" />
            )}
          </button>

          {isRecomendadosOpen && (
            <div className="mt-2.5 flex flex-col gap-2 transition-all animate-in fade-in duration-200">
              <div className="flex rounded-xl border border-[#171717] bg-[#0a0f1e] p-1 mb-2">
                <button
                  type="button"
                  onClick={() => setRecomendadosTab('filmes')}
                  className={clsx(
                    'flex-1 rounded-lg py-1 text-[9px] font-medium uppercase tracking-[0.1em] transition',
                    recomendadosTab === 'filmes' ? 'bg-[#151515] text-brand-gold' : 'text-brand-text-muted hover:text-brand-text'
                  )}
                >
                  Filmes
                </button>
                <button
                  type="button"
                  onClick={() => setRecomendadosTab('series')}
                  className={clsx(
                    'flex-1 rounded-lg py-1 text-[9px] font-medium uppercase tracking-[0.1em] transition',
                    recomendadosTab === 'series' ? 'bg-[#151515] text-brand-gold' : 'text-brand-text-muted hover:text-brand-text'
                  )}
                >
                  Séries
                </button>
              </div>

              {recLoading ? (
                <div className="flex items-center justify-center py-4 text-xs text-brand-text-muted gap-2">
                  <Loader2 size={12} className="animate-spin text-brand-gold" />
                  Gerando recomendações...
                </div>
              ) : recommendations ? (
                <>
                  {recomendadosTab === 'filmes' && (
                    <div className="flex flex-col gap-2">
                      {recommendations.movies.map((item) => (
                        <SidebarRecommendationItem key={item.tmdbId} item={item} currentUserId={currentUserId} />
                      ))}
                      {recommendations.movies.length === 0 && (
                        <div className="text-[10px] text-brand-text-muted font-light text-center py-4">
                          Nenhum filme recomendado no momento.
                        </div>
                      )}
                    </div>
                  )}

                  {recomendadosTab === 'series' && (
                    <div className="flex flex-col gap-2">
                      {recommendations.series.map((item) => (
                        <SidebarRecommendationItem key={item.tmdbId} item={item} currentUserId={currentUserId} />
                      ))}
                      {recommendations.series.length === 0 && (
                        <div className="text-[10px] text-brand-text-muted font-light text-center py-4">
                          Nenhuma série recomendada no momento.
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[10px] text-brand-text-muted font-light text-center py-4">
                  Adicione filmes/séries para ver recomendações personalizadas.
                </div>
              )}
            </div>
          )}
        </div>
        </>}
      </aside>
    </>
  );
}
