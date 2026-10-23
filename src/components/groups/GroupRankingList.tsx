import clsx from 'clsx';
import { Crown } from 'lucide-react';
import AvatarDisplay from '../layout/AvatarDisplay';
import type { GroupRankingItem } from '../../types/app';

interface GroupRankingListProps {
  items: GroupRankingItem[];
  currentUserId: string;
  onSelectUser: (username: string) => void;
}

/** Same look as the general ranking rows in the sidebar, listing every member. */
export default function GroupRankingList({ items, currentUserId, onSelectUser }: GroupRankingListProps) {
  return (
    <ol className="flex flex-col gap-1.5">
      {items.map((item) => {
        const isCurrent = item.id === currentUserId;
        const isLeader = item.rank === 1 && item.totalPoints > 0;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelectUser(item.username)}
              className={clsx(
                'flex w-full min-w-0 items-center gap-3 rounded-xl border px-3 py-2 text-left transition',
                isLeader ? 'border-2 border-yellow-600' : 'border-slate-400/40',
                isCurrent ? 'bg-brand-gold/10' : 'bg-black/25 hover:border-[#656565]',
              )}
            >
              <span className="w-8 shrink-0 text-xs uppercase tracking-[0.12em] text-brand-gold-alt">
                {item.rank}&ordm;
              </span>
              <AvatarDisplay avatarId={item.avatarPath} className="h-9 w-9" emojiClassName="text-lg" />
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm text-brand-text">
                    {item.displayName || item.username}
                    {isCurrent ? ' (Você)' : ''}
                  </span>
                  {item.role === 'admin' && (
                    <Crown size={12} className="shrink-0 text-brand-gold" aria-label="Administrador" />
                  )}
                </span>
                <span className="block truncate text-xs text-brand-text-muted">@{item.username}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-brand-gold">
                {item.totalPoints} MC
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
