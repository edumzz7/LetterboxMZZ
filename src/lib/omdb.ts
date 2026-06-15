const OMDB_API_KEY = '74c4d1ca';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

export interface OMDBMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: {
    Source: string;
    Value: string;
  }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

export async function fetchOMDBByImdbId(imdbId: string): Promise<OMDBMovie | null> {
  try {
    const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch from OMDB');
      return null;
    }
    const data = await response.json();
    if (data.Response === 'False') return null;
    return data;
  } catch (error) {
    console.error('Error fetching from OMDB:', error);
    return null;
  }
}

export async function fetchOMDBByTitle(title: string, year?: string): Promise<OMDBMovie | null> {
  try {
    let url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}`;
    if (year) {
      url += `&y=${year}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch from OMDB by title');
      return null;
    }
    const data = await response.json();
    if (data.Response === 'False') return null;
    return data;
  } catch (error) {
    console.error('Error fetching from OMDB by title:', error);
    return null;
  }
}
