import { ACHIEVEMENTS } from '../../lib/achievements';
import { AchievementBadge } from './UserAchievements';

const LEVEL_ORDER: Record<number, number> = { 1: 0, 2: 1, 3: 2 };

export default function AllAchievements() {
  const publicAchievements = ACHIEVEMENTS.filter((ach) => !ach.secret);

  // Sort by difficulty: level 1 (Simples) → 2 (Rara) → 3 (Épica)
  const sorted = [...publicAchievements].sort(
    (a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
  );

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {sorted.map((ach) => (
        <AchievementBadge key={ach.id} achievement={ach} />
      ))}
    </div>
  );
}
