const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
    vote_average?: number;
}

export interface TMDBSeries {
    id: number;
    name: string;
    first_air_date: string;
    poster_path: string | null;
    vote_average?: number;
}

export interface TMDBWatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string | null;
}

export interface TMDBMultiResult {
    id: number;
    media_type: 'movie' | 'tv';
    title?: string;
    name?: string;
    release_date?: string;
    first_air_date?: string;
    poster_path: string | null;
    vote_average?: number;
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
    if (!query || !query.trim()) return [];

    if (!TMDB_API_KEY) {
        console.error("TMDB API Key missing. Check .env.local");
        return [];
    }

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`
        );

        if (!response.ok) throw new Error('TMDB Fetch Error');

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error searching TMDB:", error);
        return [];
    }
}

export async function searchSeries(query: string): Promise<TMDBSeries[]> {
    if (!query || !query.trim()) return [];

    if (!TMDB_API_KEY) {
        console.error("TMDB API Key missing. Check .env.local");
        return [];
    }

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`
        );

        if (!response.ok) throw new Error('TMDB Fetch Error');

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error searching TMDB series:", error);
        return [];
    }
}

export async function findMovieIdByTitle(title: string, year?: number | null): Promise<number | null> {
    const results = await searchMovies(title);
    if (!results.length) return null;
    if (!year) return results[0].id;

    const sameYear = results.find((movie) => {
        const releaseYear = movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : null;
        return releaseYear === year;
    });
    return sameYear?.id ?? results[0].id;
}

export async function getMovieWatchProviders(
    movieId: number,
    region = 'BR'
): Promise<TMDBWatchProvider[]> {
    if (!TMDB_API_KEY || !movieId) return [];

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`
        );
        if (!response.ok) throw new Error('TMDB Providers Fetch Error');

        const data = await response.json();
        const byRegion = data?.results?.[region];
        if (!byRegion) return [];

        const buckets = [
            ...(byRegion.flatrate || []),
            ...(byRegion.rent || []),
            ...(byRegion.buy || []),
        ] as TMDBWatchProvider[];

        const unique = new Map<number, TMDBWatchProvider>();
        for (const provider of buckets) {
            if (!unique.has(provider.provider_id)) unique.set(provider.provider_id, provider);
        }
        return Array.from(unique.values()).slice(0, 5);
    } catch (error) {
        console.error('Error fetching watch providers:', error);
        return [];
    }
}

export async function getTvWatchProviders(
    tvId: number,
    region = 'BR'
): Promise<TMDBWatchProvider[]> {
    if (!TMDB_API_KEY || !tvId) return [];

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${tvId}/watch/providers?api_key=${TMDB_API_KEY}`
        );
        if (!response.ok) throw new Error('TMDB TV Providers Fetch Error');
        const data = await response.json();
        const byRegion = data?.results?.[region];
        if (!byRegion) return [];

        const buckets = [
            ...(byRegion.flatrate || []),
            ...(byRegion.rent || []),
            ...(byRegion.buy || []),
        ] as TMDBWatchProvider[];

        const unique = new Map<number, TMDBWatchProvider>();
        for (const provider of buckets) {
            if (!unique.has(provider.provider_id)) unique.set(provider.provider_id, provider);
        }
        return Array.from(unique.values()).slice(0, 5);
    } catch (error) {
        console.error('Error fetching TV watch providers:', error);
        return [];
    }
}

export async function searchMulti(query: string): Promise<TMDBMultiResult[]> {
    if (!query || !query.trim()) return [];
    if (!TMDB_API_KEY) return [];

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`
        );
        if (!response.ok) throw new Error('TMDB Multi Fetch Error');

        const data = await response.json();
        return (data.results || []).filter(
            (item: TMDBMultiResult) => item.media_type === 'movie' || item.media_type === 'tv'
        );
    } catch (error) {
        console.error('Error searching TMDB multi:', error);
        return [];
    }
}
