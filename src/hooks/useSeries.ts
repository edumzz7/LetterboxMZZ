import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addSeries, deleteSeries, getSeriesStatus, listSeries, updateSeries } from '../lib/appData';
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
    }: {
      id: string;
      episodios_vistos?: number;
      temporada?: number;
      total_episodios?: number;
      status?: SeriesStatus;
      plataforma_slug?: string;
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
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['series', userId] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['activities'] }),
      ]);
    },
  });

  const addSeriesMutation = useMutation({
    mutationFn: (newSeries: Omit<SeriesEntry, 'id' | 'user_id' | 'created_at'>) =>
      addSeries(userId as string, newSeries),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['series', userId] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['activities'] }),
      ]);
    },
  });

  const deleteSeriesMutation = useMutation({
    mutationFn: deleteSeries,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['series', userId] });
    },
  });

  return { seriesQuery, updateProgressMutation, addSeriesMutation, deleteSeriesMutation };
}

export type Series = SeriesEntry;
