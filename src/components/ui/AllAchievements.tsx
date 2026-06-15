import { ACHIEVEMENTS } from '../../lib/achievements';
import { AchievementBadge } from './UserAchievements';

export default function AllAchievements() {
  const publicAchievements = ACHIEVEMENTS.filter((ach) => !ach.secret);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
        Conquistas Disponíveis
      </h3>
      <div className="flex flex-wrap items-center gap-2 py-1">
        {publicAchievements.map((ach) => (
          <AchievementBadge key={ach.id} achievement={ach} />
        ))}
      </div>
    </div>
  );
}
