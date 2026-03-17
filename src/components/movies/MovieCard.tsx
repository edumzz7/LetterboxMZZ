import { Film, Eye, EyeOff, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { generateImagePath } from '../../lib/imageUtils';
import { PlatformSelect } from '../ui/PlatformSelect';
import type { MovieStatus, OscarMovieWithStatus, PersonalMovie } from '../../types/app';

type CardMovie = OscarMovieWithStatus | PersonalMovie;

interface MovieCardProps {
  movie: CardMovie;
  layout?: 'carousel' | 'grid';
  canEdit?: boolean;
  showPlatformSelector?: boolean;
  onToggleStatus?: (movie: CardMovie, nextStatus: MovieStatus) => void;
  onDelete?: (movie: PersonalMovie) => void;
  onPlatformChange?: (movie: PersonalMovie, platformId: string) => void;
}

function isPersonalMovie(movie: CardMovie): movie is PersonalMovie {
  return 'user_id' in movie;
}

export default function MovieCard({
  movie,
  layout = 'carousel',
  canEdit = false,
  showPlatformSelector = true,
  onToggleStatus,
  onDelete,
  onPlatformChange,
}: MovieCardProps) {
  const imageSrc = generateImagePath(movie.titulo, movie.capa_url);
  const isWatched = movie.status === 'watched';
  const isOscarMovie = !isPersonalMovie(movie);

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

  return (
    <div
      className={clsx(
        'flex flex-col gap-3',
        layout === 'carousel' ? 'min-w-[160px] md:min-w-[200px] snap-center' : 'w-full',
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
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-brand-text line-clamp-1" title={movie.titulo}>
          {movie.titulo}
        </h3>

        {showPlatformSelector && isPersonalMovie(movie) ? (
          <PlatformSelect
            value={movie.plataforma_slug}
            onChange={(platformId) => onPlatformChange?.(movie, platformId)}
            disabled={!canEdit}
          />
        ) : (
          <div className="text-xs uppercase tracking-[0.18em] text-brand-text-muted border border-[#1f1f1f] rounded-md px-3 py-2">
            {movie.plataforma_slug || 'Sem plataforma'}
          </div>
        )}
      </div>
    </div>
  );
}
