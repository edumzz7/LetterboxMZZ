import clsx from 'clsx';
import { useLocation } from 'wouter';
import type { SpecialNotification } from '../../types/app';

interface SpecialNotificationsListProps {
  notifications: SpecialNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate?: () => void;
  variant?: 'popover' | 'page';
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

/** Actionable notifications (group invites, requests...) that lead to a page of the app. */
export default function SpecialNotificationsList({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  variant = 'popover',
}: SpecialNotificationsListProps) {
  const [, setLocation] = useLocation();

  if (notifications.length === 0) return null;

  return (
    <section aria-label="Notificações">
      <div
        className={clsx(
          'flex items-center justify-between gap-3',
          variant === 'popover' ? 'border-b border-[#161616] px-4 py-3' : 'pt-5 pb-2',
        )}
      >
        <span className="text-xs uppercase tracking-[0.18em] text-brand-gold-alt">Notificações</span>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-text-muted transition hover:text-brand-gold"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>
      <ul className={variant === 'popover' ? 'border-b border-[#161616]' : 'divide-y divide-white/5'}>
        {notifications.map((notification) => {
          const isUnread = !notification.readAt;
          return (
            <li key={notification.id}>
              <button
                type="button"
                onClick={() => {
                  if (isUnread) onMarkRead(notification.id);
                  if (notification.link) {
                    setLocation(notification.link);
                    onNavigate?.();
                  }
                }}
                className={clsx(
                  'flex w-full items-start gap-3 text-left transition hover:bg-white/5',
                  variant === 'popover' ? 'px-4 py-3' : 'rounded-xl px-1 py-4',
                )}
              >
                <span
                  aria-hidden
                  className={clsx(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    isUnread ? 'bg-brand-gold' : 'bg-transparent',
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className={clsx('block text-sm leading-relaxed', isUnread ? 'text-brand-text' : 'text-brand-text-muted')}>
                    {notification.message}
                    {isUnread && <span className="sr-only"> (não lida)</span>}
                  </span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-brand-text-muted">
                    {formatTimestamp(notification.createdAt)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
