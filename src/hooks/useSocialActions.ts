import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PersonalMovie } from '../types/app';
import { rateMovie } from '../lib/appData';

export function useSocialActions() {
  const queryClient = useQueryClient();

  const rateMutation = useMutation({
    mutationFn: ({
      actorUserId,
      movieId,
      movieTitle,
      stars,
      review,
    }: {
      actorUserId: string;
      movieId: string;
      movieTitle: string;
      stars: number;
      review?: string | null;
    }) => rateMovie(actorUserId, movieId, movieTitle, stars, review),
    onSuccess: (_data, variables) => {
      queryClient.setQueriesData<PersonalMovie[]>(
        { queryKey: ['personal-movies'] },
        (current) =>
          Array.isArray(current)
            ? current.map((movie) =>
                movie.id === variables.movieId
                  ? {
                      ...movie,
                      avaliacao: variables.stars,
                      rating: variables.stars,
                      review: variables.review !== undefined ? variables.review : movie.review,
                    }
                  : movie,
              )
            : current,
      );
    },
  });

  return { rateMutation };
}
