export interface FavoriteGenreOption {
  key: string;
  label: string;
  movieGenreIds: number[];
  tvGenreIds: number[];
  match: 'direct' | 'approximate';
}

/**
 * The profile stores the CineRats key, not a provider-specific genre name.
 * Only genres that can be used for both movies and TV are exposed here.
 */
export const FAVORITE_GENRES: FavoriteGenreOption[] = [
  { key: 'action-adventure', label: 'Ação e aventura', movieGenreIds: [28, 12], tvGenreIds: [10759], match: 'approximate' },
  { key: 'animation', label: 'Animação', movieGenreIds: [16], tvGenreIds: [16], match: 'direct' },
  { key: 'comedy', label: 'Comédia', movieGenreIds: [35], tvGenreIds: [35], match: 'direct' },
  { key: 'crime', label: 'Crime', movieGenreIds: [80], tvGenreIds: [80], match: 'direct' },
  { key: 'documentary', label: 'Documentário', movieGenreIds: [99], tvGenreIds: [99], match: 'direct' },
  { key: 'drama', label: 'Drama', movieGenreIds: [18], tvGenreIds: [18], match: 'direct' },
  { key: 'family', label: 'Família', movieGenreIds: [10751], tvGenreIds: [10751], match: 'direct' },
  { key: 'mystery', label: 'Mistério', movieGenreIds: [9648], tvGenreIds: [9648], match: 'direct' },
  { key: 'science-fiction-fantasy', label: 'Ficção científica e fantasia', movieGenreIds: [14, 878], tvGenreIds: [10765], match: 'approximate' },
  { key: 'war-politics', label: 'Guerra e política', movieGenreIds: [10752], tvGenreIds: [10768], match: 'approximate' },
  { key: 'western', label: 'Faroeste', movieGenreIds: [37], tvGenreIds: [37], match: 'direct' },
];

const FAVORITE_GENRE_BY_KEY = new Map(FAVORITE_GENRES.map((genre) => [genre.key, genre]));

export function getFavoriteGenre(value?: string | null): FavoriteGenreOption | null {
  if (!value) return null;
  return FAVORITE_GENRE_BY_KEY.get(value) || null;
}

export function getFavoriteGenreLabel(value?: string | null): string | null {
  return getFavoriteGenre(value)?.label || value || null;
}
