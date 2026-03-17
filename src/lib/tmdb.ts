const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
}

export interface TMDBSeries {
    id: number;
    name: string;
    first_air_date: string;
    poster_path: string | null;
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
