import { useQuery } from '@tanstack/react-query';
import { listUserActivity } from '../lib/appData';

export function useUserActivity(userId: string | null) {
  return useQuery({
    queryKey: ['user-activity', userId],
    queryFn: () => listUserActivity(userId as string, 20),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}
