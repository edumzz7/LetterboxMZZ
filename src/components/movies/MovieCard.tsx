import { useEffect, useMemo, useRef, useState } from 'react';
import { Film, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { generateImagePath } from '../../lib/imageUtils';
import {
  findMovieIdByTitle,
  getMovieWatchProviders,
  type TMDBWatchProvider,
} from '../../lib/tmdb';
import {
  updateOscarMovieStreaming,
  updatePersonalMovieStreaming,
} from '../../lib/appData';
import type { MovieStatus, OscarMovieWithStatus, PersonalMovie } from '../../types/app';

type CardMovie = OscarMovieWithStatus | PersonalMovie;
type ReactionEmoji = '❤️' | '🔥' | '😂' | '👎';
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
  onRate?: (movie: PersonalMovie, stars: number) => Promise<unknown> | unknown;
  onReact?: (movie: PersonalMovie, reaction: ReactionEmoji) => Promise<unknown> | unknown;
}

function isPersonalMovie(movie: CardMovie): movie is PersonalMovie {
  return 'user_id' in movie;
}

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
  onReact,
}: MovieCardProps) {
  const imageSrc = generateImagePath(movie.titulo, movie.capa_url);
  const isWatched = movie.status === 'watched';
  const isOscarMovie = !isPersonalMovie(movie);
  const isFriendCard = isPersonalMovie(movie) && Boolean(currentUserId) && movie.user_id !== currentUserId;
  const canRate = isPersonalMovie(movie) && !isFriendCard && isWatched && Boolean(onRate);
  const suggestionBadge = useMemo(() => {
    if (!isPersonalMovie(movie)) return false;
    return (movie.source_movie_id ?? '').includes('|rec:');
  }, [movie]);

  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [showProviders, setShowProviders] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [reactionPending, setReactionPending] = useState<ReactionEmoji | null>(null);
  const [ratingPending, setRatingPending] = useState<number | null>(null);
  const [localRating, setLocalRating] = useState<number>(isPersonalMovie(movie) ? (movie.avaliacao ?? 0) : 0);
  const showReadOnlyRating = isPersonalMovie(movie) && isWatched && (canRate || localRating > 0);
  const providersRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isPersonalMovie(movie)) {
      setLocalRating(movie.avaliacao ?? 0);
    }
  }, [movie]);

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

  const handleToggleStatus = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canEdit || !onToggleStatus) return;
    onToggleStatus(movie, isWatched ? 'watchlist' : 'watched');
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canEdit || !isPersonalMovie(movie) || !onDelete) return;

    if (movie.source === 'oscar') {
      alert('Filmes sincronizados com o Oscar sao atualizados pela aba Oscar.');
      return;
    }

    if (confirm(`Deseja remover "${movie.titulo}" da lista?`)) {
      onDelete(movie);
    }
  };

  const handleReaction = async (reaction: ReactionEmoji) => {
    if (!isPersonalMovie(movie) || !onReact) return;
    setReactionPending(reaction);
    try {
      await onReact(movie, reaction);
    } finally {
      setReactionPending(null);
    }
  };

  const handleRate = async (stars: number) => {
    if (!isPersonalMovie(movie) || !onRate) return;
    setLocalRating(stars);
    setRatingPending(stars);
    try {
      await onRate(movie, stars);
    } finally {
      setRatingPending(null);
    }
  };

  const resolveProviders = async () => {
    if (providers.length > 0 || providersLoading) return;
    setProvidersLoading(true);
    try {
      const tmdbId = isPersonalMovie(movie) ? parseTmdbFromSource(movie.source_movie_id) : null;
      const resolvedId =
        tmdbId ??
        (await findMovieIdByTitle(
          movie.titulo,
          'ano_lancamento' in movie ? movie.ano_lancamento : movie.ano_oscar,
        ));
      if (!resolvedId) {
        setProviders([]);
        return;
      }

      const nextProviders = await getMovieWatchProviders(resolvedId, 'BR');
      setProviders(nextProviders);
      const serialized = JSON.stringify(nextProviders);
      if (isPersonalMovie(movie)) {
        await updatePersonalMovieStreaming(movie.id, serialized);
      } else {
        await updateOscarMovieStreaming(movie.id, serialized);
      }
    } finally {
      setProvidersLoading(false);
    }
  };

  return (
    <div
      className={clsx(
        'flex flex-col gap-3 group/card',
        layout === 'carousel' ? 'min-w-[160px] md:min-w-[200px] snap-center' : 'w-full',
        isPending && 'opacity-90',
      )}
    >
      <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-brand-card border border-[#222] transition-all hover:border-brand-gold-alt hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] group cursor-pointer">
        <img
          src={imageSrc}
          alt={movie.titulo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(event) => {
            (event.target as HTMLImageElement).style.display = 'none';
            (event.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden absolute inset-0 w-full h-full flex-col items-center justify-center p-4 text-center bg-brand-card">
          <Film size={24} className="text-[#333] mb-2" />
          <span className="text-xs text-brand-text-muted">{movie.titulo}</span>
        </div>

        <div
          onClick={handleToggleStatus}
          className={clsx(
            'absolute top-2 left-2 p-1.5 rounded-full bg-brand-bg/80 backdrop-blur-sm transition-all z-10',
            canEdit && 'hover:scale-110',
            isWatched
              ? 'text-brand-gold border border-brand-gold/30'
              : 'text-brand-text-muted border border-[#333]/50 hover:text-brand-text',
            !canEdit && 'opacity-80 cursor-default',
          )}
          title={isWatched ? 'Mudar para Watchlist' : 'Marcar como visto'}
        >
          {isWatched ? <Eye size={14} /> : <EyeOff size={14} />}
        </div>

        {canEdit && isPersonalMovie(movie) ? (
          <div
            onClick={handleDelete}
            className="absolute top-10 left-2 p-1.5 rounded-full bg-brand-bg/80 backdrop-blur-sm text-brand-text-muted border border-[#333]/50 hover:text-red-500 hover:border-red-500/30 transition-all hover:scale-110 z-10"
            title="Remover"
          >
            <Trash2 size={14} />
          </div>
        ) : null}

        {isOscarMovie && movie.categoria_principal ? (
          <div className="absolute top-2 right-2 bg-brand-bg/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] uppercase text-brand-gold border border-brand-gold/30 line-clamp-1 max-w-[70%]">
            {movie.categoria_principal}
          </div>
        ) : null}

        {isPersonalMovie(movie) && movie.source === 'oscar' ? (
          <div className="absolute right-2 bottom-2 bg-brand-bg/85 border border-brand-gold/30 px-2 py-1 rounded text-[10px] uppercase tracking-[0.18em] text-brand-gold-alt">
            Via Oscar
          </div>
        ) : null}

        {suggestionBadge ? (
          <div className="absolute right-2 bottom-10 bg-brand-bg/85 border border-emerald-500/40 px-2 py-1 rounded text-[10px] uppercase tracking-[0.12em] text-emerald-300">
            Via Sugestao
          </div>
        ) : null}

        {isFriendCard ? (
          <div className="absolute left-1/2 -translate-x-1/2 top-3 opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto transition-opacity duration-300 delay-500 z-20">
            <div className="bg-black/80 border border-[#333] rounded-full px-2 py-1 flex items-center gap-1">
              {(['❤️', '🔥', '😂', '👎'] as ReactionEmoji[]).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => void handleReaction(emoji)}
                  className={clsx(
                    'w-7 h-7 rounded-full border border-[#333] text-sm hover:border-brand-gold/40 bg-brand-bg/70',
                    reactionPending === emoji && 'opacity-60',
                  )}
                >
                  {emoji}
                </button>
              ))}
              {reactionPending ? <Loader2 size={12} className="animate-spin text-brand-gold ml-1" /> : null}
            </div>
          </div>
        ) : null}

        {isPending ? (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-brand-gold" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-brand-text line-clamp-1" title={movie.titulo}>
          {movie.titulo}
        </h3>

        {showPlatformSelector ? (
          <div className="relative" ref={providersRef}>
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
          <div className="flex items-center gap-1 text-lg">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  if (canRate) void handleRate(star);
                }}
                disabled={!canRate}
                className={clsx(
                  'leading-none transition',
                  localRating >= star ? 'text-yellow-400' : 'text-[#444]',
                  canRate && 'hover:text-yellow-300',
                  !canRate && 'cursor-default',
                )}
                title={`${star} estrela(s)`}
              >
                ★
              </button>
            ))}
            {canRate && ratingPending ? <Loader2 size={12} className="animate-spin text-brand-gold ml-1" /> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
