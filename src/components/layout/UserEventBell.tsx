import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import clsx from 'clsx';
import { useUserActivity } from '../../hooks/useUserActivity';
import { HEADER_MENU_OPEN_EVENT, notifyHeaderMenuOpen } from '../../lib/headerMenu';

interface UserEventBellProps {
  currentUserId: string;
  viewedUserId: string;
  isOwnDashboard: boolean;
  friendIds?: string[];
}

const SEEN_KEY_PREFIX = 'letterboxmzz_seen_notifications_v1_';

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

function readSeenTimestamp(userId: string) {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`${SEEN_KEY_PREFIX}${userId}`) ?? '';
}

function writeSeenTimestamp(userId: string, timestamp: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${SEEN_KEY_PREFIX}${userId}`, timestamp);
}

export default function UserEventBell({
  currentUserId,
  viewedUserId,
  isOwnDashboard,
  friendIds = [],
}: UserEventBellProps) {
  const [open, setOpen] = useState(false);
  const [seenTimestamp, setSeenTimestamp] = useState(() => readSeenTimestamp(currentUserId));
  const activityUserIds = useMemo(() => {
    if (isOwnDashboard) {
      return [currentUserId, 'global', ...friendIds];
    } else {
      return [viewedUserId];
    }
  }, [isOwnDashboard, currentUserId, viewedUserId, friendIds]);
  const activityQuery = useUserActivity(activityUserIds);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setLocation] = useLocation();

  const handleNotificationClick = (message: string) => {
    const match = message.match(/Novo membro! @([\w.-]+)/);
    if (match && match[1]) {
      setLocation(`/${match[1]}`);
      setOpen(false);
    }
  };

  useEffect(() => {
    setSeenTimestamp(readSeenTimestamp(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOtherHeaderMenu = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== 'activity') setOpen(false);
    };
    window.addEventListener(HEADER_MENU_OPEN_EVENT, handleOtherHeaderMenu);
    return () => window.removeEventListener(HEADER_MENU_OPEN_EVENT, handleOtherHeaderMenu);
  }, []);

  const items = useMemo(() => {
    const rawItems = activityQuery.data ?? [];
    const seenBroadcasts = new Set<string>();

    return rawItems.filter((item) => {
      if (!item.message.startsWith('Novo membro!')) {
        return true;
      }

      const key = item.message.trim().toLowerCase();
      if (seenBroadcasts.has(key)) {
        return false;
      }

      seenBroadcasts.add(key);
      return true;
    });
  }, [activityQuery.data]);
  const isLoading = activityQuery.isLoading;

  const unseenCount = useMemo(() => {
    if (!isOwnDashboard) return 0;
    if (!seenTimestamp) return Math.min(items.length, 9);
    const seenTime = new Date(seenTimestamp).getTime();
    return Math.min(
      items.filter((item) => new Date(item.created_at).getTime() > seenTime).length,
      9,
    );
  }, [isOwnDashboard, items, seenTimestamp]);

  const title = 'Atividade';
  const buttonLabel = 'Atividade';
  const emptyLabel = 'Nenhuma atividade recente por enquanto.';

  return (
    <div ref={containerRef} className={clsx('relative', open && 'z-[100]')}>
      <button
        type="button"
        onClick={() => {
          if (window.matchMedia('(max-width: 1023px)').matches) {
            if (isOwnDashboard && items.length > 0) {
              const latest = items[0]?.created_at;
              if (latest) {
                writeSeenTimestamp(currentUserId, latest);
                setSeenTimestamp(latest);
              }
            }
            setLocation('/atividades');
            return;
          }
          if (!open) notifyHeaderMenuOpen('activity');
          setOpen((current) => {
            const next = !current;
            if (next && isOwnDashboard && items.length > 0) {
              const latest = items[0]?.created_at;
              if (latest) {
                writeSeenTimestamp(currentUserId, latest);
                setSeenTimestamp(latest);
              }
            }
            return next;
          });
        }}
        aria-label={buttonLabel}
        title={buttonLabel}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/5 hover:text-brand-gold"
      >
        <Bell size={20} />
        {isOwnDashboard && unseenCount > 0 ? (
          <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-brand-gold text-[#0f172a] text-[10px] font-semibold flex items-center justify-center">
            +{unseenCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          {/* Mobile overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden"
            onClick={() => setOpen(false)}
          />
          {/* Panel: centered on mobile, dropdown on desktop */}
          <div className="fixed inset-x-4 top-[50%] z-[110] w-auto max-h-[80vh] -translate-y-[50%] overflow-hidden rounded-2xl border border-[#151b28] bg-[#06080d] shadow-[0_18px_60px_rgba(0,0,0,0.55)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[min(92vw,360px)] sm:max-h-none sm:translate-y-0">
            <div className="px-4 py-3 border-b border-[#161616] text-xs uppercase tracking-[0.18em] text-brand-gold-alt">
              {title}
            </div>

            {isLoading ? (
              <div className="px-4 py-6 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-brand-text-muted">
                <Loader2 size={14} className="animate-spin" /> Carregando...
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-brand-text-muted">
                {emptyLabel}
              </div>
            ) : (
              <ul className="max-h-[420px] overflow-y-auto">
                {items.map((item) => {
                  const isNewMember = item.message.startsWith('Novo membro!');
                  return (
                    <li 
                      key={item.id} 
                      className={clsx(
                        "px-4 py-3 border-b border-[#121212] last:border-b-0",
                        isNewMember && "cursor-pointer hover:bg-white/5 transition-colors"
                      )}
                      onClick={() => isNewMember && handleNotificationClick(item.message)}
                    >
                      <p className="text-sm leading-relaxed text-brand-text">{item.message}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-brand-text-muted">
                        {formatTimestamp(item.created_at)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
