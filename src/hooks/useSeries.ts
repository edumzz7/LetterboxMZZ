import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addSeries, deleteSeries, getSeriesStatus, listSeries, rateSeries, updateSeries } from '../lib/appData';
import type { SeriesEntry, SeriesStatus } from '../types/app';

export function useSeriesMutations(userId: string | null) {
  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async ({
      id,
      episodios_vistos,
      temporada,
      total_episodios,
      status,
      plataforma_slug,
      avaliacao,
      is_retroactive,
    }: {
      id: string;
      episodios_vistos?: number;
      temporada?: number;
      total_episodios?: number;
      status?: SeriesStatus;
      plataforma_slug?: string;
      avaliacao?: number;
      is_retroactive?: boolean;
    }) => {
      const nextStatus =
        status ??
        (episodios_vistos !== undefined && total_episodios !== undefined
          ? getSeriesStatus(episodios_vistos, total_episodios)
          : undefined);

      // Resolve source_movie_id from cache to avoid extra API call
      const cached = queryClient.getQueryData<SeriesEntry[]>(['series', userId]);
      const cachedEntry = cached?.find((s) => s.id === id);

      return updateSeries(id, {
        episodios_vistos,
        temporada,
        total_episodios,
        status: nextStatus,
        plataforma_slug,
        avaliacao,
        is_retroactive,
        source_movie_id: cachedEntry?.source_movie_id,
      });
    },
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.setQueryData(['series', userId], (old: SeriesEntry[] = []) =>
          old.map((s) => {
            if (s.id !== variables.id) return s;
            // Preserve fields that the API doesn't return
            const merged = { ...s, ...data };
            if (!merged.capa_url && s.capa_url) merged.capa_url = s.capa_url;
            if (!merged.titulo && s.titulo) merged.titulo = s.titulo;
            if (!merged.user_id && s.user_id) merged.user_id = s.user_id;
            return merged;
          })
        );
      } else {
        void queryClient.invalidateQueries({ queryKey: ['series', userId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const addSeriesMutation = useMutation({
    mutationFn: (newSeries: Omit<SeriesEntry, 'id' | 'user_id' | 'created_at'>) =>
      addSeries(userId as string, newSeries),
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(['series', userId], (old: SeriesEntry[] = []) => [data, ...old]);
      } else {
        void queryClient.invalidateQueries({ queryKey: ['series', userId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteSeriesMutation = useMutation({
    mutationFn: deleteSeries,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData(['series', userId], (old: SeriesEntry[] = []) =>
        old.filter((s) => s.id !== deletedId)
      );
    },
  });

  const rateSeriesMutation = useMutation({
    mutationFn: ({
      actorUserId,
      seriesId,
      stars,
      review,
    }: {
      actorUserId: string;
      seriesId: string;
      stars: number;
      review?: string | null;
    }) => rateSeries(actorUserId, seriesId, stars, review),
    onSuccess: (_data, variables) => {
      queryClient.setQueriesData<SeriesEntry[]>(
        { queryKey: ['series'] },
        (current) =>
          Array.isArray(current)
            ? current.map((series) =>
                series.id === variables.seriesId
                  ? {
                      ...series,
                      avaliacao: variables.stars,
                      rating: variables.stars,
                      review: variables.review !== undefined ? variables.review : series.review,
                    }
                  : series,
              )
            : current,
      );
    },
  });

  return { updateProgressMutation, addSeriesMutation, deleteSeriesMutation, rateSeriesMutation };
}

export function useSeriesQuery(userId: string | null) {
  return useQuery({
    queryKey: ['series', userId],
    queryFn: () => listSeries(userId as string),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2, // 2 minutos - reduz requisições mantendo dados frescos
    refetchOnWindowFocus: true, // Atualiza ao voltar para a aba
  });
}

export function useSeries(userId: string | null) {
  const seriesQuery = useSeriesQuery(userId);
  const mutations = useSeriesMutations(userId);

  return { seriesQuery, ...mutations };
}



export type Series = SeriesEntry;
