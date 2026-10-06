import { Clapperboard, Star, Tv } from 'lucide-react';
import { useLocation } from 'wouter';
import { SIMILAR_MEDIA_MIN_RATING, type TMDBRecommendationItem } from '../../lib/tmdb';
import TmdbImage from './TmdbImage';
import { Skeleton } from './LoadingSkeleton';

interface SimilarMediaSectionProps {
  items: TMDBRecommendationItem[];
  type: 'movie' | 'series';
  isLoading?: boolean;
}

export default function SimilarMediaSection({ items, type, isLoading = false }: SimilarMediaSectionProps) {
  const [, setLocation] = useLocation();
  const mediaLabel = type === 'movie' ? 'filmes' : 'séries';
  const visibleItems = items
    .filter((item) => Boolean(item.poster_path) && Number(item.vote_average || 0) / 2 >= SIMILAR_MEDIA_MIN_RATING)
    .slice(0, 3);

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-gold">Semelhantes</h3>

      {isLoading ? (
        <div role="status" aria-label={`Carregando ${mediaLabel} semelhantes`} className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#151515] bg-black/25 p-3"><Skeleton className="h-20 w-14 shrink-0 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-4/5" /><Skeleton className="h-2.5 w-1/2" /><Skeleton className="h-2.5 w-1/3" /></div></div>)}
        </div>
      ) : visibleItems.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {visibleItems.map((item) => {
            const title = item.title || item.name || 'Sem título';
            const year = (item.release_date || item.first_air_date || '').split('-')[0];
            const rating = Number(item.vote_average || 0) / 2;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setLocation(type === 'movie' ? `/filme/${item.id}` : `/serie/${item.id}`)}
                className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border border-[#151515] bg-black/25 p-3 text-left transition hover:-translate-y-0.5 hover:border-brand-gold/50 hover:bg-brand-gold/5"
                aria-label={`Abrir ${title}`}
              >
                <TmdbImage
                  src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                  alt={title}
                  loading="lazy"
                  sizes="56px"
                  wrapperClassName="h-20 w-14 shrink-0 rounded-lg"
                  className="h-20 w-14 shrink-0 rounded-lg object-cover transition group-hover:scale-[1.03]"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-brand-text transition group-hover:text-brand-gold" title={title}>{title}</span>
                  <span className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-text-muted">
                    {type === 'movie' ? <Clapperboard size={11} /> : <Tv size={11} />}
                    {year || 'Ano desconhecido'}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[10px] text-brand-gold-alt">
                    <Star size={11} className="fill-brand-gold-alt" />
                    {rating ? `${rating.toFixed(1)} TMDB` : 'Sem nota'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-brand-text-muted">Nenhum título semelhante encontrado no TMDB.</p>
      )}
    </section>
  );
}
