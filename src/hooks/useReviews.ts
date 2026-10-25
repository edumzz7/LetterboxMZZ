import { createReviewComment, listReviewComments } from '../lib/appData';
import type { InfiniteData } from '@tanstack/react-query';
import { setReviewReaction } from '../lib/appData';
import type { PublicReviewsPage, ReviewReaction } from '../lib/appData';
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

export function useReviewReactionMutation(reviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reaction: ReviewReaction | null) => setReviewReaction(reviewId, reaction),
    onMutate: () => queryClient.cancelQueries({ queryKey: ['reviews', 'public'] }),
    onSuccess: async (summary) => {
      queryClient.setQueriesData<InfiniteData<PublicReviewsPage>>(
        { queryKey: ['reviews', 'public'] },
        (previous) => previous && ({
          ...previous,
          pages: previous.pages.map((page) => ({
            ...page,
            items: page.items.map((review) => review.id === reviewId ? { ...review, ...summary } : review),
          })),
        }),
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reviews', 'public'] }),
        queryClient.invalidateQueries({ queryKey: ['user-activity'] }),
      ]);
    },
  });
}

export function useReviewComments(reviewId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['reviews', 'comments', reviewId],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => listReviewComments(reviewId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}

export function useCreateReviewCommentMutation(reviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createReviewComment(reviewId, content),
    onSuccess: async ({ commentCount }) => {
      await queryClient.cancelQueries({ queryKey: ['reviews', 'public'] });
      queryClient.setQueriesData<InfiniteData<PublicReviewsPage>>(
        { queryKey: ['reviews', 'public'] },
        (previous) => previous && ({
          ...previous,
          pages: previous.pages.map((page) => ({
            ...page,
            items: page.items.map((review) => review.id === reviewId ? { ...review, commentCount } : review),
          })),
        }),
      );
      await Promise.all([
        queryClient.resetQueries({ queryKey: ['reviews', 'comments', reviewId] }),
        queryClient.invalidateQueries({ queryKey: ['user-activity'] }),
        queryClient.invalidateQueries({ queryKey: ['reviews', 'public'] }),
      ]);
    },
  });
}
