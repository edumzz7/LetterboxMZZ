import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteReview, listMediaReviews, listUserReviews } from '../lib/appData';

export function useMediaReviews(providerExternalId: string | null, type: 'movie' | 'series') {
  return useQuery({
    queryKey: ['reviews', 'media', providerExternalId, type],
    queryFn: () => listMediaReviews(providerExternalId!, type),
    enabled: Boolean(providerExternalId),
  });
}

export function useUserReviews(userId: string | null) {
  return useQuery({
    queryKey: ['reviews', 'user', userId],
    queryFn: () => listUserReviews(userId!),
    enabled: Boolean(userId),
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      // Invalidate all review queries to refetch updated data
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
