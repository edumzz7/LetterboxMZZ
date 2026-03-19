import { useMutation, useQueryClient } from '@tanstack/react-query';
import { suggestMovieToUser } from '../lib/appData';
import type { PersonalMovie } from '../types/app';

export function useSuggestMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fromUserId,
      toUserId,
      movie,
    }: {
      fromUserId: string;
      toUserId: string;
      movie: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'>;
    }) => suggestMovieToUser(fromUserId, toUserId, movie),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
      void queryClient.invalidateQueries({ queryKey: ['personal-movies'] });
    },
  });
}
