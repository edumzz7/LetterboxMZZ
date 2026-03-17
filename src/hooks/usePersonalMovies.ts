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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
    },
  });

  const updatePlatformMutation = useMutation({
    mutationFn: ({ id, platform }: { id: string; platform: string }) =>
      updatePersonalMovie(id, { plataforma_slug: platform }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MovieStatus }) =>
      updatePersonalMovie(id, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
    },
  });

  const deleteMovieMutation = useMutation({
    mutationFn: deletePersonalMovie,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
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
