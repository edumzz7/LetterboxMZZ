import { useEffect, useState, useMemo } from 'react';
import { Award, Film, Tv, Loader2, ArrowLeft } from 'lucide-react';
import { type CriticsCache, type CriticItem, refreshCriticsCacheIfNeeded } from '../../lib/criticsCache';
import { generateImagePath } from '../../lib/imageUtils';
import { usePersonalMovies } from '../../hooks/usePersonalMovies';
import { useSeries } from '../../hooks/useSeries';

interface CriticaScreenProps {
  currentUserId: string;
  onBack: () => void;
}

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function CriticaScreen({ currentUserId, onBack }: CriticaScreenProps) {
  const [data, setData] = useState<CriticsCache | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteGenre, setFavoriteGenre] = useState<number | null>(null);

  const { moviesQuery } = usePersonalMovies(currentUserId);
  const { seriesQuery } = useSeries(currentUserId);

  // Fetch globas cache
  useEffect(() => {
    let mounted = true;
    const fetchCache = async () => {
      const cache = await refreshCriticsCacheIfNeeded(currentUserId);
      if (mounted) {
        setData(cache);
        setLoading(false);
      }
    };
    fetchCache();
    return () => { mounted = false; };
  }, [currentUserId]);

  // Determine user's favorite genre based on their top 5 recent titles
  useEffect(() => {
    let mounted = true;
    const fetchFavoriteGenre = async () => {
      if (!moviesQuery.data && !seriesQuery.data) return;
      const recentTitles = [
        ...(moviesQuery.data || []).map(m => m.titulo),
        ...(seriesQuery.data || []).map(s => s.titulo)
      ].slice(0, 5); // Take up to 5 recent titles

      if (recentTitles.length === 0) return;

      try {
        const genreCounts: Record<number, number> = {};
        for (const title of recentTitles) {
          const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=pt-BR&page=1`);
          if (res.ok) {
            const result = await res.json();
            if (result.results && result.results.length > 0) {
              const genreIds = result.results[0].genre_ids || [];
              for (const g of genreIds) {
                genreCounts[g] = (genreCounts[g] || 0) + 1;
              }
            }
          }
        }
        
        let maxCount = 0;
        let mostFrequent: number | null = null;
        for (const [gId, count] of Object.entries(genreCounts)) {
          if (count > maxCount) {
            maxCount = count;
            mostFrequent = Number(gId);
          }
        }

        if (mounted && mostFrequent !== null) {
          setFavoriteGenre(mostFrequent);
        }
      } catch (err) {
        console.error('Error fetching favorite genre:', err);
      }
    };
    
    fetchFavoriteGenre();
    return () => { mounted = false; };
  }, [moviesQuery.data, seriesQuery.data]);

  const suggestedMovies = useMemo(() => {
    if (!data || !favoriteGenre) return [];
    return data.topMovies.filter(m => m && Array.isArray(m.genreIds) && m.genreIds.includes(favoriteGenre)).slice(0, 5);
  }, [data, favoriteGenre]);

  const suggestedSeries = useMemo(() => {
    if (!data || !favoriteGenre) return [];
    return data.topSeries.filter(s => s && Array.isArray(s.genreIds) && s.genreIds.includes(favoriteGenre)).slice(0, 5);
  }, [data, favoriteGenre]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-brand-gold mb-4" size={32} />
        <p className="text-brand-text-muted text-sm animate-pulse">Consultando especialistas...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-brand-gold">
            <ArrowLeft size={24} />
          </button>
        </div>
        <p className="text-brand-text-muted">Não foi possível carregar o ranking da crítica.</p>
      </div>
    );
  }

  const renderItem = (item: CriticItem, index: number) => {
    const coverUrl = item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : null;
    return (
      <div key={item.tmdbId} className="flex gap-4 items-center group">
        <div className="text-2xl font-bold text-brand-text-muted/30 w-8 text-center shrink-0 group-hover:text-brand-gold transition-colors">
          {index + 1}
        </div>
        <div className="w-16 aspect-[2/3] rounded overflow-hidden shrink-0 bg-brand-card">
          {coverUrl ? (
            <img src={generateImagePath(item.title, coverUrl)} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film size={20} className="text-[#333]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-medium text-brand-text truncate">{item.title}</h4>
          <div className="flex items-center gap-3 mt-2">
            {item.rtRating && (
              <div className="flex flex-col items-center bg-black/40 rounded px-2 py-1" title="Rotten Tomatoes">
                <span className="text-xs font-bold text-red-500">{item.rtRating}%</span>
                <span className="text-[9px] uppercase text-brand-text-muted">RT</span>
              </div>
            )}
            {item.imdbRating && (
              <div className="flex flex-col items-center bg-black/40 rounded px-2 py-1" title="IMDb">
                <span className="text-xs font-bold text-yellow-500">{(item.imdbRating / 10).toFixed(1)}</span>
                <span className="text-[9px] uppercase text-brand-text-muted">IMDb</span>
              </div>
            )}
            <div className="flex flex-col items-center bg-brand-gold/10 rounded px-2 py-1 ml-auto">
              <span className="text-sm font-bold text-brand-gold">{item.omdbRating}</span>
              <span className="text-[9px] uppercase text-brand-gold/70">Média</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-w-0 pb-10 animate-in fade-in duration-500 flex flex-col gap-12 mt-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 border border-[#222] hover:bg-[#222] rounded-lg transition-colors text-brand-text-muted text-sm uppercase tracking-widest">
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-black/20 border border-[#171717] rounded-3xl p-6">
          <h3 className="text-lg uppercase tracking-widest text-brand-text flex items-center gap-2 mb-6">
            <Film size={20} className="text-brand-gold" />
            Top 5 Global: Filmes
          </h3>
          <div className="space-y-4">
            {data.topMovies.slice(0, 5).map((item, index) => renderItem(item, index))}
            {data.topMovies.length === 0 && <p className="text-sm text-brand-text-muted">Nenhum filme avaliado recentemente.</p>}
          </div>
        </div>

        <div className="bg-black/20 border border-[#171717] rounded-3xl p-6">
          <h3 className="text-lg uppercase tracking-widest text-brand-text flex items-center gap-2 mb-6">
            <Tv size={20} className="text-brand-gold" />
            Top 5 Global: Séries
          </h3>
          <div className="space-y-4">
            {data.topSeries.slice(0, 5).map((item, index) => renderItem(item, index))}
            {data.topSeries.length === 0 && <p className="text-sm text-brand-text-muted">Nenhuma série avaliada recentemente.</p>}
          </div>
        </div>
      </div>

      {favoriteGenre && (suggestedMovies.length > 0 || suggestedSeries.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#111]">
          <div className="bg-black/20 border border-brand-gold/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold opacity-5 blur-[64px] rounded-full"></div>
            <h3 className="text-lg uppercase tracking-widest text-brand-gold flex items-center gap-2 mb-6">
              <Award size={20} />
              Sugeridos: Filmes
            </h3>
            <div className="space-y-4 relative z-10">
              {suggestedMovies.length > 0 ? (
                suggestedMovies.map((item, index) => renderItem(item, index))
              ) : (
                <p className="text-sm text-brand-text-muted">Não temos filmes sugeridos no momento.</p>
              )}
            </div>
          </div>

          <div className="bg-black/20 border border-brand-gold/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold opacity-5 blur-[64px] rounded-full"></div>
            <h3 className="text-lg uppercase tracking-widest text-brand-gold flex items-center gap-2 mb-6">
              <Award size={20} />
              Sugeridos: Séries
            </h3>
            <div className="space-y-4 relative z-10">
              {suggestedSeries.length > 0 ? (
                suggestedSeries.map((item, index) => renderItem(item, index))
              ) : (
                <p className="text-sm text-brand-text-muted">Não temos séries sugeridas no momento.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
