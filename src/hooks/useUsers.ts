import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listRankedUsers, updateUserAvatar, uploadAvatarImage } from '../lib/appData';

export function useUsers(isAuthenticated: boolean = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: listRankedUsers,
    staleTime: 1000 * 30, // 30 seconds – avoids redundant refetches during mount cascade
    enabled: isAuthenticated,
  });
}

export function useAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, avatarId }: { userId: string; avatarId: string }) =>
      updateUserAvatar(userId, avatarId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useAvatarUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatarImage(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
