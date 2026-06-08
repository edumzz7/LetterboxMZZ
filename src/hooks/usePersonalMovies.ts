import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addPersonalMovie,
  deletePersonalMovie,
  listPersonalMovies,
  updatePersonalMovie,
} from '../lib/appData';
import type { PersonalMovie, MovieStatus } from '../types/app';

export function usePersonalMovies(userId: string | null) {
  const queryClient = useQueryClient();

  const moviesQuery = useQuery({
    queryKey: ['personal-movies', userId],
    queryFn: () => listPersonalMovies(userId as string),
    enabled: Boolean(userId),
  });

  const addMovieMutation = useMutation({
    mutationFn: (movie: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'>) =>
      addPersonalMovie(userId as string, movie),
    onSuccess: (_data, movie) => {
      void queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
      if (movie.status === 'watched') {
        void queryClient.invalidateQueries({ queryKey: ['users'] });
        void queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      }
    },
  });

  const updatePlatformMutation = useMutation({
    mutationFn: ({ id, platform }: { id: string; platform: string }) =>
      updatePersonalMovie(id, { plataforma_slug: platform }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MovieStatus }) =>
      updatePersonalMovie(id, { status }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
      if (variables.status === 'watched') {
        void queryClient.invalidateQueries({ queryKey: ['users'] });
        void queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      }
    },
  });

  const deleteMovieMutation = useMutation({
    mutationFn: deletePersonalMovie,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
    },
  });

  return {
    moviesQuery,
    addMovieMutation,
    updatePlatformMutation,
    updateStatusMutation,
    deleteMovieMutation,
  };
}
