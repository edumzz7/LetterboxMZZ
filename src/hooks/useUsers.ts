import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listRankedUsers, updateUserAvatar } from '../lib/appData';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: listRankedUsers,
  });
}

export function useAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, avatarId }: { userId: string; avatarId: string }) =>
      updateUserAvatar(userId, avatarId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
