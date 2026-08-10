import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Clapperboard, Flame, Loader2, Sparkles, Star, Tv } from 'lucide-react';
import { useLocation } from 'wouter';
import type { PersonalMovie, SeriesEntry } from '../../types/app';
import {
  getMovieRecommendations,
  getMovieDetailsWithFallback,
  getMovieSimilar,
  getFavoriteGenreRecommendations,
  getTopRatedMovies,
  getTopRatedSeries,
  getTvRecommendations,
  getTvDetailsRawWithFallback,
  getTvSimilar,
  getWeeklyTrendingMedia,
  HOME_RELATED_MIN_RATING,
  HOME_RELATED_MIN_VOTES,
  type TMDBHomeMedia,
  type TMDBRecommendationItem,
} from '../../lib/tmdb';
import { getFavoriteGenre } from '../../lib/favoriteGenres';

type MediaType = 'movie' | 'tv';
type WatchedSeed = { id: number; title: string; type: MediaType };

interface HomeScreenProps {
  userId: string;
  movies: PersonalMovie[];
  series: SeriesEntry[];
  favoriteGenre?: string | null;
}

function toHomeMedia(item: TMDBRecommendationItem, mediaType: MediaType): TMDBHomeMedia {
  return { ...item, media_type: mediaType };
}

function HomeCard({ item }: { item: TMDBHomeMedia }) {
  const [, setLocation] = useLocation();
  const title = item.title || item.name || 'Sem título';
  const rating = Number(item.vote_average || 0) / 2;

  return (
    <button
      type="button"
      onClick={() => setLocation(item.media_type === 'tv' ? `/serie/${item.id}` : `/filme/${item.id}`)}
      className="group relative z-0 flex w-[123px] shrink-0 cursor-pointer flex-col gap-2 text-left transition hover:z-10 sm:w-[141px]"
      aria-label={`Abrir ${title}`}
    >
      <div className="relative aspect-[2/3] rounded-xl border border-[#222] bg-black shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:border-brand-gold/70 group-hover:shadow-brand-gold/10">
        <div className="absolute inset-px overflow-hidden rounded-[11px]">
          {item.poster_path ? (
            <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-brand-text-muted"><Clapperboard size={24} /></div>
          )}
        </div>
      </div>
      <span className="truncate text-xs font-medium text-brand-text transition group-hover:text-brand-gold" title={title}>{title}</span>
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-text-muted">
        <Star size={11} className="fill-brand-gold text-brand-gold" /> {rating ? `${rating.toFixed(1)} TMDB` : 'Sem nota'}
      </span>
    </button>
  );
}

function MediaCarousel({ items }: { items: TMDBHomeMedia[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateNavigation = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setCanScrollLeft(scroller.scrollLeft > 4);
    setCanScrollRight(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4);
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    updateNavigation();
    const observer = new ResizeObserver(updateNavigation);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [items]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: scroller.scrollLeft, moved: false };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const scroller = scrollerRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !scroller) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 4) drag.moved = true;
    scroller.scrollLeft = drag.startScrollLeft - distance;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const didMove = dragRef.current?.pointerId === event.pointerId && dragRef.current.moved;
    dragRef.current = null;
    if (didMove) {
      suppressClickRef.current = true;
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
    updateNavigation();
  };

  const scrollByPage = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: direction * Math.max(220, scroller.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={updateNavigation}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = false;
        }}
        className="-my-1 flex gap-4 overflow-x-auto px-1 py-1 scroll-smooth select-none touch-pan-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
      >
        {items.map((item) => <HomeCard key={`${item.media_type}-${item.id}`} item={item} />)}
      </div>
      {canScrollLeft && (
        <button type="button" onClick={() => scrollByPage(-1)} aria-label="Ver capas anteriores" className="absolute inset-y-0 left-0 z-10 w-9 border-r border-white/10 bg-black/45 text-brand-text opacity-70 backdrop-blur-sm transition hover:opacity-100 hover:text-brand-gold">
          <ChevronLeft size={20} className="mx-auto" />
        </button>
      )}
      {canScrollRight && (
        <button type="button" onClick={() => scrollByPage(1)} aria-label="Ver mais capas" className="absolute inset-y-0 right-0 z-10 w-9 border-l border-white/10 bg-black/45 text-brand-text opacity-70 backdrop-blur-sm transition hover:opacity-100 hover:text-brand-gold">
          <ChevronRight size={20} className="mx-auto" />
        </button>
      )}
    </div>
  );
}

function Collection({ title, subtitle, icon, items, isLoading, emptyMessage, carousel = false, limit = 5 }: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  items: TMDBHomeMedia[];
  isLoading: boolean;
  emptyMessage: string;
  carousel?: boolean;
  limit?: number;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-brand-gold-alt">{icon}</span>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-gold">{title}</h2>
          <p className="mt-1 text-xs font-light text-brand-text-muted">{subtitle}</p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 py-8 text-xs uppercase tracking-wider text-brand-text-muted"><Loader2 size={15} className="animate-spin text-brand-gold" /> Carregando seleção...</div>
      ) : items.length ? (
        carousel ? <MediaCarousel items={items.slice(0, limit)} /> : <div className="flex flex-wrap gap-x-4 gap-y-6">{items.slice(0, limit).map((item) => <HomeCard key={`${item.media_type}-${item.id}`} item={item} />)}</div>
      ) : (
        <div className="rounded-2xl border border-[#151515] bg-black/20 px-5 py-6 text-xs font-light text-brand-text-muted">{emptyMessage}</div>
      )}
    </section>
  );
}

export default function HomeScreen({ userId, movies, series, favoriteGenre: favoriteGenreValue }: HomeScreenProps) {
  const favoriteGenre = getFavoriteGenre(favoriteGenreValue);
  const watchedSeed = useMemo<WatchedSeed | null>(() => {
    const entries = [
      ...movies.filter((movie) => movie.status === 'watched').map((movie) => ({ id: Number(movie.source_movie_id), title: movie.titulo, type: 'movie' as const, createdAt: movie.created_at })),
      ...series.filter((entry) => entry.status === 'watched').map((entry) => ({ id: Number(entry.source_movie_id), title: entry.titulo, type: 'tv' as const, createdAt: entry.created_at })),
    ];
    return entries
      .filter((entry) => Number.isFinite(entry.id) && entry.id > 0)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null;
  }, [movies, series]);

  const knownMediaIds = useMemo(() => new Set([
    ...movies.map((movie) => Number(movie.source_movie_id)),
    ...series.map((entry) => Number(entry.source_movie_id)),
  ].filter((id) => Number.isFinite(id) && id > 0)), [movies, series]);

  const weeklyQuery = useQuery({
    queryKey: ['home-weekly-trending'],
    queryFn: getWeeklyTrendingMedia,
    staleTime: 1000 * 60 * 60,
  });
  const topSeriesQuery = useQuery({
    queryKey: ['home-top-rated-series-v3'],
    queryFn: getTopRatedSeries,
    staleTime: 1000 * 60 * 60 * 24,
    refetchInterval: 1000 * 60 * 60 * 24,
  });
  const topMoviesQuery = useQuery({
    queryKey: ['home-top-rated-movies-v3'],
    queryFn: getTopRatedMovies,
    staleTime: 1000 * 60 * 60 * 24,
    refetchInterval: 1000 * 60 * 60 * 24,
  });
  const relatedQuery = useQuery({
    queryKey: ['home-related-v2', userId, watchedSeed?.type, watchedSeed?.id],
    enabled: Boolean(watchedSeed),
    queryFn: async () => {
      if (!watchedSeed) return [];
      const [recommendations, similar, seedDetails] = watchedSeed.type === 'movie'
        ? await Promise.all([getMovieRecommendations(watchedSeed.id), getMovieSimilar(watchedSeed.id), getMovieDetailsWithFallback(watchedSeed.id)])
        : await Promise.all([getTvRecommendations(watchedSeed.id), getTvSimilar(watchedSeed.id), getTvDetailsRawWithFallback(watchedSeed.id)]);
      const seedGenreIds = new Set<number>((seedDetails?.genres || []).map((genre: { id: number }) => genre.id));
      const filterAndRank = (items: TMDBRecommendationItem[]) => items
        .map((item) => ({
          item,
          sharedGenres: (item.genre_ids || []).filter((genreId) => seedGenreIds.has(genreId)).length,
        }))
        .filter(({ item, sharedGenres }) => !knownMediaIds.has(item.id) && Boolean(item.poster_path) && !item.adult && (!seedGenreIds.size || sharedGenres > 0))
        .filter(({ item }) => Number(item.vote_average || 0) >= HOME_RELATED_MIN_RATING)
        .filter(({ item }) => Number(item.vote_count || 0) >= HOME_RELATED_MIN_VOTES[watchedSeed.type])
        .sort((a, b) => b.sharedGenres - a.sharedGenres || Number(b.item.vote_average || 0) - Number(a.item.vote_average || 0) || Number(b.item.vote_count || 0) - Number(a.item.vote_count || 0));
      const directMatches = filterAndRank(recommendations);
      const directIds = new Set(directMatches.map(({ item }) => item.id));
      const similarMatches = directMatches.length < 6
        ? filterAndRank(similar).filter(({ item }) => !directIds.has(item.id)).slice(0, 6 - directMatches.length)
        : [];
      return [...directMatches, ...similarMatches]
        .slice(0, 5)
        .map(({ item }) => toHomeMedia(item, watchedSeed.type));
    },
    staleTime: 1000 * 60 * 60,
  });
  const favoriteGenreQuery = useQuery({
    queryKey: ['home-favorite-genre-v1', userId, favoriteGenre?.key],
    enabled: Boolean(favoriteGenre),
    queryFn: () => favoriteGenre ? getFavoriteGenreRecommendations(favoriteGenre, knownMediaIds, userId) : Promise.resolve([]),
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="border-b border-[#151515] pb-6">
        <p className="text-xs uppercase tracking-[0.24em] text-brand-gold-alt">CineRats</p>
        <h1 className="mt-2 text-3xl font-extralight uppercase tracking-wide text-brand-text sm:text-4xl">Sua Home</h1>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-brand-text-muted">Seleções atualizadas pelo catálogo do TMDB, pensadas para você descobrir o próximo filme ou série.</p>
      </div>

      <Collection title="Tendências da semana" subtitle="O que está movimentando o catálogo agora." icon={<Flame size={19} />} items={weeklyQuery.data || []} isLoading={weeklyQuery.isLoading} emptyMessage="Não foi possível carregar as tendências agora." carousel limit={10} />
      <Collection title={watchedSeed ? `Porque você assistiu ${watchedSeed.title}` : 'Porque você assistiu'} subtitle="Relacionados ao seu último título marcado como visto." icon={<Sparkles size={19} />} items={relatedQuery.data || []} isLoading={relatedQuery.isLoading} emptyMessage={watchedSeed ? 'Não encontramos recomendações que atendam aos critérios agora.' : 'Marque um filme ou série como visto para receber recomendações personalizadas.'} carousel />
      <Collection
        title="Baseado no seu gênero favorito"
        subtitle={favoriteGenre ? `Sugestões de ${favoriteGenre.label}.` : 'Escolha um gênero para personalizar esta seleção.'}
        icon={<Sparkles size={19} />}
        items={favoriteGenreQuery.data || []}
        isLoading={favoriteGenreQuery.isLoading}
        emptyMessage={favoriteGenre ? 'Não encontramos sugestões desse gênero agora.' : 'Atualize seu gênero favorito no Painel Pessoal e atualize a página.'}
        carousel
        limit={10}
      />
      <Collection title="Séries bem avaliadas" subtitle="10 séries com notas consistentes!" icon={<Tv size={19} />} items={topSeriesQuery.data || []} isLoading={topSeriesQuery.isLoading} emptyMessage="Não foi possível carregar as séries bem avaliadas agora." carousel limit={10} />
      <Collection title="Filmes bem avaliados" subtitle="10 filmes com notas consistentes!" icon={<Clapperboard size={19} />} items={topMoviesQuery.data || []} isLoading={topMoviesQuery.isLoading} emptyMessage="Não foi possível carregar os filmes bem avaliados agora." carousel limit={10} />
    </div>
  );
}
