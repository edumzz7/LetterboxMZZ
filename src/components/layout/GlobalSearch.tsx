import { useEffect, useRef, useState } from 'react';
import { Loader2, Search, Film, UserRound } from 'lucide-react';
import { useLocation } from 'wouter';
import type { RankedUser } from '../../types/app';
import { searchMulti, searchPeople, type TMDBMultiResult, type TMDBPerson } from '../../lib/tmdb';
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
  const [personResults, setPersonResults] = useState<TMDBPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return;
    }

    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(async () => {
      if (!active) return;
      setLoading(true);
      const mediaPromise = searchMulti(normalizedQuery, controller.signal).then((media) => {
        if (active) setResults(media.slice(0, 5));
      });
      const peoplePromise = searchPeople(normalizedQuery, controller.signal).then((people) => {
        if (active) setPersonResults(people.slice(0, 5));
      });

      await Promise.allSettled([mediaPromise, peoplePromise]);
      if (active) setLoading(false);
    }, 300);

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const userResults = users.filter((user) => {
    const value = query.trim().toLowerCase();
    return value && (user.username.toLowerCase().includes(value) || user.display_name?.toLowerCase().includes(value));
  }).slice(0, 5);

  const close = () => {
    setQuery('');
    setFocused(false);
    inputRef.current?.blur();
    onMobileOpenChange?.(false);
  };

  return (
    <div className={`relative z-40 w-full max-w-2xl transition-all max-md:max-w-none ${mobileOpen ? 'max-md:w-full' : 'max-md:w-10'}`}>
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setResults([]);
          setPersonResults([]);
          if (!event.target.value.trim()) setLoading(false);
        }}
        onPointerDown={() => { if (!mobileOpen) onMobileOpenChange?.(true); }}
        onFocus={() => { setFocused(true); onMobileOpenChange?.(true); }}
        onBlur={() => window.setTimeout(() => { setFocused(false); onMobileOpenChange?.(false); }, 180)}
        placeholder="Pesquisar usuários, filmes, séries e pessoas"
        className={`w-full rounded-xl border border-[#252525] bg-black py-2.5 pl-10 pr-10 text-xs text-white placeholder:text-white/45 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 sm:text-sm ${mobileOpen ? 'max-md:w-full' : 'max-md:w-10 max-md:cursor-pointer max-md:pr-0 max-md:text-transparent max-md:placeholder:text-transparent'}`}
      />
      {loading && <Loader2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-brand-gold" />}

      {focused && query.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-xl border border-[#252525] bg-[#080a0f] shadow-2xl">
          {[...userResults, ...results, ...personResults].length === 0 && !loading ? <p className="px-4 py-4 text-center text-xs text-brand-text-muted">Nenhum resultado encontrado.</p> : null}
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
          {personResults.map((person) => {
            const isDirector = person.known_for_department === 'Directing';
            return <button key={`person-${person.id}`} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setLocation(isDirector ? `/director/${person.id}` : `/actor/${person.id}`); close(); }} className="flex w-full items-center gap-3 border-t border-white/5 px-3.5 py-2.5 text-left hover:bg-white/5">
              {person.profile_path ? <img src={`https://image.tmdb.org/t/p/w92${person.profile_path}`} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-card"><UserRound size={13} /></span>}
              <span className="min-w-0 flex-1 truncate text-sm text-brand-text">{person.name}</span>
              <span className="text-[9px] uppercase tracking-wider text-brand-gold-alt">{isDirector ? 'direção' : 'pessoa'}</span>
            </button>;
          })}
        </div>
      )}
    </div>
  );
}
