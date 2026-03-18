import { Loader2 } from 'lucide-react';
import { useActivities } from '../../hooks/useActivities';
import { useUsers } from '../../hooks/useUsers';

export default function ActivityFeed() {
  const activitiesQuery = useActivities();
  const usersQuery = useUsers();

  if (activitiesQuery.isLoading) {
    return (
      <div className="border border-[#161616] rounded-2xl p-3 bg-black/30 flex items-center gap-2 text-xs text-brand-text-muted uppercase tracking-[0.14em]">
        <Loader2 size={14} className="animate-spin" /> Carregando feed...
      </div>
    );
  }

  const users = usersQuery.data ?? [];
  const usernames = new Map(users.map((user) => [user.id, user.username]));
  const activities = (activitiesQuery.data ?? []).slice(0, 6);

  if (activities.length === 0) {
    return (
      <div className="border border-[#161616] rounded-2xl p-3 bg-black/30 text-xs text-brand-text-muted tracking-[0.08em] uppercase">
        Feed de atividades vazio por enquanto.
      </div>
    );
  }

  return (
    <section className="border border-[#161616] rounded-2xl p-3 bg-black/30">
      <div className="text-xs uppercase tracking-[0.16em] text-brand-gold-alt mb-2">Atividades</div>
      <ul className="flex flex-col gap-2 text-sm text-brand-text-muted">
        {activities.map((activity) => {
          const username = usernames.get(activity.user_id) ?? 'Usuario';
          const message = activity.message.toLowerCase().startsWith(username.toLowerCase())
            ? activity.message
            : `${username} ${activity.message}`;

          return (
            <li key={activity.id} className="truncate">{message}</li>
          );
        })}
      </ul>
    </section>
  );
}
