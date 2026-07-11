import { useQuery } from '@tanstack/react-query';
import { listUserActivity } from '../lib/appData';

export function useUserActivity(userIds: string[] | null) {
  return useQuery({
    queryKey: ['user-activity', userIds?.join(',')],
    queryFn: () => listUserActivity(userIds as string[], 20),
    enabled: Boolean(userIds && userIds.length > 0),
    staleTime: 30_000,
    refetchInterval: 10_000, // Polling: refetch every 10 seconds
    refetchIntervalInBackground: false, // Only poll when window is focused
  });
}
