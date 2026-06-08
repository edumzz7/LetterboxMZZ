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
      void queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ movie, status }: { movie: OscarMovie; status: MovieStatus }) =>
      setOscarMovieStatus(userId as string, movie, status),
    onMutate: async ({ movie, status }) => {
      await queryClient.cancelQueries({ queryKey: ['oscar-movies', userId] });
      await queryClient.cancelQueries({ queryKey: ['personal-movies', userId] });

      const previousOscarMovies = queryClient.getQueryData<OscarMovieWithStatus[]>(['oscar-movies', userId]);

      queryClient.setQueryData<OscarMovieWithStatus[]>(
        ['oscar-movies', userId],
        (current) =>
          (current ?? []).map((item) =>
            item.id === movie.id ? { ...item, status } : item,
          ),
      );

      return { previousOscarMovies };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousOscarMovies) {
        queryClient.setQueryData(['oscar-movies', userId], context.previousOscarMovies);
      }
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['oscar-movies', userId] });
      void queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
      if (variables.status === 'watched') {
        void queryClient.invalidateQueries({ queryKey: ['users'] });
        void queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      }
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
