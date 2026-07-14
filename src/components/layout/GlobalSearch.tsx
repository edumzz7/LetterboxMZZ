import { useEffect, useState } from 'react';
import { Loader2, Search, Film } from 'lucide-react';
import { useLocation } from 'wouter';
import type { RankedUser } from '../../types/app';
import { searchMulti, type TMDBMultiResult } from '../../lib/tmdb';
import AvatarDisplay from './AvatarDisplay';

interface GlobalSearchProps {
  users: RankedUser[];
  onSelectUser: (id: string) => void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export default function GlobalSearch({ users, onSelectUser, mobileOpen = false, onMobileOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<TMDBMultiResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        setResults((await searchMulti(query)).slice(0, 5));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  const userResults = users.filter((user) => {
    const value = query.trim().toLowerCase();
    return value && (user.username.toLowerCase().includes(value) || user.display_name?.toLowerCase().includes(value));
  }).slice(0, 5);

  const close = () => {
    setQuery('');
    setFocused(false);
    onMobileOpenChange?.(false);
  };

  return (
    <div className={`relative z-40 w-full max-w-2xl transition-all max-md:max-w-none ${mobileOpen ? 'max-md:w-full' : 'max-md:w-10'}`}>
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => { setFocused(true); onMobileOpenChange?.(true); }}
        onBlur={() => window.setTimeout(() => { setFocused(false); onMobileOpenChange?.(false); }, 180)}
        placeholder="Pesquisar usuários, filmes e séries"
        className={`w-full rounded-xl border border-[#252525] bg-black py-2.5 pl-10 pr-10 text-xs text-white placeholder:text-white/45 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 sm:text-sm ${mobileOpen ? 'max-md:w-full' : 'max-md:w-10 max-md:cursor-pointer max-md:pr-0 max-md:text-transparent max-md:placeholder:text-transparent'}`}
      />
      {loading && <Loader2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-brand-gold" />}

      {focused && query.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-xl border border-[#252525] bg-[#080a0f] shadow-2xl">
          {[...userResults, ...results].length === 0 && !loading ? <p className="px-4 py-4 text-center text-xs text-brand-text-muted">Nenhum resultado encontrado.</p> : null}
          {userResults.map((user) => (
            <button key={user.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { onSelectUser(user.id); close(); }} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-white/5">
              <AvatarDisplay avatarId={user.avatar_id} className="h-7 w-7 shrink-0" />
              <span className="min-w-0 truncate text-sm text-brand-text">{user.display_name || user.username} <span className="text-brand-text-muted">@{user.username}</span></span>
              <span className="ml-auto text-[9px] uppercase tracking-wider text-brand-gold-alt">usuário</span>
            </button>
          ))}
          {results.map((item) => {
            const movie = item.media_type === 'movie';
            const title = movie ? item.title : item.name;
            return <button key={`${item.media_type}-${item.id}`} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setLocation(movie ? `/filme/${item.id}` : `/serie/${item.id}`); close(); }} className="flex w-full items-center gap-3 border-t border-white/5 px-3.5 py-2.5 text-left hover:bg-white/5">
              {item.poster_path ? <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" className="h-9 w-6 rounded object-cover" /> : <span className="flex h-9 w-6 items-center justify-center rounded bg-brand-card"><Film size={12} /></span>}
              <span className="min-w-0 flex-1 truncate text-sm text-brand-text">{title}</span>
              <span className="text-[9px] uppercase tracking-wider text-brand-gold-alt">{movie ? 'filme' : 'série'}</span>
            </button>;
          })}
        </div>
      )}
    </div>
  );
}
