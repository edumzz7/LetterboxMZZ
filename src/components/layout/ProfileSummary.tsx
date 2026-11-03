import { ChevronRight, UserCheck, UserPlus } from 'lucide-react';
import type { RankedUser } from '../../types/app';
import AvatarDisplay from './AvatarDisplay';
import { useFavorites } from '../../hooks/useFavorites';

interface ProfileSummaryProps {
  user: RankedUser;
  currentUserId: string;
  onSelectUser: (id: string) => void;
}

export default function ProfileSummary({ user, currentUserId, onSelectUser }: ProfileSummaryProps) {
  const { isUserFavorited, toggleFavorite, isToggling } = useFavorites(currentUserId);

  return (
    <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-center gap-4">
        <AvatarDisplay avatarId={user.avatar_id} className="h-20 w-20 shrink-0 rounded-full border-[3px] border-brand-gold shadow-[0_0_28px_rgba(212,175,55,0.16)]" emojiClassName="text-4xl" />
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <h2 className="min-w-0 flex-1 truncate text-base font-semibold uppercase tracking-[0.12em] text-brand-text">{user.display_name || user.username}</h2>
            {user.id !== currentUserId && (
              <button
                type="button"
                aria-label={isUserFavorited(user.id) ? 'Remover dos amigos' : 'Adicionar aos amigos'}
                title={isUserFavorited(user.id) ? 'Remover dos amigos' : 'Adicionar aos amigos'}
                disabled={isToggling}
                onClick={() => toggleFavorite(user.id)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-gold/45 text-brand-gold transition hover:bg-brand-gold/10 disabled:cursor-wait disabled:opacity-50"
              >
                {isUserFavorited(user.id) ? <UserCheck size={14} /> : <UserPlus size={14} />}
              </button>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-brand-text-muted">@{user.username}</p>
          <span className="mt-3 inline-flex rounded-full border border-brand-gold/35 bg-brand-gold/10 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-brand-gold">{user.mcoins} MCoins</span>
        </div>
      </div>

      {user.id !== currentUserId && <button type="button" onClick={() => onSelectUser(currentUserId)} className="mt-5 flex w-full items-center justify-center gap-1 border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.14em] text-brand-gold-alt hover:text-brand-gold">Voltar ao meu perfil <ChevronRight size={13} /></button>}
    </section>
  );
}
