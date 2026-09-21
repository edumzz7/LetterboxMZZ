import { useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { ChevronRight, UserCheck, UserPlus, Users } from 'lucide-react';
import type { PersonalMovie, RankedUser, SeriesEntry } from '../../types/app';
import AvatarDisplay from './AvatarDisplay';
import UserAchievements from '../ui/UserAchievements';
import { useFavorites } from '../../hooks/useFavorites';

interface ProfileSummaryProps {
  user: RankedUser;
  users: RankedUser[];
  currentUserId: string;
  movies: PersonalMovie[];
  series: SeriesEntry[];
  isLoading?: boolean;
  onSelectUser: (id: string) => void;
}

export default function ProfileSummary({ user, users, currentUserId, movies, series, isLoading, onSelectUser }: ProfileSummaryProps) {
  const [slide, setSlide] = useState<'profile' | 'friends'>('profile');
  const [showAllFriends, setShowAllFriends] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const { favorites, isUserFavorited, toggleFavorite, isToggling } = useFavorites(currentUserId);
  const friends = users.filter((candidate) => favorites?.some((favorite) => favorite.favoriteUserId === candidate.id));
  const visibleFriends = showAllFriends ? friends : friends.slice(0, 5);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    setSlide(deltaX < 0 ? 'friends' : 'profile');
  };

  return (
    <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.24)]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={() => { touchStartRef.current = null; }} style={{ touchAction: 'pan-y' }}>
      {slide === 'profile' ? <div className="flex flex-col items-center text-center animate-in fade-in duration-200">
        <AvatarDisplay avatarId={user.avatar_id} className="h-24 w-24 rounded-full border-[3px] border-brand-gold shadow-[0_0_28px_rgba(212,175,55,0.16)]" emojiClassName="text-5xl" />
        <div className="mt-3 flex w-fit max-w-full items-center justify-center gap-1.5 px-1">
          <h2 className="min-w-0 max-w-full break-words text-base font-semibold uppercase tracking-[0.12em] text-brand-text">{user.display_name || user.username}</h2>
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
        <p className="mt-1 text-xs text-brand-text-muted">@{user.username}</p>
        <span className="mt-2 rounded-full border border-brand-gold/35 bg-brand-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">{user.mcoins} MC</span>
      </div> : <div className="min-h-[236px] animate-in fade-in duration-200">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3"><p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-brand-gold-alt"><Users size={13} /> Amigos</p>{friends.length > 5 && <button type="button" onClick={() => setShowAllFriends((current) => !current)} className="text-[10px] uppercase tracking-wider text-brand-gold hover:underline">{showAllFriends ? 'Mostrar 5' : 'Ver mais'}</button>}</div>
        {visibleFriends.length ? <div className="space-y-2">{visibleFriends.map((friend) => <button key={friend.id} type="button" onClick={() => onSelectUser(friend.id)} className="group flex w-full items-center gap-3 rounded-xl border border-white/5 bg-black/15 p-2 text-left transition hover:border-brand-gold/50 hover:bg-white/5"><AvatarDisplay avatarId={friend.avatar_id} className="h-9 w-9 shrink-0 rounded-full border border-[#34405a] group-hover:border-brand-gold" /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-brand-text">{friend.display_name || friend.username}</span><span className="block truncate text-[9px] text-brand-text-muted">@{friend.username}</span></span><span className="text-right"><span className="block text-xs text-brand-gold">#{friend.rank}</span><span className="block text-[9px] uppercase tracking-wider text-brand-gold-alt">{friend.mcoins} MC</span></span></button>)}</div> : <p className="py-16 text-center text-xs leading-relaxed text-brand-text-muted">Ainda não há amigos adicionados.</p>}
      </div>}

      {slide === 'profile' && <div className="mt-4 border-t border-white/10 pt-3">
        <p className="text-center text-[9px] font-semibold uppercase tracking-[0.22em] text-brand-gold-alt">Insígnias</p>
        <div className="mt-3 flex justify-center"><UserAchievements movies={movies} series={series} users={users} userId={user.id} isLoading={isLoading} maxVisible={10} /></div>
      </div>}

      <div className="mt-4 flex flex-col items-center gap-1.5"><p className="text-[8px] uppercase tracking-[0.14em] text-brand-text-muted">Deslize para ver amigos</p><div className="flex items-center justify-center gap-2"><button type="button" aria-label="Ver perfil" onClick={() => setSlide('profile')} className={`h-1.5 rounded-full transition-all ${slide === 'profile' ? 'w-4 bg-brand-gold' : 'w-1.5 bg-brand-text-muted/45'}`} /><button type="button" aria-label="Ver amigos" onClick={() => setSlide('friends')} className={`h-1.5 rounded-full transition-all ${slide === 'friends' ? 'w-4 bg-brand-gold' : 'w-1.5 bg-brand-text-muted/45'}`} /></div></div>

      {user.id !== currentUserId && <button type="button" onClick={() => onSelectUser(currentUserId)} className="mt-5 flex w-full items-center justify-center gap-1 border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.14em] text-brand-gold-alt hover:text-brand-gold">Voltar ao meu perfil <ChevronRight size={13} /></button>}
    </section>
  );
}
