import { listPersonalMovies, listSeries } from './appData';
import { getMovieRecommendations, getMovieSimilar, getTvRecommendations, getTvSimilar } from './tmdb';
import type { TMDBRecommendationItem } from './tmdb';
import type { WatchPartyMediaType } from '../types/app';

export interface CineMatchCandidate {
  id: number;
  title: string;
  posterPath: string;
  genreIds: number[];
}

interface WatchedSeed {
  id: number;
  watchedAt: string;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function recentUniqueSeeds(items: WatchedSeed[]): WatchedSeed[] {
  const seen = new Set<number>();
  return items
    .filter((item) => Number.isInteger(item.id) && item.id > 0)
    .sort((a, b) => b.watchedAt.localeCompare(a.watchedAt))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 10);
}

async function getWatchedSeeds(userId: string, type: WatchPartyMediaType) {
  if (type === 'movie') {
    const movies = await listPersonalMovies(userId);
    const watched = movies
      .filter((item) => item.status === 'watched')
      .map((item) => ({ id: Number(item.source_movie_id), watchedAt: item.created_at }));
    return { seeds: recentUniqueSeeds(watched), allWatchedIds: watched.map((item) => item.id) };
  }

  const series = await listSeries(userId);
  const watched = series
    .filter((item) => item.status !== 'watchlist' && item.episodios_vistos > 0)
    .map((item) => ({ id: Number(item.source_movie_id), watchedAt: item.created_at }));
  return { seeds: recentUniqueSeeds(watched), allWatchedIds: watched.map((item) => item.id) };
}

function toCandidate(item: TMDBRecommendationItem, type: WatchPartyMediaType): CineMatchCandidate | null {
  const title = type === 'movie' ? item.title : item.name;
  if (!title || !item.poster_path || item.adult || !Number.isInteger(item.id) || item.id <= 0) return null;
  return { id: item.id, title, posterPath: item.poster_path, genreIds: item.genre_ids || [] };
}

export async function getCineMatchPool(currentUserId: string, partnerUserId: string, type: WatchPartyMediaType): Promise<CineMatchCandidate[]> {
  const [mine, partner] = await Promise.all([
    getWatchedSeeds(currentUserId, type),
    getWatchedSeeds(partnerUserId, type),
  ]);
  const seeds = [...mine.seeds, ...partner.seeds];
  const excludedIds = new Set([...mine.allWatchedIds, ...partner.allWatchedIds]);
  const related: TMDBRecommendationItem[][] = Array.from({ length: seeds.length }, () => []);
  let nextIndex = 0;

  // Limit concurrent TMDB calls; retrying a suggestion reuses this pool.
  await Promise.all(Array.from({ length: Math.min(4, seeds.length) }, async () => {
    while (nextIndex < seeds.length) {
      const index = nextIndex++;
      const [similar, recommended] = type === 'movie'
        ? await Promise.all([getMovieSimilar(seeds[index].id), getMovieRecommendations(seeds[index].id)])
        : await Promise.all([getTvSimilar(seeds[index].id), getTvRecommendations(seeds[index].id)]);
      related[index] = [...similar, ...recommended];
    }
  }));

  const chosenIds = new Set<number>();
  const pool: CineMatchCandidate[] = [];
  related.forEach((items) => {
    let addedForSeed = 0;
    for (const item of shuffle(items)) {
      if (addedForSeed === 3) break;
      const candidate = toCandidate(item, type);
      if (!candidate || excludedIds.has(candidate.id) || chosenIds.has(candidate.id)) continue;
      chosenIds.add(candidate.id);
      pool.push(candidate);
      addedForSeed++;
    }
  });
  return pool;
}

export function pickCineMatchCandidate(pool: CineMatchCandidate[], genreId: number | null, skippedIds: ReadonlySet<number>): CineMatchCandidate | null {
  const eligible = pool.filter((item) =>
    (genreId === null || item.genreIds.includes(genreId)) && !skippedIds.has(item.id),
  );
  return eligible.length ? eligible[Math.floor(Math.random() * eligible.length)] : null;
}
