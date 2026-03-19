import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addOscarMovie, getOscarMoviesForUser, setOscarMovieStatus, updateOscarMoviePlatform } from '../lib/appData';
import type { OscarMovie, OscarMovieWithStatus, MovieStatus } from '../types/app';

export function useOscarMovies(userId: string | null) {
  const queryClient = useQueryClient();

  const moviesQuery = useQuery({
    queryKey: ['oscar-movies', userId],
    queryFn: () => getOscarMoviesForUser(userId as string),
    enabled: Boolean(userId),
  });

  const addMovieMutation = useMutation({
    mutationFn: (movie: Omit<OscarMovie, 'id'>) => addOscarMovie(userId as string, movie),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['oscar-movies'] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ movie, status }: { movie: OscarMovie; status: MovieStatus }) =>
      setOscarMovieStatus(userId as string, movie, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['oscar-movies', userId] });
      void queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const updatePlatformMutation = useMutation({
    mutationFn: ({ movieId, platform }: { movieId: string; platform: string }) =>
      updateOscarMoviePlatform(movieId, platform),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['oscar-movies', userId] });
    },
  });

  return { moviesQuery, addMovieMutation, updateStatusMutation, updatePlatformMutation };
}

export type { OscarMovieWithStatus };
