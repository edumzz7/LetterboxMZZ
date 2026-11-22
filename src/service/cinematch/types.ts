export interface CineMatchCandidate {
  id: number;
  title: string;
  posterPath: string;
  genreIds: number[];
}

export interface WatchedSeed {
  id: number;
  watchedAt: string;
}
