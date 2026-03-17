import clsx from 'clsx';
import { Film, LogOut, Telescope, UserRound } from 'lucide-react';
import type { AppUser } from '../../types/app';

interface UserSidebarProps {
  users: AppUser[];
  currentUserId: string;
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
  onLogout: () => void;
}

export default function UserSidebar({
  users,
  currentUserId,
  selectedUserId,
  onSelectUser,
  onLogout,
}: UserSidebarProps) {
  return (
    <aside className="w-full xl:w-[280px] shrink-0 border border-[#151515] rounded-[28px] bg-[linear-gradient(180deg,_rgba(8,10,16,0.96),_rgba(3,3,3,0.98))] p-5 h-fit xl:sticky xl:top-8">
      <div className="flex items-center justify-between gap-3 border-b border-[#171717] pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-text-muted">Rede</p>
          <h2 className="text-lg uppercase tracking-[0.18em] text-brand-gold mt-2">Usuarios</h2>
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

      <div className="mt-4 flex flex-col gap-2">
        {users.map((user) => {
          const isCurrent = user.id === currentUserId;
          const isSelected = user.id === selectedUserId;

          return (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelectUser(user.id)}
              className={clsx(
                'w-full rounded-2xl border px-4 py-3 text-left transition',
                isSelected
                  ? 'border-brand-gold bg-brand-gold/10'
                  : 'border-[#1d1d1d] bg-black/25 hover:border-[#323232]',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-full border flex items-center justify-center shrink-0',
                      isSelected ? 'border-brand-gold text-brand-gold' : 'border-[#252525] text-brand-gold-alt',
                    )}
                  >
                    <UserRound size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm uppercase tracking-[0.18em] text-brand-text truncate">
                      {user.username}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-brand-text-muted mt-1">
                      {isCurrent ? 'Seu perfil' : 'Visualizar dashboard'}
                    </p>
                  </div>
                </div>

                {isCurrent ? (
                  <Film size={14} className="text-brand-gold-alt shrink-0 mt-1" />
                ) : (
                  <Telescope size={14} className="text-brand-text-muted shrink-0 mt-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
