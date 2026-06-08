import { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import clsx from 'clsx';
import { getUnlockedAchievements, type Achievement } from '../../lib/achievements';
import type { PersonalMovie, SeriesEntry, RankedUser } from '../../types/app';

interface AchievementBadgeProps {
  achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const IconComponent = (Icons as any)[achievement.icon] || Icons.Award;
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={badgeRef}
      className="relative flex items-center justify-center cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        setShowTooltip((prev) => !prev);
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all bg-brand-gold/10 border border-brand-gold/30 hover:border-brand-gold hover:scale-110 hover:shadow-[0_0_12px_rgba(212,175,55,0.25)]",
          achievement.secret ? "bg-purple-950/20 border-purple-500/30 text-purple-400" : "text-brand-gold"
        )}
        title={achievement.name}
      >
        <IconComponent size={14} />
      </div>

      {/* Glassmorphic Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-50 w-44 p-2.5 rounded-xl border border-brand-gold/10 bg-black/95 backdrop-blur-md text-center shadow-2xl animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
          <p className="text-[11px] font-semibold text-brand-gold uppercase tracking-wider">{achievement.name}</p>
          <p className="text-[9px] text-brand-text mt-1 leading-normal font-light">{achievement.description}</p>
          {achievement.secret && (
            <span className="inline-block mt-1.5 text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-500/25 text-purple-300">
              Secreta
            </span>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-black/95" />
        </div>
      )}
    </div>
  );
}

interface UserAchievementsProps {
  movies: PersonalMovie[];
  series: SeriesEntry[];
  users: RankedUser[];
  userId: string;
  isLoading?: boolean;
}

export default function UserAchievements({
  movies,
  series,
  users,
  userId,
  isLoading = false,
}: UserAchievementsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 opacity-50 py-1">
        <Icons.Loader2 size={12} className="animate-spin text-brand-gold" />
        <span className="text-[9px] uppercase tracking-wider text-brand-text-muted">Calculando conquistas...</span>
      </div>
    );
  }

  const unlocked = getUnlockedAchievements(movies, series, users, userId);

  if (unlocked.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {unlocked.map((ach) => (
        <AchievementBadge key={ach.id} achievement={ach} />
      ))}
    </div>
  );
}
