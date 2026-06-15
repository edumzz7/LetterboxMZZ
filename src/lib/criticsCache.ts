import { fetchOMDBByImdbId, fetchOMDBByTitle } from './omdb';
import { createDocument, updateDocument, listDocuments, COLLECTION_USUARIOS_METADATA } from './appData';
import { Query } from 'appwrite';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface CriticItem {
  title: string;
  tmdbId: number;
  imdbId?: string;
  posterPath: string | null;
  omdbRating: number; // Mean RT + IMDb
  rtRating?: number;
  imdbRating?: number;
  genreIds: number[];
  type: 'movie' | 'series';
}

export interface CriticsCache {
  lastUpdated: string;
  topMovies: CriticItem[];
  topSeries: CriticItem[];
}

async function getTMDBTrending(type: 'movie' | 'tv'): Promise<any[]> {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const thirtyDaysAgo = date.toISOString().split('T')[0];
    
    // Using discover to get the most popular releases in the last 30 days
    const dateParam = type === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte';
    const res = await fetch(`${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=popularity.desc&${dateParam}=${thirtyDaysAgo}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Error fetching TMDB trending:', err);
    return [];
  }
}

async function getTMDBExternalIds(id: number, type: 'movie' | 'tv'): Promise<string | null> {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}/external_ids?api_key=${TMDB_API_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.imdb_id || null;
  } catch {
    return null;
  }
}

async function buildCriticsList(type: 'movie' | 'tv'): Promise<CriticItem[]> {
  const trending = await getTMDBTrending(type);
  const items: CriticItem[] = [];
  
  for (const item of trending.slice(0, 20)) {
    const imdbId = await getTMDBExternalIds(item.id, type);
    let omdbData = null;
    
    if (imdbId) {
      omdbData = await fetchOMDBByImdbId(imdbId);
    } else {
      const title = type === 'movie' ? item.title : item.name;
      const date = type === 'movie' ? item.release_date : item.first_air_date;
      const year = date ? date.split('-')[0] : undefined;
      omdbData = await fetchOMDBByTitle(title, year);
    }

    if (omdbData) {
      let rtRating = 0;
      let imdbVal = 0;

      if (omdbData.Ratings && Array.isArray(omdbData.Ratings)) {
        const rt = omdbData.Ratings.find((r: any) => r.Source === 'Rotten Tomatoes');
        if (rt && rt.Value) {
          rtRating = parseInt(rt.Value.replace('%', ''), 10);
        }
      }

      if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
        imdbVal = parseFloat(omdbData.imdbRating) * 10;
      }
      
      let finalRating = 0;
      if (rtRating > 0 && imdbVal > 0) finalRating = (rtRating + imdbVal) / 2;
      else if (rtRating > 0) finalRating = rtRating;
      else if (imdbVal > 0) finalRating = imdbVal;

      if (finalRating > 0) {
        items.push({
          title: type === 'movie' ? item.title : item.name,
          tmdbId: item.id,
          imdbId: imdbId || undefined,
          posterPath: item.poster_path,
          omdbRating: Math.round(finalRating),
          rtRating: rtRating > 0 ? rtRating : undefined,
          imdbRating: imdbVal > 0 ? Math.round(imdbVal) : undefined,
          genreIds: item.genre_ids || [],
          type: type === 'movie' ? 'movie' : 'series'
        });
      }
    }
  }

  // Keep top 40 to allow filtering by genre later for the "Sugeridos" feature
  return items.sort((a, b) => b.omdbRating - a.omdbRating).slice(0, 40);
}

export async function getCriticsCache(): Promise<CriticsCache | null> {
  try {
    const docs = await listDocuments(COLLECTION_USUARIOS_METADATA, [
      Query.equal('user_id', 'system_critics_cache')
    ]);
    if (docs.length > 0) {
      const doc = docs[0] as any;
      if (doc.avatar_id) {
        return JSON.parse(doc.avatar_id) as CriticsCache;
      }
    }
  } catch (err) {
    console.error('Error reading critics cache:', err);
  }
  return null;
}

export async function refreshCriticsCacheIfNeeded(_currentUserId: string): Promise<CriticsCache | null> {
  const cache = await getCriticsCache();
  const today = new Date().toISOString().split('T')[0];
  
  if (cache && cache.lastUpdated.startsWith(today)) {
    const hasGenreIds = 
      cache.topMovies && cache.topMovies.length > 0 && cache.topMovies.every(m => m && Array.isArray(m.genreIds)) &&
      cache.topSeries && cache.topSeries.length > 0 && cache.topSeries.every(s => s && Array.isArray(s.genreIds));
    if (hasGenreIds) {
      return cache; // Valid for today
    }
  }

  // Needs update
  const topMovies = await buildCriticsList('movie');
  const topSeries = await buildCriticsList('tv');
  
  const newCache: CriticsCache = {
    lastUpdated: new Date().toISOString(),
    topMovies,
    topSeries
  };

  try {
    const docs = await listDocuments(COLLECTION_USUARIOS_METADATA, [
      Query.equal('user_id', 'system_critics_cache')
    ]);
    
    // We use current user's permissions, but since it's a global read, we just need ANY user to be able to read it.
    const perms = [
      `read("any")`,
      `update("any")`,
      `delete("any")`
    ];

    if (docs.length > 0) {
      await updateDocument(COLLECTION_USUARIOS_METADATA, docs[0].$id, {
        avatar_id: JSON.stringify(newCache)
      });
    } else {
      await createDocument(COLLECTION_USUARIOS_METADATA, {
        user_id: 'system_critics_cache',
        mcoins: 0,
        avatar_id: JSON.stringify(newCache)
      }, perms);
    }
  } catch (err) {
    console.error('Error saving critics cache:', err);
  }

  return newCache;
}
