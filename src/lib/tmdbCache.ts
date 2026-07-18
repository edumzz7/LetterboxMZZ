import { getTvDetails, type TMDBTvDetails } from './tmdb';

const CACHE_KEY = 'tmdb_tv_details_cache';
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 dias

interface CachedTvDetails {
  data: TMDBTvDetails;
  timestamp: number;
}

/**
 * Busca detalhes de série do TMDB com cache de 7 dias no localStorage
 * Reduz drasticamente requisições ao TMDB para dados que não mudam
 */
export async function getTvDetailsWithCache(tvId: number): Promise<TMDBTvDetails | null> {
  const cacheKey = `${CACHE_KEY}_${tvId}`;

  // 1. Verificar cache local
  try {
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed: CachedTvDetails = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;
      const isValid = age < CACHE_DURATION;

      if (isValid) {
        return parsed.data;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.warn(`[TMDB Cache] Error reading cache for TV ${tvId}:`, error);
    localStorage.removeItem(cacheKey);
  }

  // 2. Cache miss - buscar do TMDB
  const data = await getTvDetails(tvId);

  // 3. Salvar no cache
  if (data) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      } as CachedTvDetails));
    } catch (error) {
      console.warn(`[TMDB Cache] Error saving cache for TV ${tvId}:`, error);
      // Se localStorage estiver cheio, limpar caches antigos
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        clearOldestCaches(10);
        // Tentar salvar novamente
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
          } as CachedTvDetails));
        } catch {
          // Ignorar se falhar novamente
        }
      }
    }
  }

  return data;
}

/**
 * Invalida cache de uma série específica
 * Usar quando série for atualizada/deletada
 */
export function invalidateTvDetailsCache(tvId: number): void {
  const cacheKey = `${CACHE_KEY}_${tvId}`;
  localStorage.removeItem(cacheKey);
}

/**
 * Limpa todo o cache de detalhes TMDB
 * Usar em casos especiais (debug, logout, etc)
 */
export function clearAllTvDetailsCache(): void {
  Object.keys(localStorage)
    .filter(key => key.startsWith(CACHE_KEY))
    .forEach(key => {
      localStorage.removeItem(key);
    });
}

/**
 * Remove os N caches mais antigos para liberar espaço
 */
function clearOldestCaches(count: number): void {
  const caches: Array<{ key: string; timestamp: number }> = [];

  // Coletar todos os caches com timestamps
  Object.keys(localStorage)
    .filter(key => key.startsWith(CACHE_KEY))
    .forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key)!);
        caches.push({ key, timestamp: data.timestamp || 0 });
      } catch {
        // Cache inválido, remover
        localStorage.removeItem(key);
      }
    });

  // Ordenar por mais antigo primeiro
  caches.sort((a, b) => a.timestamp - b.timestamp);

  // Remover os N mais antigos
  caches.slice(0, count).forEach(({ key }) => {
    localStorage.removeItem(key);
  });
}

/**
 * Retorna estatísticas do cache
 */
export function getCacheStats(): { count: number; oldestAge: number; newestAge: number } {
  const caches: number[] = [];

  Object.keys(localStorage)
    .filter(key => key.startsWith(CACHE_KEY))
    .forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key)!);
        caches.push(data.timestamp || 0);
      } catch {
        // Ignorar caches inválidos
      }
    });

  const now = Date.now();
  const ages = caches.map(ts => now - ts);

  return {
    count: caches.length,
    oldestAge: Math.max(...ages, 0),
    newestAge: Math.min(...ages, 0),
  };
}
