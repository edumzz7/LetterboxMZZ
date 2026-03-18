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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['oscar-movies'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['activities'] }),
      ]);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ movie, status }: { movie: OscarMovie; status: MovieStatus }) =>
      setOscarMovieStatus(userId as string, movie, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['oscar-movies', userId] }),
        queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['activities'] }),
      ]);
    },
  });

  const updatePlatformMutation = useMutation({
    mutationFn: ({ movieId, platform }: { movieId: string; platform: string }) =>
      updateOscarMoviePlatform(movieId, platform),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['oscar-movies', userId] });
    },
  });

  return { moviesQuery, addMovieMutation, updateStatusMutation, updatePlatformMutation };
}

export type { OscarMovieWithStatus };
