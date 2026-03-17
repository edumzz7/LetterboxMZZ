import useEmblaCarousel from 'embla-carousel-react';
import { Loader2 } from 'lucide-react';
import { useOscarMovies } from '../../hooks/useOscarMovies';
import type { OscarMovieWithStatus } from '../../types/app';
import AddMovieDialog from './AddMovieDialog';
import MovieCard from './MovieCard';

interface MoviesSectionProps {
  userId: string;
  canEdit: boolean;
  canAddOscarMovie: boolean;
}

export default function MoviesSection({
  userId,
  canEdit,
  canAddOscarMovie,
}: MoviesSectionProps) {
  const { moviesQuery, addMovieMutation, updateStatusMutation } = useOscarMovies(userId);
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const handleToggleStatus = (movie: OscarMovieWithStatus, nextStatus: 'watchlist' | 'watched') => {
    updateStatusMutation.mutate({ movie, status: nextStatus });
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center">
        <h2 className="text-xl md:text-2xl font-light tracking-widest text-brand-gold">
          FILMES INDICADOS AO OSCAR
        </h2>
        <div className="ml-4 h-[1px] bg-[#222] flex-grow" />
      </div>

      {moviesQuery.isLoading ? (
        <div className="flex justify-center items-center py-20 text-brand-gold-alt opacity-50">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6 items-stretch">
              {(moviesQuery.data || []).map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  canEdit={canEdit}
                  showPlatformSelector={false}
                  onToggleStatus={(selectedMovie, nextStatus) => {
                    if ('ano_oscar' in selectedMovie) {
                      handleToggleStatus(selectedMovie, nextStatus);
                    }
                  }}
                />
              ))}
              {canAddOscarMovie ? (
                <AddMovieDialog
                  mode="oscar"
                  isPending={addMovieMutation.isPending}
                  onSubmit={(movie) => addMovieMutation.mutateAsync(movie)}
                />
              ) : null}
            </div>
          </div>

          <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-brand-bg to-transparent pointer-events-none z-10" />
        </div>
      )}
    </section>
  );
}
