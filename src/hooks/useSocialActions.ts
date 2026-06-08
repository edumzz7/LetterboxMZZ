import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PersonalMovie } from '../types/app';
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
    onSuccess: (_data, variables) => {
      queryClient.setQueriesData<PersonalMovie[]>(
        { queryKey: ['personal-movies'] },
        (current) =>
          Array.isArray(current)
            ? current.map((movie) =>
                movie.id === variables.movieId ? { ...movie, avaliacao: variables.stars, rating: variables.stars } : movie,
              )
            : current,
      );
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
    onSuccess: (_data, variables) => {
      if (variables.targetUserId === variables.actorUserId) {
        void queryClient.invalidateQueries({ queryKey: ['notifications', variables.actorUserId] });
      }
    },
  });

  return { rateMutation, reactMutation };
}
