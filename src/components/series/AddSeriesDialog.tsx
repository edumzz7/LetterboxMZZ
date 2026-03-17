import React, { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, Plus, X } from 'lucide-react';
import clsx from 'clsx';
import { searchSeries, type TMDBSeries } from '../../lib/tmdb';
import type { SeriesEntry } from '../../types/app';

interface AddSeriesDialogProps {
  onSubmit: (series: Omit<SeriesEntry, 'id' | 'user_id' | 'created_at'>) => Promise<unknown>;
  isPending: boolean;
}

export default function AddSeriesDialog({ onSubmit, isPending }: AddSeriesDialogProps) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [capaUrl, setCapaUrl] = useState('');
  const [temporada, setTemporada] = useState('1');
  const [totalEps, setTotalEps] = useState('10');
  const [searchResults, setSearchResults] = useState<TMDBSeries[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<number | null>(null);
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

  const resetForm = () => {
    setOpen(false);
    setTitulo('');
    setCapaUrl('');
    setTemporada('1');
    setTotalEps('10');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTitulo(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    searchTimeout.current = window.setTimeout(async () => {
      const results = await searchSeries(value);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleSelectSeries = (series: TMDBSeries) => {
    setTitulo(series.name);
    if (series.poster_path) {
      setCapaUrl(`https://image.tmdb.org/t/p/w500${series.poster_path}`);
    }
    setShowDropdown(false);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!titulo.trim()) return;

    const total = parseInt(totalEps, 10) || 0;

    await onSubmit({
      titulo,
      capa_url: capaUrl.trim() || null,
      temporada: parseInt(temporada, 10) || 1,
      total_episodios: total,
      episodios_vistos: 0,
      status: total === 0 ? 'watching' : 'watching',
      plataforma_slug: 'stremio',
    });

    resetForm();
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex flex-col items-center justify-center gap-2 border border-[#222] text-brand-gold-alt text-xs tracking-widest uppercase rounded-md hover:border-brand-gold hover:text-brand-gold transition-all bg-brand-bg group min-h-[140px] w-full min-w-[140px] md:min-w-[180px] shrink-0 snap-center border-dashed aspect-[2/3]">
          <Plus size={24} className="group-hover:scale-110 transition-transform" />
          <span>Add Serie</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-[#222] bg-brand-bg p-6 shadow-lg rounded-xl">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-light text-brand-gold tracking-wider">
              NOVA SERIE
            </Dialog.Title>
            <Dialog.Description className="text-sm text-brand-text-muted font-light">
              Adicione uma serie para comecar a rastrear seu progresso.
            </Dialog.Description>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
              <label htmlFor="titulo" className="text-xs text-brand-text uppercase tracking-widest">
                Titulo da Serie *
              </label>
              <div className="relative">
                <input
                  id="titulo"
                  required
                  value={titulo}
                  onChange={handleTitleChange}
                  onFocus={() => {
                    if (titulo.trim() && searchResults.length > 0) setShowDropdown(true);
                  }}
                  className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2.5 rounded focus:outline-none focus:border-brand-gold font-light pr-10"
                  placeholder="Ex: Succession"
                />
                {isSearching ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gold">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                ) : null}
              </div>

              {showDropdown ? (
                <div className="absolute top-[100%] left-0 w-full mt-1 bg-[#0a0f1e] border border-[#222] rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <ul className="flex flex-col">
                      {searchResults.map((series) => (
                        <li
                          key={series.id}
                          onClick={() => handleSelectSeries(series)}
                          className="flex items-center gap-3 p-2 hover:bg-[#1a2235] cursor-pointer transition-colors border-b border-[#222] last:border-none"
                        >
                          {series.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${series.poster_path}`}
                              alt={series.name}
                              className="w-8 h-12 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-12 bg-black flex items-center justify-center rounded border border-[#222]">
                              <span className="text-[10px] text-brand-text-muted">N/A</span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-brand-text line-clamp-1">
                              {series.name}
                            </span>
                            <span className="text-xs text-brand-gold-alt">
                              {series.first_air_date ? series.first_air_date.split('-')[0] : 'N/D'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : titulo.trim() !== '' && !isSearching ? (
                    <div className="p-4 text-center text-sm text-brand-text-muted font-light leading-relaxed">
                      Nenhuma serie encontrada no TMDB.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="capa" className="text-xs text-brand-text uppercase tracking-widest">
                URL da Capa
              </label>
              <input
                id="capa"
                value={capaUrl}
                onChange={(event) => setCapaUrl(event.target.value)}
                className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2.5 rounded focus:outline-none focus:border-brand-gold font-light text-sm"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-2 w-full">
                <label htmlFor="temp" className="text-xs text-brand-text uppercase tracking-widest">
                  Temporada
                </label>
                <input
                  id="temp"
                  type="number"
                  min="1"
                  required
                  value={temporada}
                  onChange={(event) => setTemporada(event.target.value)}
                  className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2.5 rounded focus:outline-none focus:border-brand-gold font-light text-center"
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label htmlFor="total" className="text-xs text-brand-text uppercase tracking-widest">
                  Episodios Totais
                </label>
                <input
                  id="total"
                  type="number"
                  min="1"
                  required
                  value={totalEps}
                  onChange={(event) => setTotalEps(event.target.value)}
                  className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2.5 rounded focus:outline-none focus:border-brand-gold font-light text-center"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-xs uppercase tracking-wider text-brand-text-muted hover:text-brand-text transition-colors"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending || !titulo.trim()}
                className={clsx(
                  'px-6 py-2 text-xs uppercase tracking-widest bg-brand-gold text-brand-bg font-medium rounded transition-all',
                  'hover:bg-opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
                )}
              >
                Adicionar
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 hover:text-brand-gold">
              <X size={16} />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
