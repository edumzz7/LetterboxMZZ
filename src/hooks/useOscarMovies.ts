import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addOscarMovie, getOscarMoviesForUser, setOscarMovieStatus } from '../lib/appData';
import type { OscarMovie, OscarMovieWithStatus, MovieStatus } from '../types/app';

export function useOscarMovies(userId: string | null) {
  const queryClient = useQueryClient();

  const moviesQuery = useQuery({
    queryKey: ['oscar-movies', userId],
    queryFn: () => getOscarMoviesForUser(userId as string),
    enabled: Boolean(userId),
  });

  const addMovieMutation = useMutation({
    mutationFn: (movie: Omit<OscarMovie, 'id'>) => addOscarMovie(movie),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['oscar-movies'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ movie, status }: { movie: OscarMovie; status: MovieStatus }) =>
      setOscarMovieStatus(userId as string, movie, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['oscar-movies', userId] }),
        queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] }),
      ]);
    },
  });

  return { moviesQuery, addMovieMutation, updateStatusMutation };
}

export type { OscarMovieWithStatus };
