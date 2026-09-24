import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Flame,
  Loader2,
  Star,
  Trophy,
  Tv,
} from "lucide-react";
import { useLocation } from "wouter";
import type { PersonalMovie, SeriesEntry, SessionUser } from "../../types/app";
import homeHero from "../../assets/public/cinerats-home-hero.png";
import { listPublicRanking, listRecentPublicReviews } from "../../lib/appData";
import { getReviewReaction } from "../../lib/reviewReactions";
import {
  getTopRatedMovies,
  getTopRatedSeries,
  getWeeklyTrendingMedia,
  type TMDBHomeMedia,
} from "../../lib/tmdb";
import AvatarDisplay from "../layout/AvatarDisplay";
import HomeScreen from "../home/HomeScreen";

function MediaRow({
  title,
  icon,
  items,
  loading,
}: {
  title: string;
  icon: React.ReactNode;
  items: TMDBHomeMedia[];
  loading: boolean;
}) {
  const [, setLocation] = useLocation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateNavigation = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setCanScrollLeft(scroller.scrollLeft > 4);
    setCanScrollRight(
      scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4,
    );
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    updateNavigation();
    const observer = new ResizeObserver(updateNavigation);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [items]);

  const scrollByPage = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: direction * Math.max(220, scroller.clientWidth * 0.8),
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-brand-gold">{icon}</span>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
          {title}
        </h2>
      </div>
      {loading ? (
        <div className="flex h-48 items-center gap-2 text-xs text-brand-text-muted">
          <Loader2 size={16} className="animate-spin text-brand-gold" />
          Carregando seleção
        </div>
      ) : (
        <div className="relative">
          <div
            ref={scrollerRef}
            onScroll={updateNavigation}
            className="-my-1 flex gap-4 overflow-x-auto px-1 py-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.slice(0, 10).map((item) => {
              const name = item.title || item.name || "Sem título";
              return (
                <button
                  key={`${item.media_type}-${item.id}`}
                  type="button"
                  onClick={() =>
                    setLocation(
                      item.media_type === "tv"
                        ? `/serie/${item.id}`
                        : `/filme/${item.id}`,
                    )
                  }
                  className="group w-[166px] shrink-0 text-left"
                >
                  <div className="aspect-[2/3] overflow-hidden rounded-xl border border-[#222] bg-brand-card transition duration-300 group-hover:-translate-y-1 group-hover:border-brand-gold">
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Clapperboard className="m-auto h-full text-brand-text-muted" />
                    )}
                  </div>
                  <p className="mt-2 truncate text-xs text-brand-text group-hover:text-brand-gold">
                    {name}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-brand-text-muted">
                    <Star
                      size={10}
                      className="fill-brand-gold text-brand-gold"
                    />
                    {(Number(item.vote_average || 0) / 2).toFixed(1)} TMDB
                  </p>
                </button>
              );
            })}
          </div>
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              aria-label="Ver capas anteriores"
              className="absolute inset-y-0 left-0 z-10 w-10 border-r border-white/10 bg-black/35 text-brand-text opacity-70 backdrop-blur-sm transition hover:opacity-100 hover:text-brand-gold"
            >
              <ChevronLeft size={20} className="mx-auto" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              aria-label="Ver mais capas"
              className="absolute inset-y-0 right-0 z-10 w-10 border-l border-white/10 bg-black/35 text-brand-text opacity-70 backdrop-blur-sm transition hover:opacity-100 hover:text-brand-gold"
            >
              <ChevronRight size={20} className="mx-auto" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
interface PublicHomeProps {
  session: SessionUser | null;
  movies: PersonalMovie[];
  series: SeriesEntry[];
  favoriteGenre?: string | null;
}

export default function PublicHome({
  session,
  movies,
  series,
  favoriteGenre,
}: PublicHomeProps) {
  const [, setLocation] = useLocation();
  const rankingQuery = useQuery({
    queryKey: ["public-ranking"],
    queryFn: listPublicRanking,
    staleTime: 30_000,
  });
  const weekly = useQuery({
    queryKey: ["home-weekly-trending"],
    queryFn: getWeeklyTrendingMedia,
    staleTime: 3_600_000,
  });
  const moviesQuery = useQuery({
    queryKey: ["home-top-rated-movies-v3"],
    queryFn: getTopRatedMovies,
    staleTime: 86_400_000,
  });
  const seriesQuery = useQuery({
    queryKey: ["home-top-rated-series-v3"],
    queryFn: getTopRatedSeries,
    staleTime: 86_400_000,
  });
  const ranking = rankingQuery.data || [];
  const recentReviewsQuery = useQuery({
    queryKey: ["public-latest-reviews"],
    queryFn: listRecentPublicReviews,
    staleTime: 60_000,
  });
  const recentReviews = recentReviewsQuery.data || [];

  return (
    <main className="mx-auto w-full max-w-[1700px] space-y-12 overflow-x-hidden px-3 py-7 sm:px-6 lg:px-8 lg:py-10">
      <section className="relative left-1/2 min-h-[360px] w-screen -translate-x-1/2 overflow-hidden bg-[#06080d] sm:min-h-[430px]">
        <img
          src={homeHero}
          alt="Mascote do CineRats assistindo a um filme"
          className="absolute inset-0 h-full w-full origin-[68%_32%] scale-[1.8] object-cover object-[68%_25%] sm:origin-center sm:scale-100 sm:object-[center_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05080f] via-[#071326]/94 via-[52%] to-[#071326]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080f]/40 via-transparent to-[#05080f]/20" />
        <div className="absolute inset-0 [background:linear-gradient(to_right,#06080d_0%,transparent_15%,transparent_85%,#06080d_100%)]" />
        <div className="relative z-10 mx-auto flex min-h-[360px] w-full max-w-[1700px] flex-col justify-center px-3 py-10 sm:min-h-[430px] sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-brand-gold-alt">
              CineRats
            </p>
            <h1 className="mt-3 text-3xl font-light uppercase tracking-[0.08em] text-brand-text sm:text-5xl">
              {
                "Descubra hist\u00f3rias. Compartilhe o que ficou com voc\u00ea."
              }
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-text-muted sm:text-base">
              {
                "Filmes, s\u00e9ries, listas e uma comunidade para fazer do seu hobby algo ainda mais interessante."
              }
            </p>
          </div>
        </div>
      </section>{" "}
      <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <Trophy size={19} className="text-brand-gold" />
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Nosso ranking
            </h2>
            <p className="mt-1 text-xs text-brand-text-muted">
              Conheça quem está movimentando a comunidade.
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-5">
          {rankingQuery.isLoading ? (
            Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl border border-white/5 bg-white/5"
              />
            ))
          ) : ranking.length ? (
            ranking.map((user) => (
              <button
                key={user.username}
                type="button"
                onClick={() => setLocation(`/${user.username}`)}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 p-3 text-left transition hover:border-brand-gold/40 hover:bg-brand-gold/5"
              >
                <span className="text-lg text-brand-gold">{user.rank}</span>
                <AvatarDisplay
                  avatarId={user.avatarPath}
                  className="h-9 w-9"
                  emojiClassName="text-lg"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-brand-text">
                    {user.displayName || user.username}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-brand-text-muted">
                    {user.totalPoints} MC
                  </span>
                </span>
              </button>
            ))
          ) : (
            <p className="sm:col-span-5 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-4 text-sm text-brand-text-muted">
              {rankingQuery.isError
                ? "Não foi possível carregar o ranking agora."
                : "Ainda não há participantes no ranking."}
            </p>
          )}
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-brand-gold"><Star size={19} /></span>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Últimas resenhas da comunidade
            </h2>
            <p className="mt-1 text-xs text-brand-text-muted">
              As três resenhas mais recentes dos usuários do CineRats.
            </p>
          </div>
        </div>
        {recentReviewsQuery.isLoading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/5" />
            ))}
          </div>
        ) : recentReviews.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {recentReviews.map((item) => (
              <article key={item.id} className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#222] bg-[#111] p-4 transition-colors hover:border-brand-gold/20">
                <img
                  src={getReviewReaction(Number(item.rating) || 0)}
                  alt={`Reação para nota ${Number(item.rating || 0).toFixed(1)} de 5`}
                  className="h-10 w-10 shrink-0 object-contain pt-1 sm:h-12 sm:w-12"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setLocation(item.type === "movie" ? `/filme/${item.providerExternalId}` : `/serie/${item.providerExternalId}`)}
                      className="min-w-0 truncate text-left text-sm font-semibold text-brand-text transition hover:text-brand-gold"
                      title={`Abrir ${item.title}`}
                    >
                      {item.title}
                    </button>
                    <span className="shrink-0 text-[10px] text-brand-text-muted">
                      {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-brand-gold-alt">
                    <Star size={10} className="fill-brand-gold-alt text-brand-gold-alt" />
                    <span>{Number(item.rating || 0).toFixed(1)} / 5.0</span>
                    <span className="text-brand-text-muted/40">•</span>
                    <span className="uppercase tracking-wider text-brand-text-muted">{item.type === "movie" ? "Filme" : "Série"}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 break-words border-l-2 border-brand-gold/30 pl-3 text-xs italic leading-relaxed text-brand-text/90">
                    “{item.review}”
                  </p>
                  <button
                    type="button"
                    onClick={() => setLocation(`/${item.username}`)}
                    className="mt-3 inline-flex max-w-full items-center gap-2 text-[10px] text-brand-text-muted transition hover:text-brand-gold"
                  >
                    <AvatarDisplay avatarId={item.avatarPath} className="h-5 w-5" emojiClassName="text-xs" />
                    <span className="truncate">{item.displayName || item.username}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : recentReviewsQuery.isError ? (
          <div className="rounded-2xl border border-[#222] bg-[#111] p-6 text-center text-sm text-brand-text-muted">
            Não foi possível carregar as resenhas agora.
          </div>
        ) : (
          <div className="rounded-2xl border border-[#222] bg-[#111] p-6 text-center text-sm text-brand-text-muted">
            Ainda não há resenhas recentes para exibir.
          </div>
        )}
      </section>
      {session ? (
        <HomeScreen
          userId={session.id}
          movies={movies}
          series={series}
          favoriteGenre={favoriteGenre}
        />
      ) : (
        <>
          <MediaRow
            title="Tendências da semana"
            icon={<Flame size={19} />}
            items={weekly.data || []}
            loading={weekly.isLoading}
          />
          <MediaRow
            title="Filmes bem avaliados"
            icon={<Clapperboard size={19} />}
            items={moviesQuery.data || []}
            loading={moviesQuery.isLoading}
          />
          <MediaRow
            title="Séries bem avaliadas"
            icon={<Tv size={19} />}
            items={seriesQuery.data || []}
            loading={seriesQuery.isLoading}
          />
        </>
      )}
    </main>
  );
}
