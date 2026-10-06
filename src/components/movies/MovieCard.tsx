import { useEffect, useMemo, useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Film, Eye, EyeOff, Trash2, Loader2, Pencil, MessageSquare, MoreVertical, BookOpen, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useLocation } from 'wouter';
import { generateImagePath } from '../../lib/imageUtils';
import TmdbImage from '../ui/TmdbImage';
import {
  findMovieIdByTitle,
  getMovieWatchProviders,
  type TMDBWatchProvider,
} from '../../lib/tmdb';
import {
  updatePersonalMovieStreaming,
} from '../../lib/appData';
import { usePersonalMovieMutations } from '../../hooks/usePersonalMovies';
import StarRatingInput from '../ui/StarRatingInput';
import ReviewModal from '../ui/ReviewModal';
import SynopsisModal from '../ui/SynopsisModal';
import type { MovieStatus, PersonalMovie } from '../../types/app';

type CardMovie = PersonalMovie;
type ProviderItem = TMDBWatchProvider;

interface MovieCardProps {
  movie: CardMovie;
  layout?: 'carousel' | 'grid';
  canEdit?: boolean;
  showPlatformSelector?: boolean;
  currentUserId?: string;
  isPending?: boolean;
  onToggleStatus?: (movie: CardMovie, nextStatus: MovieStatus) => void;
  onDelete?: (movie: PersonalMovie) => void;
  onPlatformChange?: (movie: CardMovie, platformId: string) => void;
  onRate?: (movie: PersonalMovie, stars: number, review?: string | null) => Promise<unknown> | unknown;
}

// Removed: isPersonalMovie type guard - no longer needed
// function isPersonalMovie(_movie: CardMovie): _movie is PersonalMovie {
//   return true;
// }

function parseProviders(streamingData: string | null | undefined): ProviderItem[] {
  if (!streamingData) return [];
  try {
    const parsed = JSON.parse(streamingData) as ProviderItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseTmdbFromSource(sourceMovieId: string | null | undefined) {
  if (!sourceMovieId) return null;
  const directNumeric = sourceMovieId.match(/^\d+$/);
  if (directNumeric) return parseInt(sourceMovieId, 10);
  const prefixed = sourceMovieId.match(/^tmdb:(\d+)/);
  if (prefixed) return parseInt(prefixed[1], 10);
  return null;
}

export default function MovieCard({
  movie,
  layout = 'carousel',
  canEdit = false,
  showPlatformSelector = true,
  currentUserId,
  isPending = false,
  onToggleStatus,
  onDelete,
  onRate,
}: MovieCardProps) {
  const [, setLocation] = useLocation();

  const handleCardClick = async () => {
    let id = parseTmdbFromSource(movie.source_movie_id);
    if (!id) {
      id = await findMovieIdByTitle(movie.titulo, movie.ano_lancamento);
    }
    if (id) {
      setLocation(`/filme/${id}`);
    }
  };

  const imageSrc = generateImagePath(movie.titulo, movie.capa_url);
  const isWatched = movie.status === 'watched';
  const isFriendCard = Boolean(currentUserId) && movie.user_id !== currentUserId;
  const canRate = canEdit
    && Boolean(currentUserId)
    && movie.user_id === currentUserId
    && !isFriendCard
    && isWatched
    && Boolean(onRate);
  const suggestionBadge = useMemo(() => {
    return (movie.source_movie_id ?? '').includes('|rec:');
  }, [movie]);

  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [showProviders, setShowProviders] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(false);

  const { addMovieMutation } = usePersonalMovieMutations(currentUserId || '');
  const [addedToWatchlist, setAddedToWatchlist] = useState(false);

  const [ratingPending, setRatingPending] = useState<number | null>(null);
  const [synopsisModalOpen, setSynopsisModalOpen] = useState(false);
  const [resolvedTmdbId, setResolvedTmdbId] = useState<number | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [localRating, setLocalRating] = useState<number>(Number(movie.rating ?? movie.avaliacao) || 0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [pendingRating, setPendingRating] = useState<number>(localRating);
  const showReadOnlyRating = isWatched && (canRate || localRating > 0);
  const providersRef = useRef<HTMLDivElement | null>(null);

  const currentRatingValue = Number(movie.rating ?? movie.avaliacao) || 0;
  useEffect(() => {
    setLocalRating(currentRatingValue);
  }, [currentRatingValue]);

  useEffect(() => {
    setProviders(parseProviders(movie.streaming_data));
  }, [movie.streaming_data]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (providersRef.current && !providersRef.current.contains(event.target as Node)) {
        setShowProviders(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleOpenSynopsis = async () => {
    let id = parseTmdbFromSource(movie.source_movie_id);
    if (!id) {
      id = await findMovieIdByTitle(movie.titulo, movie.ano_lancamento);
    }
    setResolvedTmdbId(id);
    setSynopsisModalOpen(true);
  };

  const handleToggleStatus = () => {
    if (!canEdit || !onToggleStatus) return;
    onToggleStatus(movie, isWatched ? 'watchlist' : 'watched');
  };

  const handleDelete = (event?: Event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!canEdit || !onDelete) return;

    if (confirm(`Deseja remover "${movie.titulo}" da lista?`)) {
      onDelete(movie);
    }
  };

  const handleRate = async (stars: number, review?: string | null) => {
    if (!canRate || !onRate) return;
    const previousRating = localRating;
    setRatingError(null);
    setLocalRating(stars);
    setRatingPending(stars);
    try {
      await onRate(movie, stars, review);
    } catch (error) {
      setLocalRating(previousRating);
      setRatingError(error instanceof Error ? error.message : 'Falha ao salvar avaliacao.');
    } finally {
      setRatingPending(null);
    }
  };

  const handleAddToWishlist = () => {
    if (!currentUserId || addedToWatchlist) return;
    addMovieMutation.mutate({
      titulo: movie.titulo,
      capa_url: movie.capa_url,
      source_movie_id: movie.source_movie_id,
      status: 'watchlist',
      plataforma_slug: movie.plataforma_slug,
      ano_lancamento: movie.ano_lancamento,
      source: 'manual',
    });
    setAddedToWatchlist(true);
  };

  const resolveProviders = async () => {
    if (providers.length > 0 || providersLoading) return;
    setProvidersLoading(true);
    try {
      const tmdbId = parseTmdbFromSource(movie.source_movie_id);
      const resolvedId = tmdbId ?? (await findMovieIdByTitle(movie.titulo, movie.ano_lancamento));
      if (!resolvedId) {
        setProviders([]);
        return;
      }

      const nextProviders = await getMovieWatchProviders(resolvedId, 'BR');
      setProviders(nextProviders);
      const serialized = JSON.stringify(nextProviders);
      await updatePersonalMovieStreaming(movie.id, serialized);
    } finally {
      setProvidersLoading(false);
    }
  };

  return (
    <div
      className={clsx(
        layout === 'grid' ? 'group/card relative flex flex-row gap-3 rounded-2xl border border-[#151b28] bg-[#06080d] p-2 md:flex-col md:gap-3 md:rounded-none md:border-0 md:bg-transparent md:p-0' : 'flex flex-col gap-3 group/card min-w-[160px] md:min-w-[200px] snap-center',
        isPending && 'opacity-90',
      )}
    >
      <div
        onClick={handleCardClick}
        className="static h-32 w-20 shrink-0 overflow-hidden rounded-md border border-[#222] bg-brand-card transition-all hover:border-brand-gold-alt hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] group cursor-pointer md:relative md:h-auto md:w-full md:aspect-[2/3]"
      >
        <TmdbImage
          src={imageSrc}
          alt={movie.titulo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 767px) 80px, 20vw"
          onError={(event) => {
            event.currentTarget.parentElement?.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden absolute inset-0 w-full h-full flex-col items-center justify-center p-4 text-center bg-brand-card">
          <Film size={24} className="text-[#333] mb-2" />
          <span className="text-xs text-brand-text-muted">{movie.titulo}</span>
        </div>

        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="p-1.5 rounded-full bg-brand-bg/80 backdrop-blur-sm border border-[#333]/50 text-brand-text-muted hover:text-brand-text hover:bg-brand-bg hover:border-brand-gold/50 transition-all outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={14} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side="bottom"
                align="end"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="min-w-[180px] bg-[#0a0f1e]/95 backdrop-blur-md border border-[#222] rounded-xl p-1.5 shadow-xl shadow-black/50 z-20 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
              >
                <DropdownMenu.Item
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTimeout(() => handleOpenSynopsis(), 50);
                  }}
                  className="flex items-center gap-2 px-2 py-2 text-xs text-brand-text rounded-md cursor-pointer outline-none hover:bg-brand-gold/10 hover:text-brand-gold transition-colors focus:bg-brand-gold/10 focus:text-brand-gold"
                >
                  <BookOpen size={14} />
                  Ver Sinopse
                </DropdownMenu.Item>

                {!canEdit && currentUserId && (
                  <DropdownMenu.Item
                    onSelect={(e) => {
                      e.preventDefault();
                      handleAddToWishlist();
                    }}
                    disabled={addedToWatchlist || addMovieMutation.isPending}
                    className={clsx(
                      "flex items-center gap-2 px-2 py-2 text-xs text-brand-text rounded-md outline-none transition-colors",
                      (addedToWatchlist || addMovieMutation.isPending)
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:bg-brand-gold/10 hover:text-brand-gold focus:bg-brand-gold/10 focus:text-brand-gold"
                    )}
                  >
                    <Plus size={14} />
                    {addedToWatchlist ? 'Adicionado à Watchlist' : 'Adicionar à Watchlist'}
                  </DropdownMenu.Item>
                )}

                {canEdit && (
                  <DropdownMenu.Item
                    onSelect={handleToggleStatus}
                    className="flex items-center gap-2 px-2 py-2 text-xs text-brand-text rounded-md cursor-pointer outline-none hover:bg-brand-gold/10 hover:text-brand-gold transition-colors focus:bg-brand-gold/10 focus:text-brand-gold"
                  >
                    {isWatched ? <Eye size={14} /> : <EyeOff size={14} />}
                    {isWatched ? 'Mudar para Watchlist' : 'Marcar como visto'}
                  </DropdownMenu.Item>
                )}
                
                {canEdit && (
                  <>
                    <DropdownMenu.Separator className="h-[1px] bg-[#222] my-1" />
                    <DropdownMenu.Item
                      onSelect={handleDelete}
                      className="flex items-center gap-2 px-2 py-2 text-xs text-red-400 rounded-md cursor-pointer outline-none hover:bg-red-500/10 hover:text-red-500 transition-colors focus:bg-red-500/10 focus:text-red-500"
                    >
                      <Trash2 size={14} />
                      Remover da Lista
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {suggestionBadge ? (
          <div className="absolute right-2 bottom-10 bg-brand-bg/85 border border-emerald-500/40 px-2 py-1 rounded text-[10px] uppercase tracking-[0.12em] text-emerald-300">
            Via Sugestao
          </div>
        ) : null}

        {isPending ? (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-brand-gold" />
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 pr-6 md:px-0 md:pr-0">
        <h3
          onClick={handleCardClick}
          className="max-md:order-1 text-sm font-medium text-brand-text line-clamp-1 hover:text-brand-gold cursor-pointer transition-colors"
          title={movie.titulo}
        >
          {movie.titulo}
        </h3>

        {showPlatformSelector ? (
          <div className="relative max-md:order-4" ref={providersRef}>
            <button
              type="button"
              onClick={() => {
                const next = !showProviders;
                setShowProviders(next);
                if (next) void resolveProviders();
              }}
              className="text-[11px] uppercase tracking-[0.12em] text-brand-gold-alt hover:text-brand-gold"
            >
              Onde assistir?
            </button>
            {showProviders ? (
              <div className="absolute left-0 top-[110%] z-20 min-w-[180px] border border-[#222] rounded-md bg-[#0a0f1e] p-2">
                {providersLoading ? (
                  <div className="flex items-center gap-2 text-xs text-brand-text-muted">
                    <Loader2 size={12} className="animate-spin" /> Carregando...
                  </div>
                ) : providers.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {providers.map((provider) => (
                      <li key={provider.provider_id ?? provider.provider_name} className="text-xs text-brand-text flex items-center gap-2">
                        {provider.logo_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                            alt={provider.provider_name ?? 'provider'}
                            className="w-5 h-5 rounded"
                          />
                        ) : null}
                        <span>{provider.provider_name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[10px] text-brand-text-muted uppercase tracking-[0.12em]">
                    Sem stream BR
                  </span>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {showReadOnlyRating ? (
          <div className="flex flex-col gap-1 max-md:order-2">
            <div className="flex items-center gap-2 group/stars">
              <StarRatingInput
                value={localRating}
                onChange={(stars) => {
                  if (canRate) {
                    setPendingRating(stars);
                    setIsReviewModalOpen(true);
                  }
                }}
                disabled={!canRate}
              />
              {canRate ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingRating(localRating);
                    setIsReviewModalOpen(true);
                  }}
                  className="p-1 text-brand-text-muted hover:text-brand-gold transition-colors"
                  title="Escrever Resenha"
                >
                  <Pencil size={12} className={clsx(movie.review && "text-brand-gold-alt")} />
                </button>
              ) : (
                movie.review && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingRating(localRating);
                      setIsReviewModalOpen(true);
                    }}
                    className="p-1 text-brand-gold-alt hover:text-brand-gold transition-colors animate-pulse"
                    title="Ver Resenha"
                  >
                    <MessageSquare size={12} />
                  </button>
                )
              )}
              {canRate && ratingPending ? <Loader2 size={12} className="animate-spin text-brand-gold ml-1" /> : null}
            </div>
            {ratingError ? <p className="text-[10px] leading-relaxed text-red-300">{ratingError}</p> : null}
          </div>
        ) : null}
      </div>

      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          title={movie.titulo}
          coverUrl={movie.capa_url}
          initialRating={pendingRating}
          initialReview={movie.review || ''}
          isReadOnly={!canRate}
          onSave={async (stars, text) => {
            await handleRate(stars, text);
          }}
          onSkip={async (stars) => {
            await handleRate(stars, movie.review);
          }}
          watchedAt={movie.status === 'watched' ? movie.created_at : null}
          isRetroactive={Boolean(movie.is_retroactive)}
        />
      )}

      <SynopsisModal
        isOpen={synopsisModalOpen}
        onOpenChange={setSynopsisModalOpen}
        title={movie.titulo}
        movieId={resolvedTmdbId}
      />
    </div>
  );
}
