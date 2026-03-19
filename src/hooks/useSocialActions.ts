import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rateMovie, reactToMovie } from '../lib/appData';

export function useSocialActions() {
  const queryClient = useQueryClient();

  const rateMutation = useMutation({
    mutationFn: ({
      actorUserId,
      movieId,
      movieTitle,
      stars,
    }: {
      actorUserId: string;
      movieId: string;
      movieTitle: string;
      stars: number;
    }) => rateMovie(actorUserId, movieId, movieTitle, stars),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personal-movies'] });
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const reactMutation = useMutation({
    mutationFn: ({
      actorUserId,
      targetUserId,
      movieTitle,
      reaction,
    }: {
      actorUserId: string;
      targetUserId: string;
      movieTitle: string;
      reaction: string;
    }) => reactToMovie(actorUserId, targetUserId, movieTitle, reaction),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  return { rateMutation, reactMutation };
}
