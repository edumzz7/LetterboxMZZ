import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addPersonalMovie,
  deletePersonalMovie,
  listPersonalMovies,
  updatePersonalMovie,
} from '../lib/appData';
import type { PersonalMovie, MovieStatus } from '../types/app';
import { completeWatchParty, listActiveWatchParties } from '../lib/watchParties';

export function usePersonalMovieMutations(userId: string | null) {
  const queryClient = useQueryClient();

  const addMovieMutation = useMutation({
    mutationFn: async (movie: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'>) => {
      if (movie.status === 'watched' && movie.source_movie_id) {
        const active = await listActiveWatchParties('movie', movie.source_movie_id);
        if (active.length) {
          await Promise.all(active.map((party) => completeWatchParty(party.id, movie.is_retroactive ?? false)));
          return undefined;
        }
      }
      return addPersonalMovie(userId as string, movie);
    },
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.setQueryData(['personal-movies', userId], (old: PersonalMovie[] = []) => [data, ...old]);
      } else {
        void queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
      }
      if (variables.status === 'watched' && !variables.is_retroactive) {
        void queryClient.invalidateQueries({ queryKey: ['users'] });
      }
      void queryClient.invalidateQueries({ queryKey: ['watchparties'] });
    },
  });

  const updatePlatformMutation = useMutation({
    mutationFn: ({ id, platform }: { id: string; platform: string }) =>
      updatePersonalMovie(id, { plataforma_slug: platform }),
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.setQueryData(['personal-movies', userId], (old: PersonalMovie[] = []) =>
          old.map((m) => (m.id === variables.id ? { ...m, ...data } : m))
        );
      } else {
        void queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
      }
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, is_retroactive }: { id: string; status: MovieStatus; is_retroactive?: boolean }) => {
      const cached = queryClient.getQueryData<PersonalMovie[]>(['personal-movies', userId]);
      const movie = cached?.find((item) => item.id === id);
      if (status === 'watched' && movie?.source_movie_id) {
        const active = await listActiveWatchParties('movie', movie.source_movie_id);
        if (active.length) {
          await Promise.all(active.map((party) => completeWatchParty(party.id, is_retroactive ?? false)));
          return undefined;
        }
      }
      return updatePersonalMovie(id, { status, is_retroactive }, userId);
    },
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.setQueryData(['personal-movies', userId], (old: PersonalMovie[] = []) =>
          old.map((m) => {
            if (m.id !== variables.id) return m;
            const merged = { ...m, ...data };
            if (!data.user_id) merged.user_id = m.user_id;
            if (!data.titulo) merged.titulo = m.titulo;
            if (!data.capa_url) merged.capa_url = m.capa_url;
            return merged;
          })
        );
      } else {
        void queryClient.invalidateQueries({ queryKey: ['personal-movies', userId] });
      }
      if (variables.status === 'watched') {
        void queryClient.invalidateQueries({ queryKey: ['users'] });
      }
      void queryClient.invalidateQueries({ queryKey: ['watchparties'] });
    },
  });

  const deleteMovieMutation = useMutation({
    mutationFn: deletePersonalMovie,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData(['personal-movies', userId], (old: PersonalMovie[] = []) =>
        old.filter((m) => m.id !== deletedId)
      );
    },
  });

  return {
    addMovieMutation,
    updatePlatformMutation,
    updateStatusMutation,
    deleteMovieMutation,
  };
}

export function usePersonalMoviesQuery(userId: string | null) {
  return useQuery({
    queryKey: ['personal-movies', userId],
    queryFn: () => listPersonalMovies(userId as string),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2, // 2 minutos - reduz requisições mantendo dados frescos
    refetchOnWindowFocus: true, // Atualiza ao voltar para a aba
    refetchInterval: 30000,
  });
}

export function usePersonalMovies(userId: string | null) {
  const moviesQuery = usePersonalMoviesQuery(userId);
  const mutations = usePersonalMovieMutations(userId);

  return {
    moviesQuery,
    ...mutations,
  };
}
