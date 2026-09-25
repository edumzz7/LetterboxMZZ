import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteReview, listMediaReviews, listPublicReviews, listUserReviews } from '../lib/appData';

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

export function usePublicReviews(authorIds?: string[], enabled = true) {
  return useInfiniteQuery({
    queryKey: ['reviews', 'public', authorIds || 'all'],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => listPublicReviews(pageParam, authorIds),
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled,
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
