import { useMemo } from 'react';
import { Star, Tv, Clapperboard, Heart } from 'lucide-react';
import { usePersonalMovies } from '../../hooks/usePersonalMovies';
import { useSeries } from '../../hooks/useSeries';
import type { RankedUser } from '../../types/app';

interface DashboardTabProps {
  user: RankedUser;
}

export default function DashboardTab({ user }: DashboardTabProps) {
  const { moviesQuery } = usePersonalMovies(user.id);
  const { seriesQuery } = useSeries(user.id);

  const averageRating = useMemo(() => {
    const movies = moviesQuery.data || [];
    const series = seriesQuery.data || [];
    
    let totalScore = 0;
    let count = 0;

    for (const m of movies) {
      if (typeof m.avaliacao === 'number' && m.avaliacao > 0) {
        totalScore += m.avaliacao;
        count++;
      }
    }
    
    for (const s of series) {
      if (typeof s.avaliacao === 'number' && s.avaliacao > 0) {
        totalScore += s.avaliacao;
        count++;
      }
    }

    if (count === 0) return null;
    return (totalScore / count).toFixed(1);
  }, [moviesQuery.data, seriesQuery.data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-gold-alt mb-2">
          <Heart size={18} />
          <h3 className="text-xs tracking-widest uppercase">Filme Favorito</h3>
        </div>
        <p className="text-lg font-light text-brand-text">
          {user.favorite_movie || 'Não definido'}
        </p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-gold-alt mb-2">
          <Clapperboard size={18} />
          <h3 className="text-xs tracking-widest uppercase">Gênero Favorito</h3>
        </div>
        <p className="text-lg font-light text-brand-text">
          {user.favorite_genre || 'Não definido'}
        </p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-gold-alt mb-2">
          <Tv size={18} />
          <h3 className="text-xs tracking-widest uppercase">Onde Assiste</h3>
        </div>
        <p className="text-lg font-light text-brand-text capitalize">
          {user.watch_preference === 'cinema' ? 'No Cinema' : user.watch_preference === 'home' ? 'Em Casa' : 'Não definido'}
        </p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-gold-alt mb-2">
          <Star size={18} />
          <h3 className="text-xs tracking-widest uppercase">Média de Avaliação</h3>
        </div>
        <p className="text-lg font-light text-brand-text">
          {averageRating ? `${averageRating} / 5.0` : 'Sem avaliações ainda'}
        </p>
      </div>
    </div>
  );
}
