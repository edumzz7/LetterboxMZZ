import type { FavoriteGenreOption } from "../types";
import { FAVORITE_GENRE_BY_KEY } from "../utils/constants";

export const useFavoriteGenre = () => {
  function getFavoriteGenre(value?: string | null): FavoriteGenreOption | null {
    if (!value) return null;
    return FAVORITE_GENRE_BY_KEY.get(value) || null;
  }

  function getFavoriteGenreLabel(value?: string | null): string | null {
    return getFavoriteGenre(value)?.label || value || null;
  }
  return { getFavoriteGenreLabel, getFavoriteGenre };
};
