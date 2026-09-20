import { Trophy } from 'lucide-react';
import type { RankedUser } from '../../types/app';
import AvatarDisplay from '../layout/AvatarDisplay';

export default function PublicProfile({ user }: { user: RankedUser }) {
  return <main className="mx-auto w-full max-w-2xl px-3 py-10 sm:px-6"><section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-7 text-center sm:p-10"><AvatarDisplay avatarId={user.avatar_id} className="mx-auto h-20 w-20 border border-brand-gold/40" emojiClassName="text-4xl" /><p className="mt-5 text-xs uppercase tracking-[0.22em] text-brand-gold-alt">Perfil CineRats</p><h1 className="mt-2 text-3xl font-light text-brand-text">{user.display_name || user.username}</h1><p className="mt-1 text-sm text-brand-text-muted">@{user.username}</p><div className="mx-auto mt-7 flex max-w-sm justify-center gap-8 border-t border-white/10 pt-6"><div><p className="text-2xl text-brand-gold">#{user.rank}</p><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-brand-text-muted">Ranking</p></div><div><p className="flex items-center justify-center gap-1 text-2xl text-brand-gold"><Trophy size={18} />{user.mcoins}</p><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-brand-text-muted">MCoins</p></div></div><p className="mt-8 text-sm leading-relaxed text-brand-text-muted">Entre ou crie sua conta para montar sua biblioteca e participar da comunidade.</p></section></main>;
}

