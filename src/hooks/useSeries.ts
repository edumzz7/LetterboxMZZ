import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addSeries, deleteSeries, getSeriesStatus, listSeries, rateSeries, updateSeries } from '../lib/appData';
import type { SeriesEntry, SeriesStatus } from '../types/app';

export function useSeries(userId: string | null) {
  const queryClient = useQueryClient();

  const seriesQuery = useQuery({
    queryKey: ['series', userId],
    queryFn: () => listSeries(userId as string),
    enabled: Boolean(userId),
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({
      id,
      episodios_vistos,
      temporada,
      total_episodios,
      status,
      plataforma_slug,
      avaliacao,
    }: {
      id: string;
      episodios_vistos?: number;
      temporada?: number;
      total_episodios?: number;
      status?: SeriesStatus;
      plataforma_slug?: string;
      avaliacao?: number;
    }) => {
      const nextStatus =
        status ??
        (episodios_vistos !== undefined && total_episodios !== undefined
          ? getSeriesStatus(episodios_vistos, total_episodios)
          : undefined);

      return updateSeries(id, {
        episodios_vistos,
        temporada,
        total_episodios,
        status: nextStatus,
        plataforma_slug,
        avaliacao,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['series', userId] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const addSeriesMutation = useMutation({
    mutationFn: (newSeries: Omit<SeriesEntry, 'id' | 'user_id' | 'created_at'>) =>
      addSeries(userId as string, newSeries),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['series', userId] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const deleteSeriesMutation = useMutation({
    mutationFn: deleteSeries,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['series', userId] });
    },
  });

  const rateSeriesMutation = useMutation({
    mutationFn: ({ actorUserId, seriesId, stars }: { actorUserId: string; seriesId: string; stars: number }) =>
      rateSeries(actorUserId, seriesId, stars),
    onSuccess: (_data, variables) => {
      queryClient.setQueriesData<SeriesEntry[]>(
        { queryKey: ['series'] },
        (current) =>
          Array.isArray(current)
            ? current.map((series) =>
                series.id === variables.seriesId ? { ...series, avaliacao: variables.stars } : series,
              )
            : current,
      );
    },
  });

  return { seriesQuery, updateProgressMutation, addSeriesMutation, deleteSeriesMutation, rateSeriesMutation };
}

export type Series = SeriesEntry;
