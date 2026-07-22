import type React from 'react';
import { createElement, useMemo } from 'react';
import * as Icons from 'lucide-react';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import AvatarDisplay from './AvatarDisplay';
import { useOscarPredictions } from '../../hooks/useOscarPredictions';
import {
  ACHIEVEMENTS,
  getAchievementProgress,
  getFavoriteDirector,
  type Achievement,
  type AchievementProgressContext,
} from '../../lib/achievements';
import { listFavorites, listUserActivity } from '../../lib/appData';
import { countFavoritedBy } from '../../lib/localData';
import type { ActivityEntry, PersonalMovie, RankedUser, SeriesEntry } from '../../types/app';

interface RankingScreenProps {
  user: RankedUser;
  users: RankedUser[];
  movies: PersonalMovie[];
  series: SeriesEntry[];
  currentUserId: string;
  isLoading?: boolean;
}

const GENRE_LABELS: Record<string, string> = {
  action: 'Ação', adventure: 'Aventura', animation: 'Animação', comedy: 'Comédia', crime: 'Crime',
  documentary: 'Documentário', drama: 'Drama', family: 'Família', horror: 'Terror', mystery: 'Mistério',
  romance: 'Romance', 'sci-fi': 'Ficção científica', thriller: 'Suspense', war: 'Guerra', western: 'Faroeste',
};

const LEVEL_META = {
  1: {
    label: 'Simples',
    icon: 'text-slate-200',
    iconBg: 'bg-slate-900/70 border-slate-500/30',
    border: 'border-slate-500/25',
    progress: 'bg-slate-200',
    badge: 'border-slate-500/30 bg-slate-900/50 text-slate-300',
  },
  2: {
    label: 'Rara',
    icon: 'text-sky-300',
    iconBg: 'bg-sky-950/50 border-sky-500/30',
    border: 'border-sky-500/30',
    progress: 'bg-sky-400',
    badge: 'border-sky-500/30 bg-sky-950/40 text-sky-300',
  },
  3: {
    label: 'Épica',
    icon: 'text-brand-gold',
    iconBg: 'bg-brand-gold/10 border-brand-gold/30',
    border: 'border-brand-gold/30',
    progress: 'bg-brand-gold',
    badge: 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold',
  },
} as const;

const SECRET_META = {
  label: 'Secreta',
  icon: 'text-purple-300',
  iconBg: 'bg-purple-950/70 border-purple-400/50',
  border: 'border-purple-400/45',
  progress: 'bg-purple-400',
  badge: 'border-purple-400/40 bg-purple-950/50 text-purple-300',
} as const;

const HEX_CLIP_PATH = 'polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0 50%)';

const MCOIN_RULES = [
  ['Assistir a um filme', '+30 MC'],
  ['Assistir a um filme indicado', '+40 MC'],
  ['Iniciar uma série', '+20 MC'],
  ['Finalizar uma série', '+50 MC'],
  ['Indicar um filme ou série', '+5 MC'],
  ['Avaliar um filme ou série', '+5 MC'],
  ['Escrever uma resenha', '+5 MC'],
  ['Reagir a um filme ou receber indicação', '0 MC'],
];

function getIcon(achievement: Achievement): React.ElementType {
  if (typeof achievement.icon !== 'string') return achievement.icon || Icons.Award;
  return (Icons as unknown as Record<string, React.ElementType>)[achievement.icon] || Icons.Award;
}

function AchievementIcon({ achievement, size, className }: { achievement: Achievement; size: number; className?: string }) {
  return createElement(getIcon(achievement), { size, className });
}

function getLongestStreak(activities: ActivityEntry[], movies: PersonalMovie[], series: SeriesEntry[]) {
  const allDates = [
    ...activities.map((a) => a.created_at),
    ...movies.filter((m) => m.status === 'watched').map((m) => m.created_at),
    ...series.filter((s) => s.status === 'watched').map((s) => s.created_at),
  ];

  const days = [...new Set(
    allDates
      .map((dateStr) => (dateStr ? dateStr.slice(0, 10) : ''))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)),
  )].sort();

  let longest = 0;
  let current = 0;
  let previous = '';

  days.forEach((day) => {
    if (!previous) {
      current = 1;
    } else {
      const previousDate = new Date(`${previous}T12:00:00`);
      const currentDate = new Date(`${day}T12:00:00`);
      const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / 86_400_000);
      if (diffDays === 1) {
        current += 1;
      } else if (diffDays > 1) {
        current = 1;
      }
    }
    longest = Math.max(longest, current);
    previous = day;
  });

  return longest;
}

function AchievementCard({
  achievement,
  progress,
  unlocked,
}: {
  achievement: Achievement;
  progress: number;
  unlocked: boolean;
}) {
  const level = achievement.secret ? SECRET_META : LEVEL_META[achievement.level];
  const rarityClass = achievement.secret
    ? 'achievement-card-secret'
    : achievement.level === 3
      ? 'achievement-card-epic'
      : achievement.level === 2
        ? 'achievement-card-rare'
        : '';

  return (
    <article className={clsx(
      'group rounded-2xl border bg-[#0b0f17] p-4 transition-colors',
      rarityClass,
      unlocked ? level.border : 'border-[#1b2432] hover:border-white/20',
    )}>
      <div className="flex items-start gap-3">
        <div
          className={clsx('achievement-badge-shell h-12 w-12 shrink-0 p-[2px]', level.iconBg, !unlocked && 'opacity-55 grayscale')}
          style={{ clipPath: HEX_CLIP_PATH }}
        >
          <div className="achievement-badge-icon flex h-full w-full items-center justify-center bg-[#0b0f17]" style={{ clipPath: HEX_CLIP_PATH }}>
            <AchievementIcon achievement={achievement} size={24} className={unlocked ? level.icon : 'text-brand-text-muted'} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={clsx('text-sm font-semibold leading-tight', unlocked ? 'text-brand-text' : 'text-brand-text-muted')}>
              {achievement.name}
            </h3>
            <span className={clsx('shrink-0 rounded-full border px-2 py-0.5 text-[8px] uppercase tracking-[0.14em]', level.badge)}>
              {level.label}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-brand-text-muted">{achievement.description}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-[10px] text-brand-text-muted">
          <span>{unlocked ? 'Conquista desbloqueada' : `Você tem ${progress}% do progresso necessário`}</span>
          <span className={clsx('font-semibold', unlocked ? level.icon : 'text-brand-text')}>{unlocked ? '100%' : `${progress}%`}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/50">
          <div className={clsx('h-full rounded-full transition-all', unlocked ? level.progress : 'bg-brand-gold/70')} style={{ width: `${unlocked ? 100 : progress}%` }} />
        </div>
      </div>
    </article>
  );
}

export default function RankingScreen({ user, users, movies, series, currentUserId, isLoading = false }: RankingScreenProps) {
  const { predictionsQuery } = useOscarPredictions(currentUserId);
  const favoritesQuery = useQuery({
    queryKey: ['user_favorites_list', currentUserId],
    queryFn: listFavorites,
    enabled: Boolean(currentUserId),
  });
  const favoritedByQuery = useQuery({
    queryKey: ['favorited_by_count', currentUserId],
    queryFn: () => countFavoritedBy(currentUserId),
    enabled: Boolean(currentUserId),
  });
  const activitiesQuery = useQuery({
    queryKey: ['user_activities_list', currentUserId, 'ranking'],
    queryFn: () => listUserActivity([currentUserId], 1000),
    enabled: Boolean(currentUserId),
  });

  const predictions = useMemo(() => predictionsQuery.data || [], [predictionsQuery.data]);
  const favorites = favoritesQuery.data || [];
  const activities = useMemo(() => activitiesQuery.data || [], [activitiesQuery.data]);
  const favoriteDirector = getFavoriteDirector(movies);
  const favoriteGenre = user.favorite_genre ? (GENRE_LABELS[user.favorite_genre] || user.favorite_genre) : null;
  const longestStreak = getLongestStreak(activities, movies, series);
  const betterThanPercent = users.length <= 1
    ? 100
    : Math.max(0, Math.min(100, Math.round(((users.length - user.rank) / (users.length - 1)) * 100)));

  const context = useMemo<AchievementProgressContext>(() => ({
    movies,
    series,
    users,
    userId: currentUserId,
    predictions,
    favoritesCount: favorites.length,
    favoritedByCount: favoritedByQuery.data || 0,
    activities,
  }), [activities, currentUserId, favoritedByQuery.data, favorites.length, movies, predictions, series, users]);

  const achievementEntries = useMemo(() => {
    const unlockedIds = new Set(ACHIEVEMENTS.filter((achievement) => achievement.check(
      context.movies,
      context.series,
      context.users,
      context.userId,
      context.predictions,
      context.favoritesCount,
      context.favoritedByCount,
      context.activities,
    )).map((achievement) => achievement.id));

    return ACHIEVEMENTS
      .filter((achievement) => !achievement.secret || unlockedIds.has(achievement.id))
      .map((achievement) => ({
        achievement,
        unlocked: unlockedIds.has(achievement.id),
        progress: getAchievementProgress(achievement, context),
      }))
      .sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.progress - a.progress || b.achievement.level - a.achievement.level || a.achievement.name.localeCompare(b.achievement.name, 'pt-BR'));
  }, [context]);

  const unlockedCount = achievementEntries.filter((entry) => entry.unlocked).length;
  const nextAchievement = achievementEntries.find((entry) => !entry.unlocked) || null;
  const loading = isLoading || predictionsQuery.isLoading || favoritesQuery.isLoading || favoritedByQuery.isLoading || activitiesQuery.isLoading;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-brand-gold">
        <Icons.Loader2 size={22} className="animate-spin" />
        <span className="text-xs uppercase tracking-[0.16em] text-brand-text-muted">Calculando seu espaço de conquistas</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-brand-gold/20 bg-[#080c14] p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-brand-gold/10" />
        <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full border border-brand-gold/10" />

        <div className="relative flex flex-col gap-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <AvatarDisplay avatarId={user.avatar_id} className="h-24 w-24 rounded-full border-[3px] border-brand-gold shadow-[0_0_28px_rgba(212,175,55,0.2)]" emojiClassName="text-5xl" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Seu espaço de conquistas</p>
              <h1 className="mt-2 text-2xl font-semibold text-brand-text sm:text-3xl">Olá, {user.display_name || user.username}.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-text-muted">Sua jornada cinéfila está em movimento. Cada filme, série e interação aproxima você da próxima conquista.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em]">
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-brand-text-muted">@{user.username}</span>
                <span className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1.5 text-brand-gold">{user.mcoins} MCoins</span>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-brand-text-muted">{unlockedCount} conquistas</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[9px] uppercase tracking-[0.16em] text-brand-gold">Comunidade</p>
              <p className="mt-3 text-sm font-medium text-brand-text">À frente de <strong className="text-brand-gold">{betterThanPercent}%</strong> dos usuários em MCoins.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[9px] uppercase tracking-[0.16em] text-sky-300">Conquistas</p>
              <p className="mt-3 text-sm font-medium text-brand-text">Você possui <strong className="text-brand-gold">{unlockedCount}</strong> conquistas.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[9px] uppercase tracking-[0.16em] text-rose-300">Seu gênero</p>
              <p className="mt-3 text-sm font-medium text-brand-text">{favoriteGenre || 'Ainda descobrindo seu favorito.'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[9px] uppercase tracking-[0.16em] text-brand-gold">Seu diretor</p>
              <p className="mt-3 text-sm font-medium text-brand-text">{favoriteDirector || 'Ainda descobrindo seu favorito.'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[9px] uppercase tracking-[0.16em] text-purple-300">Maior sequência</p>
              <p className="mt-3 text-sm font-medium text-brand-text"><strong className="text-brand-gold">{longestStreak}</strong> {longestStreak === 1 ? 'dia ativo' : 'dias ativos'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-brand-gold/25 bg-brand-gold/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="h-16 w-16 shrink-0 bg-brand-gold/40 p-[2px] text-brand-gold" style={{ clipPath: HEX_CLIP_PATH }}>
            <div className="flex h-full w-full items-center justify-center bg-brand-gold/10" style={{ clipPath: HEX_CLIP_PATH }}>
              {nextAchievement ? <AchievementIcon achievement={nextAchievement.achievement} size={30} /> : <Icons.Trophy size={30} />}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">Próximo marco</p>
            <h2 className="mt-1 text-xl font-semibold text-brand-text">{nextAchievement?.achievement.name || 'Todas as conquistas desbloqueadas'}</h2>
            <p className="mt-1 text-sm text-brand-text-muted">{nextAchievement?.achievement.description || 'Você completou todos os desafios disponíveis para o seu perfil.'}</p>
          </div>
          {nextAchievement && <div className="w-full sm:w-44">
            <div className="mb-2 flex justify-between text-[10px] text-brand-text-muted"><span>Progresso</span><span className="font-semibold text-brand-gold">{nextAchievement.progress}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-black/50"><div className="h-full rounded-full bg-brand-gold" style={{ width: `${nextAchievement.progress}%` }} /></div>
          </div>}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Próximos marcos</p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-text">Conquistas disponíveis</h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-brand-text-muted sm:text-right">Aqui estão todas as conquistas visíveis que você é capaz de recolher. Além dessas, também temos conquistas secretas!</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {achievementEntries.map((entry) => <AchievementCard key={entry.achievement.id} achievement={entry.achievement} progress={entry.progress} unlocked={entry.unlocked} />)}
        </div>
      </section>

      <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-gold/30 bg-brand-gold/10 text-brand-gold"><Icons.Coins size={19} /></div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Como ganhar MCoins</p>
            <h2 className="mt-1 text-xl font-semibold text-brand-text">Pontuação das ações</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {MCOIN_RULES.map(([action, points]) => (
            <div key={action} className="flex items-center justify-between gap-4 border-b border-white/5 py-2 text-sm">
              <span className="text-brand-text-muted">{action}</span>
              <span className="shrink-0 font-semibold text-brand-gold">{points}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-brand-text-muted">Ações retroativas não geram MCoins. Alterar uma avaliação ou resenha já pontuada também não gera pontos novamente.</p>
      </section>
    </div>
  );
}
