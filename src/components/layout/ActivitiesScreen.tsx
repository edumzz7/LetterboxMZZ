import { useMemo } from 'react';
import { Bell } from 'lucide-react';
import { useLocation } from 'wouter';
import { useUserActivity } from '../../hooks/useUserActivity';
import { ListSkeleton } from '../ui/LoadingSkeleton';

interface ActivitiesScreenProps {
  currentUserId: string;
  viewedUserId: string;
  isOwnDashboard: boolean;
  friendIds?: string[];
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function ActivitiesScreen({
  currentUserId,
  viewedUserId,
  isOwnDashboard,
  friendIds = [],
}: ActivitiesScreenProps) {
  const [, setLocation] = useLocation();
  const activityUserIds = useMemo(
    () => (isOwnDashboard ? [currentUserId, 'global', ...friendIds] : [viewedUserId]),
    [currentUserId, friendIds, isOwnDashboard, viewedUserId],
  );
  const activityQuery = useUserActivity(activityUserIds);
  const activities = useMemo(() => {
    const seenBroadcasts = new Set<string>();

    return (activityQuery.data ?? []).filter((activity) => {
      if (!activity.message.startsWith('Novo membro!')) return true;

      const key = activity.message.trim().toLowerCase();
      if (seenBroadcasts.has(key)) return false;
      seenBroadcasts.add(key);
      return true;
    });
  }, [activityQuery.data]);

  return (
    <section className="mx-auto w-full max-w-xl">
      <header className="border-b border-white/10 pb-5">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold-alt">
          <Bell size={14} /> Atualizações
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-brand-text">Atividades</h1>
        <p className="mt-2 text-sm text-brand-text-muted">
          Acompanhe as novidades da comunidade e de seus amigos.
        </p>
      </header>

      {activityQuery.isLoading ? (
        <div className="mt-3"><ListSkeleton count={6} /></div>
      ) : activities.length === 0 ? (
        <p className="py-14 text-center text-sm text-brand-text-muted">
          Nenhuma atividade recente por enquanto.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-white/5">
          {activities.map((activity) => {
            const member = activity.message.match(/Novo membro! @([\w.-]+)/)?.[1];

            return (
              <li key={activity.id}>
                <button
                  type="button"
                  disabled={!member}
                  onClick={() => member && setLocation(`/${member}`)}
                  className="w-full px-1 py-4 text-left transition enabled:hover:rounded-xl enabled:hover:bg-white/5"
                >
                  <p className="text-sm leading-relaxed text-brand-text">{activity.message}</p>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-brand-text-muted">
                    {formatTimestamp(activity.created_at)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
