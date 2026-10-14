import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { CalendarClock, ChevronDown, ChevronUp, Film, Loader2, Plus, Star, UsersRound } from 'lucide-react';
import FavoritePeopleList from '../people/FavoritePeopleList';
import { MAX_FAVORITE_PEOPLE, useFavoritePeople } from '../../hooks/useFavoritePeople';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion } from 'motion/react';
import type { RankedUser } from '../../types/app';
import AvatarDisplay from './AvatarDisplay';
import TmdbImage from '../ui/TmdbImage';
import { useFavorites } from '../../hooks/useFavorites';
import { usePersonalMovieMutations } from '../../hooks/usePersonalMovies';
import { useSeriesMutations } from '../../hooks/useSeries';
import { Skeleton } from '../ui/LoadingSkeleton';
import {
  getMovieDetailsWithFallback,
  getTvDetailsRawWithFallback,
  getUpcomingMedia,
} from '../../lib/tmdb';
import type { TMDBHomeMedia } from '../../lib/tmdb';

// Mantido para que o logout também limpe caches de recomendações de versões anteriores.
export const RECOMMENDATIONS_STORAGE_KEY_PREFIX = 'cinerats_recommendations_v4_';

type SidebarMediaItemData = {
  tmdbId: number;
  title: string;
  coverUrl: string | null;
  type: 'movie' | 'tv';
  releaseDate?: string;
};

function formatSidebarDate(value?: string) {
  if (!value) return 'Data a confirmar';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return 'Data a confirmar';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
}

function toSidebarMediaItems(items: TMDBHomeMedia[], type: 'movie' | 'tv'): SidebarMediaItemData[] {
  return items.map((item) => ({
    tmdbId: item.id,
    title: item.title || item.name || 'Sem título',
    coverUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
    type,
    releaseDate: type === 'movie' ? item.release_date : item.first_air_date,
  }));
}

function SidebarMediaItem({
  item,
  currentUserId,
}: {
  item: SidebarMediaItemData;
  currentUserId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [, setLocation] = useLocation();
  const { addMovieMutation } = usePersonalMovieMutations(currentUserId);
  const { addSeriesMutation } = useSeriesMutations(currentUserId);
  const [addedToWatchlist, setAddedToWatchlist] = useState(false);

  const { data: details, isLoading } = useQuery({
    queryKey: ['upcoming-details', item.type, item.tmdbId],
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
            {/* Poster: 10% larger, with resolution selected for the display density. */}
            <div className="relative w-[35.2px] aspect-[2/3] rounded-md overflow-hidden border border-[#222] shrink-0 bg-brand-card">
              {item.coverUrl ? (
                <TmdbImage
                  src={item.coverUrl}
                  alt={item.title}
                  sizes="35.2px"
                  wrapperClassName="absolute inset-0"
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
                  Estreia {formatSidebarDate(item.releaseDate)}
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
              className="relative w-24 aspect-[2/3] shrink-0 self-start rounded overflow-hidden border border-[#222] bg-black cursor-pointer transition-colors hover:border-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              aria-label={`Abrir página de ${item.title}`}
            >
              {item.coverUrl ? (
                <TmdbImage
                  src={item.coverUrl}
                  alt={item.title}
                  sizes="96px"
                  wrapperClassName="absolute inset-0"
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
                {item.type === 'movie' ? 'Filme chegando em breve' : 'Série chegando em breve'}
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
  onClose,
  section = 'discover',
}: UserSidebarProps) {
  const [rankingMode, setRankingMode] = useState<'geral' | 'amigos'>('geral');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { isUserFavorited, toggleFavorite } = useFavorites(currentUserId);
  const { favorites: favoritePeople } = useFavoritePeople(currentUserId);
  const [isArtistsOpen, setIsArtistsOpen] = useState(false);
  const [isUpcomingOpen, setIsUpcomingOpen] = useState(false);
  const [upcomingTab, setUpcomingTab] = useState<'filmes' | 'series'>('filmes');

  const localToday = new Date();
  const upcomingDateKey = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, '0')}-${String(localToday.getDate()).padStart(2, '0')}`;
  const upcomingQuery = useQuery({
    queryKey: ['tmdb-upcoming-media-60d', upcomingDateKey],
    queryFn: getUpcomingMedia,
    enabled: isUpcomingOpen,
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
  const upcomingItems = upcomingTab === 'filmes'
    ? toSidebarMediaItems(upcomingQuery.data?.movies || [], 'movie')
    : toSidebarMediaItems(upcomingQuery.data?.series || [], 'tv');

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
            aria-pressed={rankingMode === 'geral'}
            className={clsx(
              'relative flex-1 rounded-lg py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] transition',
              rankingMode === 'geral' ? 'text-brand-gold' : 'text-brand-text-muted hover:text-brand-text'
            )}
          >
            {rankingMode === 'geral' && (
              <motion.span
                layoutId="ranking-mode-indicator"
                className="absolute inset-0 rounded-lg bg-[#151515]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">Geral</span>
          </button>
          <button
            type="button"
            onClick={() => setRankingMode('amigos')}
            aria-pressed={rankingMode === 'amigos'}
            className={clsx(
              'relative flex-1 rounded-lg py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] transition',
              rankingMode === 'amigos' ? 'text-brand-gold' : 'text-brand-text-muted hover:text-brand-text'
            )}
          >
            {rankingMode === 'amigos' && (
              <motion.span
                layoutId="ranking-mode-indicator"
                className="absolute inset-0 rounded-lg bg-[#151515]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">Amigos</span>
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
                      <AvatarDisplay avatarId={user.avatar_id} className="w-full h-full" emojiClassName="text-lg" />
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
                    <AvatarDisplay avatarId={currentUserItem.avatar_id} className="w-full h-full" emojiClassName="text-lg" />
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
        <div>
          <button
            type="button"
            onClick={() => setIsArtistsOpen((prev) => !prev)}
            aria-expanded={isArtistsOpen}
            className="w-full flex items-center justify-between text-left group px-2 py-1"
          >
            <div className="flex items-center gap-2">
              <UsersRound size={14} className="text-brand-gold" />
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-brand-text-muted group-hover:text-brand-text transition-colors">
                Meus artistas favoritos
              </span>
              {favoritePeople.length > 0 && (
                <span className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-1.5 text-[10px] text-brand-gold">
                  {favoritePeople.length}/{MAX_FAVORITE_PEOPLE}
                </span>
              )}
            </div>
            {isArtistsOpen ? (
              <ChevronUp size={14} className="text-brand-text-muted group-hover:text-brand-text" />
            ) : (
              <ChevronDown size={14} className="text-brand-text-muted group-hover:text-brand-text" />
            )}
          </button>

          {isArtistsOpen && (
            <div className="mt-2.5 rounded-xl border border-[#171717] bg-[#0a0f1e] px-2 py-2 animate-in fade-in duration-200">
              <FavoritePeopleList
                userId={currentUserId}
                variant="compact"
                emptyMessage="Você ainda não favoritou nenhum artista. Use a estrela na página de um ator ou diretor."
              />
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[#171717]">
          <button
            type="button"
            onClick={() => setIsUpcomingOpen((prev) => !prev)}
            aria-expanded={isUpcomingOpen}
            className="w-full flex items-center justify-between text-left group px-2 py-1"
          >
            <div className="flex items-center gap-2">
              <CalendarClock size={14} className="text-brand-gold" />
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-brand-text-muted group-hover:text-brand-text transition-colors">
                Chegando em breve
              </span>
            </div>
            {isUpcomingOpen ? (
              <ChevronUp size={14} className="text-brand-text-muted group-hover:text-brand-text" />
            ) : (
              <ChevronDown size={14} className="text-brand-text-muted group-hover:text-brand-text" />
            )}
          </button>

          {isUpcomingOpen && (
            <div className="mt-2.5 flex flex-col gap-2 transition-all animate-in fade-in duration-200">
              <div className="flex rounded-xl border border-[#171717] bg-[#0a0f1e] p-1 mb-2">
                <button
                  type="button"
                  onClick={() => setUpcomingTab('filmes')}
                  aria-pressed={upcomingTab === 'filmes'}
                  className={clsx(
                    'relative flex-1 rounded-lg py-1 text-[9px] font-medium uppercase tracking-[0.1em] transition',
                    upcomingTab === 'filmes' ? 'text-brand-gold' : 'text-brand-text-muted hover:text-brand-text'
                  )}
                >
                  {upcomingTab === 'filmes' && (
                    <motion.span
                      layoutId="upcoming-type-indicator"
                      className="absolute inset-0 rounded-lg bg-[#151515]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative">Filmes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUpcomingTab('series')}
                  aria-pressed={upcomingTab === 'series'}
                  className={clsx(
                    'relative flex-1 rounded-lg py-1 text-[9px] font-medium uppercase tracking-[0.1em] transition',
                    upcomingTab === 'series' ? 'text-brand-gold' : 'text-brand-text-muted hover:text-brand-text'
                  )}
                >
                  {upcomingTab === 'series' && (
                    <motion.span
                      layoutId="upcoming-type-indicator"
                      className="absolute inset-0 rounded-lg bg-[#151515]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative">Séries</span>
                </button>
              </div>

              {upcomingQuery.isLoading ? (
                <div role="status" aria-label="Carregando próximas estreias" className="space-y-2 py-2">{[0, 1, 2].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/5 p-2"><Skeleton className="h-12 w-9 shrink-0 rounded" /><div className="flex-1 space-y-2"><Skeleton className="h-2.5 w-3/4" /><Skeleton className="h-2 w-1/2" /></div><Skeleton className="h-4 w-4 rounded-full" /></div>)}</div>
              ) : upcomingQuery.isError ? (
                <div className="text-[10px] text-red-400 font-light text-center py-2">
                  Não foi possível carregar as próximas estreias.
                </div>
              ) : upcomingItems.length ? (
                <div className="flex flex-col gap-2">
                  {upcomingItems.map((item) => (
                    <SidebarMediaItem key={`${item.type}-${item.tmdbId}`} item={item} currentUserId={currentUserId} />
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-brand-text-muted font-light text-center py-4">
                  Não encontramos estreias nos próximos 60 dias.
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
