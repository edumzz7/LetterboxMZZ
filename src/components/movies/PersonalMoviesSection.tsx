import { useState } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { usePersonalMovies } from "../../hooks/usePersonalMovies";
import { useSocialActions } from "../../hooks/useSocialActions";
import type { PersonalMovie } from "../../types/app";
import AddMovieDialog from "./AddMovieDialog";
import MovieCard from "./MovieCard";

interface PersonalMoviesSectionProps {
  userId: string;
  canEdit: boolean;
  currentUserId: string;
  publicReadOnly?: boolean;
}

export default function PersonalMoviesSection({
  userId,
  canEdit,
  currentUserId,
  publicReadOnly = false,
}: PersonalMoviesSectionProps) {
  const [, setLocation] = useLocation();
  const {
    moviesQuery,
    addMovieMutation,
    updatePlatformMutation,
    updateStatusMutation,
    deleteMovieMutation,
  } = usePersonalMovies(userId);
  const { rateMutation } = useSocialActions();
  const [filter, setFilter] = useState<"watchlist" | "watched">(
    publicReadOnly ? "watched" : "watchlist",
  );
  const [optimisticMovies, setOptimisticMovies] = useState<PersonalMovie[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(10);

  const mergedMovies = [...optimisticMovies, ...(moviesQuery.data || [])];
  const filteredMovies = mergedMovies.filter(
    (movie) => movie.status === filter,
  );

  const maxInitialItems = canEdit ? 11 : 12;
  const hasMore = filteredMovies.length > maxInitialItems;
  const displayedMovies = isExpanded
    ? filteredMovies
    : filteredMovies.slice(0, maxInitialItems);
  const mobileMovieLimit = canEdit
    ? Math.max(0, mobileVisibleCount - 1)
    : mobileVisibleCount;
  const mobileDisplayedMovies = filteredMovies.slice(0, mobileMovieLimit);
  const mobileHasMore = filteredMovies.length > mobileDisplayedMovies.length;
  const isPublicLocked = publicReadOnly && filter !== "watched";

  const handleToggleStatus = (
    movie: PersonalMovie,
    nextStatus: "watchlist" | "watched",
  ) => {
    updateStatusMutation.mutate({ id: movie.id, status: nextStatus });
  };

  const handleAddMovie = async (
    movie: Omit<PersonalMovie, "id" | "user_id" | "created_at">,
  ) => {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMovie: PersonalMovie = {
      id: optimisticId,
      user_id: userId,
      created_at: new Date().toISOString(),
      ...movie,
    };

    setOptimisticMovies((prev) => [optimisticMovie, ...prev]);
    try {
      await addMovieMutation.mutateAsync(movie);
    } finally {
      setOptimisticMovies((prev) =>
        prev.filter((item) => item.id !== optimisticId),
      );
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border-b border-[#111] pb-4">
        <h2 className="text-xl md:text-2xl font-light tracking-widest text-brand-gold">
          FILMES
        </h2>
        <div className="flex items-center gap-4 text-xs md:text-sm tracking-widest font-light uppercase mt-1 md:mt-0">
          <button
            onClick={() => setFilter("watched")}
            className={clsx(
              "transition-colors pb-1",
              filter === "watched"
                ? "text-brand-gold border-b border-brand-gold"
                : "text-brand-text-muted hover:text-brand-text",
            )}
          >
            Vistos
          </button>
          <span className="text-[#333]">|</span>
          <button
            onClick={() => setFilter("watchlist")}
            className={clsx(
              "transition-colors pb-1",
              filter === "watchlist"
                ? "text-brand-gold border-b border-brand-gold"
                : "text-brand-text-muted hover:text-brand-text",
            )}
          >
            Watchlist
          </button>
        </div>
      </div>

      {moviesQuery.isLoading ? (
        <div className="flex justify-center items-center py-20 text-brand-gold-alt opacity-50">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : isPublicLocked ? (
        <div className="rounded-2xl border border-brand-gold/25 bg-brand-gold/[0.04] px-6 py-12 text-center text-sm text-brand-text-muted">
          Para visualização completa,{" "}
          <button
            type="button"
            onClick={() => setLocation("/login")}
            className="text-brand-gold hover:underline"
          >
            entre
          </button>{" "}
          ou{" "}
          <button
            type="button"
            onClick={() => setLocation("/cadastro")}
            className="text-brand-gold hover:underline"
          >
            crie sua conta
          </button>
          .
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {canEdit && (
              <AddMovieDialog
                mode="personal"
                layout="grid"
                isPending={addMovieMutation.isPending}
                defaultStatus={filter}
                onSubmit={handleAddMovie}
              />
            )}
            {mobileDisplayedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                layout="grid"
                canEdit={canEdit}
                showPlatformSelector
                currentUserId={currentUserId}
                onToggleStatus={(selectedMovie, nextStatus) =>
                  handleToggleStatus(selectedMovie, nextStatus)
                }
                onDelete={(selectedMovie) =>
                  deleteMovieMutation.mutate(selectedMovie.id)
                }
                onPlatformChange={(selectedMovie, platformId) =>
                  updatePlatformMutation.mutate({
                    id: selectedMovie.id,
                    platform: platformId,
                  })
                }
                onRate={async (selectedMovie, stars, review) =>
                  rateMutation.mutateAsync({
                    actorUserId: currentUserId,
                    movieId: selectedMovie.id,
                    movieTitle: selectedMovie.titulo,
                    stars,
                    review,
                  })
                }
                isPending={movie.id.startsWith("optimistic-")}
              />
            ))}
            {mobileHasMore && (
              <button
                type="button"
                onClick={() => setMobileVisibleCount((count) => count + 10)}
                className="mt-1 border border-brand-gold bg-black px-4 py-3 text-xs uppercase tracking-widest text-white transition hover:bg-brand-gold/10"
              >
                Ver mais
              </button>
            )}
          </div>

          <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-x-6 md:gap-y-8">
            {canEdit ? (
              <div className="flex">
                <AddMovieDialog
                  mode="personal"
                  layout="grid"
                  isPending={addMovieMutation.isPending}
                  defaultStatus={filter}
                  onSubmit={handleAddMovie}
                />
              </div>
            ) : null}

            {displayedMovies.map((movie) => (
              <div key={movie.id} className="min-w-0 w-full">
                <MovieCard
                  movie={movie}
                  layout="grid"
                  canEdit={canEdit}
                  showPlatformSelector
                  currentUserId={currentUserId}
                  onToggleStatus={(selectedMovie, nextStatus) => {
                    if ("user_id" in selectedMovie) {
                      handleToggleStatus(selectedMovie, nextStatus);
                    }
                  }}
                  onDelete={(selectedMovie) =>
                    deleteMovieMutation.mutate(selectedMovie.id)
                  }
                  onPlatformChange={(selectedMovie, platformId) =>
                    updatePlatformMutation.mutate({
                      id: selectedMovie.id,
                      platform: platformId,
                    })
                  }
                  onRate={async (selectedMovie, stars, review) => {
                    await rateMutation.mutateAsync({
                      actorUserId: currentUserId,
                      movieId: selectedMovie.id,
                      movieTitle: selectedMovie.titulo,
                      stars,
                      review,
                    });
                  }}
                  isPending={movie.id.startsWith("optimistic-")}
                />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="hidden md:flex justify-center mt-6">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs uppercase tracking-widest text-brand-text-muted hover:text-brand-gold transition-colors py-2 px-4 bg-transparent border-none cursor-pointer focus:outline-none"
              >
                {isExpanded ? "recolher" : "mostrar todos"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
