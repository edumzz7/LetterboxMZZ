import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addFavoritePerson, listFavoritePeople, removeFavoritePerson } from '../lib/appData';
import type { UserFavoritePerson } from '../types/app';

export const FAVORITE_PEOPLE_QUERY_KEY = 'favorite_people';
export const MAX_FAVORITE_PEOPLE = 25;

export type FavoritePersonInput = Pick<UserFavoritePerson, 'tmdbPersonId' | 'name' | 'profilePath' | 'department'>;

/** Lista pública de artistas favoritos de qualquer usuário. */
export function useUserFavoritePeople(userId: string | null | undefined) {
  return useQuery({
    queryKey: [FAVORITE_PEOPLE_QUERY_KEY, userId],
    queryFn: () => listFavoritePeople(userId as string),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });
}

/** Artistas favoritos do usuário logado, com ação de favoritar/desfavoritar. */
export function useFavoritePeople(currentUserId: string | null | undefined) {
  const queryClient = useQueryClient();
  const queryKey = [FAVORITE_PEOPLE_QUERY_KEY, currentUserId];
  const { data: favorites = [], isLoading } = useUserFavoritePeople(currentUserId);

  const isFavorited = (tmdbPersonId: number) => favorites.some((item) => item.tmdbPersonId === tmdbPersonId);
  const isLimitReached = favorites.length >= MAX_FAVORITE_PEOPLE;

  const toggleMutation = useMutation({
    mutationFn: async ({ person, isFavorite }: { person: FavoritePersonInput; isFavorite: boolean }) => {
      if (isFavorite) {
        await removeFavoritePerson(person.tmdbPersonId);
        return null;
      }
      return addFavoritePerson(person);
    },
    onMutate: async ({ person, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<UserFavoritePerson[]>(queryKey) ?? [];

      queryClient.setQueryData<UserFavoritePerson[]>(queryKey, (old = []) => (
        isFavorite
          ? old.filter((item) => item.tmdbPersonId !== person.tmdbPersonId)
          : [{ ...person, id: `temp-${person.tmdbPersonId}`, createdAt: new Date().toISOString() }, ...old]
      ));

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ['user-activity'] });
    },
  });

  return {
    favorites,
    isLoading,
    isFavorited,
    isLimitReached,
    toggle: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
    error: toggleMutation.error,
    resetError: toggleMutation.reset,
  };
}
