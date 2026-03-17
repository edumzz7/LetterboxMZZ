import { useState } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { usePersonalMovies } from '../../hooks/usePersonalMovies';
import type { PersonalMovie } from '../../types/app';
import AddMovieDialog from './AddMovieDialog';
import MovieCard from './MovieCard';

interface PersonalMoviesSectionProps {
  userId: string;
  canEdit: boolean;
}

export default function PersonalMoviesSection({
  userId,
  canEdit,
}: PersonalMoviesSectionProps) {
  const { moviesQuery, addMovieMutation, updatePlatformMutation, updateStatusMutation, deleteMovieMutation } =
    usePersonalMovies(userId);
  const [filter, setFilter] = useState<'watchlist' | 'watched'>('watchlist');

  const filteredMovies = (moviesQuery.data || []).filter((movie) => movie.status === filter);

  const handleToggleStatus = (movie: PersonalMovie, nextStatus: 'watchlist' | 'watched') => {
    updateStatusMutation.mutate({ id: movie.id, status: nextStatus });
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border-b border-[#111] pb-4">
        <h2 className="text-xl md:text-2xl font-light tracking-widest text-brand-gold">FILMES</h2>

        <div className="flex items-center gap-4 text-xs md:text-sm tracking-widest font-light uppercase mt-1 md:mt-0">
          <button
            onClick={() => setFilter('watched')}
            className={clsx(
              'transition-colors pb-1',
              filter === 'watched'
                ? 'text-brand-gold border-b border-brand-gold'
                : 'text-brand-text-muted hover:text-brand-text',
            )}
          >
            Vistos
          </button>
          <span className="text-[#333]">|</span>
          <button
            onClick={() => setFilter('watchlist')}
            className={clsx(
              'transition-colors pb-1',
              filter === 'watchlist'
                ? 'text-brand-gold border-b border-brand-gold'
                : 'text-brand-text-muted hover:text-brand-text',
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
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-x-6 md:gap-y-8">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="min-w-0 w-full">
              <MovieCard
                movie={movie}
                layout="grid"
                canEdit={canEdit}
                showPlatformSelector
                onToggleStatus={(selectedMovie, nextStatus) => {
                  if ('user_id' in selectedMovie) {
                    handleToggleStatus(selectedMovie, nextStatus);
                  }
                }}
                onDelete={(selectedMovie) => deleteMovieMutation.mutate(selectedMovie.id)}
                onPlatformChange={(selectedMovie, platformId) =>
                  updatePlatformMutation.mutate({ id: selectedMovie.id, platform: platformId })
                }
              />
            </div>
          ))}

          {canEdit ? (
            <div className="flex">
              <AddMovieDialog
                mode="personal"
                layout="grid"
                isPending={addMovieMutation.isPending}
                onSubmit={(movie) => addMovieMutation.mutateAsync(movie)}
              />
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
