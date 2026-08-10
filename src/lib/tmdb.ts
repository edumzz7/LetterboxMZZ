import type { FavoriteGenreOption } from './favoriteGenres';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
    vote_average?: number;
    original_language?: string;
}

export interface TMDBSeries {
    id: number;
    name: string;
    first_air_date: string;
    poster_path: string | null;
    vote_average?: number;
}

export interface TMDBTvSeasonMeta {
    season_number: number;
    episode_count: number;
}

export interface TMDBTvDetails {
    id: number;
    number_of_seasons: number;
    number_of_episodes: number;
    seasons: TMDBTvSeasonMeta[];
}

export interface TMDBSeasonEpisode {
    episode_number: number;
    name: string;
}

export interface TMDBWatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string | null;
}

export interface TMDBTrailer {
    name: string;
    url: string;
}

interface TMDBVideoResult {
    key?: string;
    name?: string;
    site?: string;
    type?: string;
    official?: boolean;
    iso_639_1?: string;
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

export interface TMDBRecommendationItem {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    release_date?: string;
    first_air_date?: string;
    adult?: boolean;
    genre_ids?: number[];
}

export interface TMDBHomeMedia extends TMDBRecommendationItem {
    media_type: 'movie' | 'tv';
}

export const HOME_RELATED_MIN_RATING = 7;
export const SIMILAR_MEDIA_MIN_RATING = 3.5;
export const HOME_RELATED_MIN_VOTES = {
    movie: 150,
    tv: 75,
} as const;

export const HOME_TOP_RATED_REQUIREMENTS = {
    movie: { minimumRating: 7.5, minimumVotes: 1000 },
    tv: { minimumRating: 7.5, minimumVotes: 500 },
} as const;

const HOME_TOP_RATED_CACHE_DURATION = 1000 * 60 * 60 * 24;
const HOME_TOP_RATED_CACHE_PREFIX = 'cinerats:home-top-rated:v1';

interface CachedHomeCatalog {
    timestamp: number;
    items: TMDBHomeMedia[];
}

async function getRecommendationList(path: string, language = 'pt-BR'): Promise<TMDBRecommendationItem[]> {
    if (!TMDB_API_KEY) return [];

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/${path}?api_key=${TMDB_API_KEY}&language=${language}&page=1`
        );
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data?.results) ? data.results : [];
    } catch (error) {
        console.error(`Error fetching TMDB recommendations for ${path}:`, error);
        return [];
    }
}

export function getMovieRecommendations(movieId: number, language = 'pt-BR') {
    return getRecommendationList(`movie/${movieId}/recommendations`, language);
}

export function getMovieSimilar(movieId: number, language = 'pt-BR') {
    return getRecommendationList(`movie/${movieId}/similar`, language);
}

export function getTvRecommendations(tvId: number, language = 'pt-BR') {
    return getRecommendationList(`tv/${tvId}/recommendations`, language);
}

export function getTvSimilar(tvId: number, language = 'pt-BR') {
    return getRecommendationList(`tv/${tvId}/similar`, language);
}

async function getDiscoverByGenres(
    type: 'movie' | 'tv',
    genreIds: number[],
    excludeId: number,
    page: number,
): Promise<TMDBRecommendationItem[]> {
    if (!TMDB_API_KEY) return [];

    try {
        const params = new URLSearchParams({
            api_key: TMDB_API_KEY,
            language: 'pt-BR',
            sort_by: 'popularity.desc',
            include_adult: 'false',
            include_video: 'false',
            'vote_average.gte': String(SIMILAR_MEDIA_MIN_RATING * 2),
            page: String(page),
        });
        if (genreIds.length) params.set('with_genres', genreIds.join('|'));

        const response = await fetch(`${TMDB_BASE_URL}/discover/${type}?${params.toString()}`);
        if (!response.ok) return [];
        const results = ((await response.json())?.results || []) as TMDBRecommendationItem[];
        return results.filter((item) => item.id !== excludeId);
    } catch (error) {
        console.error(`Error discovering fallback ${type} media:`, error);
        return [];
    }
}

function mergeSimilarItems(
    excludeId: number,
    lists: TMDBRecommendationItem[][],
): TMDBRecommendationItem[] {
    const unique = new Map<number, TMDBRecommendationItem>();

    for (const item of lists.flat()) {
        if (
            item.id !== excludeId
            && !item.adult
            && Boolean(item.poster_path)
            && Number(item.vote_average || 0) / 2 >= SIMILAR_MEDIA_MIN_RATING
            && !unique.has(item.id)
        ) {
            unique.set(item.id, item);
        }
    }

    return Array.from(unique.values());
}

async function getSimilarWithFallback(
    type: 'movie' | 'tv',
    mediaId: number,
    genreIds: number[],
): Promise<TMDBRecommendationItem[]> {
    const [similar, recommendations] = type === 'movie'
        ? await Promise.all([getMovieSimilar(mediaId), getMovieRecommendations(mediaId)])
        : await Promise.all([getTvSimilar(mediaId), getTvRecommendations(mediaId)]);
    const primaryItems = mergeSimilarItems(mediaId, [similar, recommendations]);

    if (primaryItems.length >= 3) return primaryItems;

    const [discoveredFirstPage, discoveredSecondPage] = await Promise.all([
        getDiscoverByGenres(type, genreIds, mediaId, 1),
        getDiscoverByGenres(type, genreIds, mediaId, 2),
    ]);

    return mergeSimilarItems(mediaId, [primaryItems, discoveredFirstPage, discoveredSecondPage]);
}

export function getMovieSimilarWithFallback(movieId: number, genreIds: number[] = []) {
    return getSimilarWithFallback('movie', movieId, genreIds);
}

export function getTvSimilarWithFallback(tvId: number, genreIds: number[] = []) {
    return getSimilarWithFallback('tv', tvId, genreIds);
}

export const FAVORITE_GENRE_MIN_RATING = 3.5;
const FAVORITE_GENRE_CACHE_PREFIX = 'cinerats:home-favorite-genre:v1';

function randomGenrePage() {
    return Math.floor(Math.random() * 5) + 1;
}

function shuffleItems<T>(items: T[]) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
}

export async function getFavoriteGenreRecommendations(
    genre: FavoriteGenreOption,
    excludedIds: ReadonlySet<number> = new Set(),
    userId = 'anonymous',
): Promise<TMDBHomeMedia[]> {
    const cacheKey = `${FAVORITE_GENRE_CACHE_PREFIX}:${userId}:${genre.key}`;
    const cached = readCachedHomeCatalog(cacheKey);
    if (cached) {
        const availableCached = cached.filter((item) => !excludedIds.has(item.id));
        if (availableCached.length >= 10) return availableCached.slice(0, 10);
    }

    const moviePage = randomGenrePage();
    const tvPage = randomGenrePage();
    const [movieFirst, movieSecond, tvFirst, tvSecond] = await Promise.all([
        getDiscoverByGenres('movie', genre.movieGenreIds, -1, moviePage),
        getDiscoverByGenres('movie', genre.movieGenreIds, -1, moviePage + 1),
        getDiscoverByGenres('tv', genre.tvGenreIds, -1, tvPage),
        getDiscoverByGenres('tv', genre.tvGenreIds, -1, tvPage + 1),
    ]);

    const unique = new Map<string, TMDBHomeMedia>();
    const addItems = (items: TMDBRecommendationItem[], mediaType: 'movie' | 'tv') => {
        for (const item of items) {
            if (
                excludedIds.has(item.id)
                || item.adult
                || !item.poster_path
                || Number(item.vote_average || 0) < FAVORITE_GENRE_MIN_RATING * 2
            ) continue;

            const key = `${mediaType}-${item.id}`;
            if (!unique.has(key)) unique.set(key, { ...item, media_type: mediaType });
        }
    };

    addItems([...movieFirst, ...movieSecond], 'movie');
    addItems([...tvFirst, ...tvSecond], 'tv');

    const recommendations = shuffleItems(Array.from(unique.values())).slice(0, 10);
    writeCachedHomeCatalog(cacheKey, recommendations);
    return recommendations;
}

async function getHomeCatalog(path: string, forcedMediaType?: 'movie' | 'tv'): Promise<TMDBHomeMedia[]> {
    if (!TMDB_API_KEY) return [];

    try {
        const response = await fetch(`${TMDB_BASE_URL}/${path}&api_key=${TMDB_API_KEY}`);
        if (!response.ok) return [];
        const results = ((await response.json())?.results || []) as Array<TMDBRecommendationItem & { media_type?: 'movie' | 'tv' }>;
        return results
            .map((item: TMDBRecommendationItem & { media_type?: 'movie' | 'tv' }) => ({
                ...item,
                media_type: forcedMediaType || item.media_type,
            }))
            .filter((item): item is TMDBHomeMedia =>
                (item.media_type === 'movie' || item.media_type === 'tv') && !item.adult && Boolean(item.poster_path),
            );
    } catch (error) {
        console.error(`Error fetching TMDB catalog for ${path}:`, error);
        return [];
    }
}

export function getWeeklyTrendingMedia() {
    return getHomeCatalog('trending/all/week?language=pt-BR');
}

function readCachedHomeCatalog(cacheKey: string): TMDBHomeMedia[] | null {
    try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const cached = JSON.parse(raw) as CachedHomeCatalog;
        if (
            !Array.isArray(cached.items)
            || typeof cached.timestamp !== 'number'
            || Date.now() - cached.timestamp >= HOME_TOP_RATED_CACHE_DURATION
        ) {
            localStorage.removeItem(cacheKey);
            return null;
        }
        return cached.items;
    } catch {
        return null;
    }
}

function writeCachedHomeCatalog(cacheKey: string, items: TMDBHomeMedia[]) {
    try {
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), items } satisfies CachedHomeCatalog));
    } catch {
        // A lista continua funcional mesmo se o navegador bloquear o armazenamento local.
    }
}

function pickRandomHomeItems(items: TMDBHomeMedia[], limit = 10) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled.slice(0, limit);
}

async function getRandomTopRatedCatalog(
    type: 'movie' | 'tv',
    path: string,
): Promise<TMDBHomeMedia[]> {
    const cacheKey = `${HOME_TOP_RATED_CACHE_PREFIX}:${type}`;
    const cached = readCachedHomeCatalog(cacheKey);
    if (cached) return cached;

    const items = await getHomeCatalog(path, type);
    const selected = pickRandomHomeItems(items);
    if (selected.length) writeCachedHomeCatalog(cacheKey, selected);
    return selected;
}

export function getTopRatedMovies() {
    const { minimumRating, minimumVotes } = HOME_TOP_RATED_REQUIREMENTS.movie;
    return getRandomTopRatedCatalog(
        'movie',
        `discover/movie?language=pt-BR&sort_by=vote_average.desc&vote_average.gte=${minimumRating}&vote_count.gte=${minimumVotes}&include_adult=false&include_video=false&page=1`,
    );
}

export function getTopRatedSeries() {
    const { minimumRating, minimumVotes } = HOME_TOP_RATED_REQUIREMENTS.tv;
    return getRandomTopRatedCatalog(
        'tv',
        `discover/tv?language=pt-BR&sort_by=vote_average.desc&vote_average.gte=${minimumRating}&vote_count.gte=${minimumVotes}&include_adult=false&page=1`,
    );
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

export async function getMovieDetails(movieId: string | number) {
    if (!TMDB_API_KEY || !movieId) return null;
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`
        );
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

async function getDetailsWithOverviewFallback(path: string) {
    if (!TMDB_API_KEY || !path) return null;

    for (const language of ['pt-BR', 'en-US']) {
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/${path}?api_key=${TMDB_API_KEY}&language=${language}`
            );
            if (!response.ok) continue;

            const data = await response.json();
            if (data?.overview || language === 'en-US') return data;
        } catch (error) {
            console.error(`Error fetching TMDB details in ${language}:`, error);
        }
    }

    return null;
}

export function getMovieDetailsWithFallback(movieId: string | number) {
    return getDetailsWithOverviewFallback(`movie/${movieId}`);
}

function selectYouTubeTrailer(videos: TMDBVideoResult[]): TMDBTrailer | null {
    const selected = videos
        .filter((video) => video.site?.toLowerCase() === 'youtube' && Boolean(video.key))
        .sort((a, b) => {
            const score = (video: TMDBVideoResult) =>
                (video.official ? 20 : 0) +
                (video.type === 'Trailer' ? 10 : video.type === 'Teaser' ? 5 : 0);
            return score(b) - score(a);
        })[0];

    return selected?.key
        ? { name: selected.name || 'Trailer oficial', url: `https://www.youtube.com/watch?v=${selected.key}` }
        : null;
}

async function getYouTubeTrailer(path: string): Promise<TMDBTrailer | null> {
    if (!TMDB_API_KEY || !path) return null;

    let fallback: TMDBTrailer | null = null;
    for (const language of ['pt-BR', 'en-US']) {
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/${path}/videos?api_key=${TMDB_API_KEY}&language=${language}`
            );
            if (!response.ok) continue;

            const videos = ((await response.json())?.results || []) as TMDBVideoResult[];
            fallback ||= selectYouTubeTrailer(videos);
            const localizedTrailer = selectYouTubeTrailer(
                videos.filter((video) => video.iso_639_1 === language.slice(0, 2)),
            );
            if (localizedTrailer) return localizedTrailer;
        } catch (error) {
            console.error(`Error fetching TMDB trailer for ${path}:`, error);
        }
    }

    return fallback;
}

export function getMovieYouTubeTrailer(movieId: string | number) {
    return getYouTubeTrailer(`movie/${movieId}`);
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

export async function getTvDetails(tvId: number): Promise<TMDBTvDetails | null> {
    if (!TMDB_API_KEY || !tvId) return null;
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=pt-BR`
        );
        if (!response.ok) throw new Error('TMDB TV Details Fetch Error');
        const data = await response.json();
        return {
            id: data.id,
            number_of_seasons: data.number_of_seasons ?? 0,
            number_of_episodes: data.number_of_episodes ?? 0,
            seasons: (data.seasons || []).map((season: { season_number?: number; episode_count?: number }) => ({
                season_number: season.season_number ?? 0,
                episode_count: season.episode_count ?? 0,
            })),
        };
    } catch (error) {
        console.error('Error fetching TV details:', error);
        return null;
    }
}

export async function getTvDetailsRaw(tvId: number) {
    if (!TMDB_API_KEY || !tvId) return null;
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=pt-BR`
        );
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching TV details raw:', error);
        return null;
    }
}

export function getTvDetailsRawWithFallback(tvId: number) {
    return getDetailsWithOverviewFallback(`tv/${tvId}`);
}

export function getTvYouTubeTrailer(tvId: string | number) {
    return getYouTubeTrailer(`tv/${tvId}`);
}

export async function getMediaDetailsWithFallback(mediaId: string | number) {
    const movie = await getMovieDetailsWithFallback(mediaId);
    if (movie) return { ...movie, media_type: 'movie' as const };

    const tv = await getTvDetailsRawWithFallback(Number(mediaId));
    return tv ? { ...tv, media_type: 'tv' as const } : null;
}

function normalizeMediaTitle(title: string | null | undefined) {
    return (title || '').toLowerCase().replace(/[^a-z0-9À-ÿ]+/gi, ' ').trim();
}

export async function getMediaDetailsMatchingTitle(mediaId: string | number, requestedTitle: string) {
    const [movie, tv] = await Promise.all([
        getMovieDetailsWithFallback(mediaId),
        getTvDetailsRawWithFallback(Number(mediaId)),
    ]);
    const normalizedRequestedTitle = normalizeMediaTitle(requestedTitle);
    const candidates = [
        movie && { details: movie, type: 'movie' as const, titles: [movie.title, movie.original_title] },
        tv && { details: tv, type: 'tv' as const, titles: [tv.name, tv.original_name] },
    ].filter(Boolean) as Array<{ details: Record<string, unknown>; type: 'movie' | 'tv'; titles: Array<string | undefined> }>;

    const match = candidates.find((candidate) =>
        candidate.titles.some((title) => normalizeMediaTitle(title) === normalizedRequestedTitle),
    );
    return match ? { ...match.details, media_type: match.type } : null;
}

export async function getTvSeasonEpisodes(tvId: number, seasonNumber: number): Promise<TMDBSeasonEpisode[]> {
    if (!TMDB_API_KEY || !tvId || seasonNumber <= 0) return [];
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=pt-BR`
        );
        if (!response.ok) throw new Error('TMDB TV Season Fetch Error');
        const data = await response.json();
        return (data.episodes || []).map((episode: { episode_number?: number; name?: string }) => ({
            episode_number: episode.episode_number ?? 0,
            name: episode.name ?? `Episodio ${episode.episode_number ?? '?'}`,
        }));
    } catch (error) {
        console.error('Error fetching TV season episodes:', error);
        return [];
    }
}

export async function searchMulti(query: string, signal?: AbortSignal): Promise<TMDBMultiResult[]> {
    if (!query || !query.trim()) return [];
    if (!TMDB_API_KEY) return [];

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`,
            { signal },
        );
        if (!response.ok) throw new Error('TMDB Multi Fetch Error');

        const data = await response.json();
        return (data.results || []).filter(
            (item: TMDBMultiResult) => item.media_type === 'movie' || item.media_type === 'tv'
        );
    } catch (error) {
        if (signal?.aborted) return [];
        console.error('Error searching TMDB multi:', error);
        return [];
    }
}

export interface TMDBPerson {
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department?: string;
}

export interface TMDBCombinedCredit {
    id: number;
    media_type: 'movie' | 'tv';
    title?: string;
    name?: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    character?: string;
    job?: string;
    department?: string;
}

export interface TMDBPersonDetails extends TMDBPerson {
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    biography: string | null;
    combined_credits?: {
        cast?: TMDBCombinedCredit[];
        crew?: TMDBCombinedCredit[];
    };
}

export async function searchPeople(query: string, signal?: AbortSignal): Promise<TMDBPerson[]> {
    if (!query || !query.trim()) return [];

    if (!TMDB_API_KEY) {
        console.error("TMDB API Key missing. Check .env.local");
        return [];
    }

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`,
            { signal },
        );

        if (!response.ok) throw new Error('TMDB Person Fetch Error');

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        if (signal?.aborted) return [];
        console.error("Error searching TMDB people:", error);
        return [];
    }
}

export async function getPersonDetailsWithCredits(personId: string | number): Promise<TMDBPersonDetails | null> {
    if (!TMDB_API_KEY || !personId) return null;

    try {
        const primaryResponse = await fetch(
            `${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=combined_credits`
        );
        if (!primaryResponse.ok) return null;

        const primaryDetails = await primaryResponse.json() as TMDBPersonDetails;
        if (primaryDetails.biography?.trim()) return primaryDetails;

        const fallbackResponse = await fetch(
            `${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        if (!fallbackResponse.ok) return primaryDetails;

        const fallbackDetails = await fallbackResponse.json() as TMDBPersonDetails;
        return fallbackDetails.biography?.trim()
            ? { ...primaryDetails, biography: fallbackDetails.biography }
            : primaryDetails;
    } catch (error) {
        console.error('Error fetching person details:', error);
        return null;
    }
}

export async function getMovieCredits(movieId: string | number) {
    if (!TMDB_API_KEY || !movieId) return null;
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=pt-BR`
        );
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching movie credits:', error);
        return null;
    }
}

export async function getTvCredits(tvId: string | number) {
    if (!TMDB_API_KEY || !tvId) return null;
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${tvId}/credits?api_key=${TMDB_API_KEY}&language=pt-BR`
        );
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching TV credits:', error);
        return null;
    }
}
