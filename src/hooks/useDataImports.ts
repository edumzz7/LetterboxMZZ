import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadDataImport, listUserImports, getImportStatusById, type DataImport, type DataImportPlatform } from '../lib/appData';

export const isActiveImport = (item?: DataImport) => Boolean(item && item.status !== 'done' && item.status !== 'failed');

export function useDataImports(userId: string) {
  const client = useQueryClient();
  const history = useQuery({
    queryKey: ['data-imports', userId], queryFn: listUserImports,
    retry: false, refetchOnWindowFocus: false,
    refetchInterval: query => query.state.data?.some(isActiveImport) ? 20_000 : false,
  });
  const upload = useMutation({
    mutationFn: async ({ file, platform }: { file: File; platform: DataImportPlatform }) =>
      ({ ...await uploadDataImport(file, platform), platform } as DataImport),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['data-imports', userId] }); },
  });
  const candidate = upload.data ?? history.data?.find(isActiveImport);
  const status = useQuery({
    queryKey: ['data-import-status', userId, candidate?.id],
    queryFn: () => getImportStatusById(candidate!.id), enabled: Boolean(candidate?.id),
    retry: false, refetchOnWindowFocus: false,
    refetchInterval: query => !query.state.data || isActiveImport(query.state.data) ? 15_000 : false,
  });
  const currentImport = status.data ?? candidate;
  const completed = useRef<string | null>(null);
  useEffect(() => {
    if (!currentImport || isActiveImport(currentImport) || completed.current === currentImport.id) return;
    completed.current = currentImport.id;
    void client.invalidateQueries({ queryKey: ['data-imports', userId] });
    if (currentImport.status === 'done') {
      for (const key of ['personal-movies', 'series', 'reviews', 'watchlist', 'users', 'user-activity']) {
        void client.invalidateQueries({ queryKey: [key] });
      }
    }
  }, [currentImport, client, userId]);
  return { history, upload, status, currentImport };
}
