import clsx from 'clsx';
import { Clapperboard, Film, LogOut, Popcorn, Ticket } from 'lucide-react';
import type { RankedUser } from '../../types/app';

interface UserSidebarProps {
  users: RankedUser[];
  currentUserId: string;
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function avatarIcon(avatarId: string) {
  switch (avatarId) {
    case 'clapper':
      return Clapperboard;
    case 'popcorn':
      return Popcorn;
    case 'ticket':
      return Ticket;
    case 'reel':
    default:
      return Film;
  }
}

export default function UserSidebar({
  users,
  currentUserId,
  selectedUserId,
  onSelectUser,
  onLogout,
  isOpen,
  onClose,
}: UserSidebarProps) {
  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 bg-black/60 z-40 xl:hidden transition-opacity',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      <aside
        className={clsx(
          'z-50 xl:z-auto w-[280px] xl:w-[270px] shrink-0 border border-[#151515] rounded-[24px] bg-[linear-gradient(180deg,_rgba(8,10,16,0.96),_rgba(3,3,3,0.98))] p-4 h-[calc(100vh-2rem)] xl:h-fit overflow-y-auto xl:sticky xl:top-8 fixed xl:relative left-4 xl:left-auto top-4 xl:top-auto transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-[120%] xl:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#171717] pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">Ranking</p>
            <h2 className="text-lg uppercase tracking-[0.15em] text-brand-gold mt-1">MCoins</h2>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-text-muted hover:text-brand-text transition"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {users.map((user) => {
            const Icon = avatarIcon(user.avatar_id);
            const isCurrent = user.id === currentUserId;
            const isSelected = user.id === selectedUserId;

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onSelectUser(user.id);
                  onClose();
                }}
                className={clsx(
                  'w-full rounded-xl border px-3 py-2 text-left transition',
                  isSelected
                    ? 'border-brand-gold bg-brand-gold/10'
                    : 'border-[#1d1d1d] bg-black/25 hover:border-[#323232]',
                )}
              >
                <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.12em]">
                  <span className="text-brand-gold-alt">#{user.rank}</span>
                  <span className="text-brand-gold">{user.mcoins} MC</span>
                </div>

                <div className="mt-1 flex items-center gap-2 min-w-0">
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full border flex items-center justify-center shrink-0',
                      isSelected ? 'border-brand-gold text-brand-gold' : 'border-[#252525] text-brand-gold-alt',
                    )}
                  >
                    <Icon size={14} />
                  </div>
                  <p className="text-sm uppercase tracking-[0.14em] text-brand-text truncate">
                    {user.username} {isCurrent ? '(Voce)' : ''}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
