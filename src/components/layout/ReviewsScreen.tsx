import { useEffect, useMemo, useRef } from 'react';
import { Clapperboard, Loader2, Star, Tv } from 'lucide-react';
import { useLocation } from 'wouter';
import AvatarDisplay from './AvatarDisplay';
import { usePublicReviews } from '../../hooks/useReviews';
import { ListSkeleton, Skeleton } from '../ui/LoadingSkeleton';
import TmdbImage from '../ui/TmdbImage';

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
}

export default function ReviewsScreen() {
  const [, setLocation] = useLocation();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = usePublicReviews();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const reviews = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data],
  );

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '240px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <ListSkeleton count={6}><div className="flex gap-4 border-b border-white/10 pb-5"><Skeleton className="h-8 w-40" /><Skeleton className="h-8 w-24" /></div></ListSkeleton>;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-sm text-red-200">
        Não foi possível carregar as resenhas. Tente novamente mais tarde.
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Comunidade</p>
        <h1 className="mt-2 text-3xl font-light text-brand-text sm:text-4xl">Resenhas</h1>
        <p className="mt-2 text-sm text-brand-text-muted">Veja o que a comunidade CineRats está assistindo e comentando.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-[#222] bg-[#111] p-10 text-center text-sm font-light text-brand-text-muted">
          Nenhuma resenha escrita ainda.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => {
              const isMovie = review.type === 'movie';
              const destination = `${isMovie ? '/filme' : '/serie'}/${review.providerExternalId}`;
              const rating = Number(review.rating);

              return (
                <article key={review.id} className="rounded-2xl border border-[#222] bg-[#111] p-4 transition-colors hover:border-brand-gold/30 sm:p-5">
                  <button type="button" onClick={() => setLocation(`/${review.username}`)} className="group flex max-w-full items-center gap-3 text-left">
                    <AvatarDisplay avatarId={review.avatarPath} className="h-10 w-10 border border-[#292929]" emojiClassName="text-lg" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-brand-text transition group-hover:text-brand-gold">{review.username}</span>
                      <span className="mt-0.5 block text-[11px] text-brand-text-muted">resenhou em {formatDate(review.createdAt)}</span>
                    </span>
                  </button>

                  <p className="mt-4 whitespace-pre-wrap text-[15px] font-light leading-relaxed text-brand-text/90">
                    {review.review}
                  </p>

                  <button
                    type="button"
                    onClick={() => setLocation(destination)}
                    className="mt-5 flex w-full overflow-hidden rounded-xl border border-white/10 bg-black/25 text-left transition hover:border-brand-gold/40 hover:bg-brand-gold/[0.04]"
                    aria-label={`Abrir ${review.title}`}
                  >
                    <div className="h-24 w-[4.25rem] shrink-0 bg-[#151515] text-brand-text-muted sm:h-28 sm:w-20">
                      {review.posterPath ? (
                        <TmdbImage src={review.posterPath} alt={`Pôster de ${review.title}`} sizes="(max-width: 639px) 68px, 80px" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="flex h-full items-center justify-center"><Clapperboard size={20} /></span>
                      )}
                    </div>
                    <span className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted">
                        {isMovie ? <Clapperboard size={12} /> : <Tv size={12} />}{isMovie ? 'Filme' : 'Série'}
                      </span>
                      <span className="mt-1 line-clamp-2 text-sm font-semibold text-brand-text sm:text-base">{review.title}</span>
                      {Number.isFinite(rating) && rating > 0 && (
                        <span className="mt-2 flex items-center gap-1.5 text-xs text-brand-gold-alt"><Star size={13} className="fill-brand-gold-alt" />{rating.toFixed(1)} / 5.0</span>
                      )}
                    </span>
                  </button>
                </article>
              );
            })}
          </div>

          <div ref={loadMoreRef} className="flex h-12 items-center justify-center" aria-live="polite">
            {isFetchingNextPage && <Loader2 className="animate-spin text-brand-gold" size={20} />}
          </div>
        </>
      )}
    </section>
  );
}
