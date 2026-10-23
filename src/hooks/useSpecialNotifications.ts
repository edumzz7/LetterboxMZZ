import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listSpecialNotifications,
  markAllSpecialNotificationsRead,
  markSpecialNotificationRead,
} from '../lib/groups';

export const SPECIAL_NOTIFICATIONS_QUERY_KEY = 'special-notifications';

export function useSpecialNotifications(enabled = true) {
  const queryClient = useQueryClient();
  const queryKey = [SPECIAL_NOTIFICATIONS_QUERY_KEY];

  const query = useQuery({
    queryKey,
    queryFn: () => listSpecialNotifications(20),
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey });

  const markRead = useMutation({
    mutationFn: markSpecialNotificationRead,
    onSettled: invalidate,
  });
  const markAllRead = useMutation({
    mutationFn: markAllSpecialNotificationsRead,
    onSettled: invalidate,
  });

  return {
    notifications: query.data?.items ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
  };
}
