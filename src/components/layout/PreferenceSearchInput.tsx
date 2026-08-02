import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export interface PreferenceSearchItem {
  id: number;
  title: string;
  release_date?: string;
  poster_path: string | null;
}

interface PreferenceSearchInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  searchFn: (query: string) => Promise<PreferenceSearchItem[]>;
}

export default function PreferenceSearchInput({
  label,
  placeholder,
  value,
  onChange,
  searchFn,
}: PreferenceSearchInputProps) {
  const [searchResults, setSearchResults] = useState<PreferenceSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<number | null>(null);
  const requestId = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => () => {
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    requestId.current += 1;
  }, []);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChange(nextValue);

    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    requestId.current += 1;
    const currentRequestId = requestId.current;

    if (!nextValue.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);
    searchTimeout.current = window.setTimeout(async () => {
      try {
        const results = await searchFn(nextValue.trim());
        if (currentRequestId === requestId.current) setSearchResults(results);
      } catch {
        if (currentRequestId === requestId.current) setSearchResults([]);
      } finally {
        if (currentRequestId === requestId.current) setIsSearching(false);
      }
    }, 350);
  };

  const handleSelect = (item: PreferenceSearchItem) => {
    onChange(item.title);
    setShowDropdown(false);
  };

  return (
    <div className="relative flex flex-col gap-2" ref={dropdownRef}>
      <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-brand-text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleTitleChange}
          onFocus={() => {
            if (value.trim() && searchResults.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-[#222] bg-[#151515] px-3 py-2 pr-10 text-sm text-brand-text placeholder-brand-text-muted/50 transition focus:border-brand-gold/40 focus:outline-none"
        />
        {isSearching && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand-gold" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-[#222] bg-[#151515] shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {isSearching && searchResults.length === 0 ? (
            <div className="p-4 text-center text-sm font-light text-brand-text-muted">Buscando no TMDB...</div>
          ) : searchResults.length > 0 ? (
            <ul className="flex flex-col">
              {searchResults.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="group flex cursor-pointer items-center gap-3 border-b border-[#222] p-2 transition-colors last:border-none hover:bg-[#1a2235]"
                >
                  {item.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title} className="h-12 w-8 rounded object-cover shadow-sm" />
                  ) : (
                    <div className="flex h-12 w-8 items-center justify-center rounded border border-[#222] bg-black">
                      <span className="text-[10px] text-brand-text-muted">N/A</span>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span className="line-clamp-1 text-sm font-medium text-brand-text">{item.title}</span>
                    <span className="text-xs text-brand-gold-alt">{item.release_date ? item.release_date.split('-')[0] : 'N/D'}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : value.trim() && !isSearching ? (
            <div className="p-4 text-center text-sm font-light leading-relaxed text-brand-text-muted">Nenhum resultado encontrado.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
