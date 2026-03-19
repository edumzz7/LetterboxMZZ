import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Eye, EyeOff, Loader2, Trash2, Tv, X } from 'lucide-react';
import clsx from 'clsx';
import { generateImagePath } from '../../lib/imageUtils';
import type { Series } from '../../hooks/useSeries';
import { PlatformSelect } from '../ui/PlatformSelect';
import { getTvWatchProviders, searchSeries } from '../../lib/tmdb';
import { updateSeriesStreaming } from '../../lib/appData';

interface SeriesCardProps {
  series: Series;
  canEdit: boolean;
  onSaveProgress: (payload: {
    id: string;
    episodios_vistos?: number;
    temporada?: number;
    total_episodios?: number;
    status?: 'watching' | 'watched';
    plataforma_slug?: string;
  }) => void;
  onDelete: (id: string) => void;
}

export default function SeriesCard({
  series,
  canEdit,
  onSaveProgress,
  onDelete,
}: SeriesCardProps) {
  const [open, setOpen] = useState(false);
  const [localEps, setLocalEps] = useState(series.episodios_vistos.toString());
  const [localTemporada, setLocalTemporada] = useState((series.temporada || 1).toString());
  const [localTotalEps, setLocalTotalEps] = useState((series.total_episodios || 0).toString());
  const [showProviders, setShowProviders] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providers, setProviders] = useState<Array<{ provider_id?: number; provider_name?: string; logo_path?: string | null }>>([]);
  const providersRef = useRef<HTMLDivElement | null>(null);

  const syncLocalState = () => {
    setLocalEps(series.episodios_vistos.toString());
    setLocalTemporada((series.temporada || 1).toString());
    setLocalTotalEps((series.total_episodios || 0).toString());
  };

  const limit = parseInt(localTotalEps, 10) || 1;
  const progressPercent =
    limit > 0 ? Math.min(100, Math.round((series.episodios_vistos / limit) * 100)) : 0;

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    const episodiosVistos = parseInt(localEps, 10);
    const temporada = parseInt(localTemporada, 10);
    const totalEpisodios = parseInt(localTotalEps, 10);

    if (Number.isNaN(episodiosVistos) || Number.isNaN(temporada) || Number.isNaN(totalEpisodios)) {
      return;
    }

    onSaveProgress({
      id: series.id,
      episodios_vistos: episodiosVistos,
      temporada,
      total_episodios: totalEpisodios,
    });
    setOpen(false);
  };

  const toggleStatus = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canEdit) return;
    const nextStatus = series.status === 'watched' ? 'watching' : 'watched';
    onSaveProgress({ id: series.id, status: nextStatus });
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canEdit) return;
    if (confirm(`Deseja remover a serie "${series.titulo}"?`)) {
      onDelete(series.id);
    }
  };

  const imageSrc = generateImagePath(series.titulo, series.capa_url);
  const isWatched = series.status === 'watched';

  useEffect(() => {
    if (!series.streaming_data) {
      setProviders([]);
      return;
    }
    try {
      const parsed = JSON.parse(series.streaming_data);
      setProviders(Array.isArray(parsed) ? parsed : []);
    } catch {
      setProviders([]);
    }
  }, [series.streaming_data]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (providersRef.current && !providersRef.current.contains(event.target as Node)) {
        setShowProviders(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const resolveProviders = async () => {
    if (providers.length > 0 || providersLoading) return;
    setProvidersLoading(true);
    try {
      const candidates = await searchSeries(series.titulo);
      const picked = candidates[0];
      if (!picked) {
        setProviders([]);
        return;
      }
      const nextProviders = await getTvWatchProviders(picked.id, 'BR');
      setProviders(nextProviders);
      await updateSeriesStreaming(series.id, JSON.stringify(nextProviders));
    } finally {
      setProvidersLoading(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) syncLocalState();
        setOpen(nextOpen);
      }}
    >
      <Dialog.Trigger asChild disabled={!canEdit}>
        <div className="flex flex-col gap-3 min-w-[140px] md:min-w-[180px] snap-center group">
          <div
            className={clsx(
              'relative aspect-[2/3] w-full rounded-md overflow-hidden bg-brand-card border border-[#222] transition-all',
              canEdit && 'hover:border-brand-gold-alt hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] cursor-pointer',
            )}
          >
            <img
              src={imageSrc}
              alt={series.titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(event) => {
                (event.target as HTMLImageElement).style.display = 'none';
                (event.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 text-center bg-brand-card">
              <Tv size={24} className="text-[#333] mb-2" />
              <span className="text-xs text-brand-text-muted">{series.titulo}</span>
            </div>

            <div
              onClick={toggleStatus}
              className={clsx(
                'absolute top-2 left-2 p-1.5 rounded-full bg-brand-bg/80 backdrop-blur-sm transition-all',
                canEdit && 'hover:scale-110',
                isWatched
                  ? 'text-brand-gold border border-brand-gold/30'
                  : 'text-brand-text-muted border border-[#333]/50 hover:text-brand-text',
              )}
              title={isWatched ? 'Retornar para watchlist' : 'Marcar como visto'}
            >
              {isWatched ? <Eye size={14} /> : <EyeOff size={14} />}
            </div>

            {canEdit ? (
              <div
                onClick={handleDelete}
                className="absolute top-10 left-2 p-1.5 rounded-full bg-brand-bg/80 backdrop-blur-sm text-brand-text-muted border border-[#333]/50 hover:text-red-500 hover:border-red-500/30 transition-all hover:scale-110"
                title="Remover"
              >
                <Trash2 size={14} />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 px-0.5">
            <h3 className="text-sm font-medium text-brand-text line-clamp-1" title={series.titulo}>
              {series.titulo}
            </h3>

            <div className="flex items-center justify-between mt-1 text-[10px] tracking-wider font-light uppercase">
              <span className="text-brand-text-muted">
                T{series.temporada || 1} • {series.episodios_vistos} / {limit > 0 ? limit : '?'} EPS
              </span>
              <span className="text-brand-gold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1 bg-[#0a0f1e] overflow-hidden rounded-full border border-[#222] mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-brand-gold-alt to-brand-gold rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <PlatformSelect
              value={series.plataforma_slug}
              onChange={(platformId) =>
                onSaveProgress({ id: series.id, plataforma_slug: platformId })
              }
              disabled={!canEdit}
            />

            <div className="relative" ref={providersRef}>
              <button
                type="button"
                onClick={() => {
                  const next = !showProviders;
                  setShowProviders(next);
                  if (next) void resolveProviders();
                }}
                className="text-[11px] uppercase tracking-[0.12em] text-brand-gold-alt hover:text-brand-gold"
              >
                Onde assistir?
              </button>
              {showProviders ? (
                <div className="absolute left-0 top-[110%] z-20 min-w-[180px] border border-[#222] rounded-md bg-[#0a0f1e] p-2">
                  {providersLoading ? (
                    <div className="flex items-center gap-2 text-xs text-brand-text-muted">
                      <Loader2 size={12} className="animate-spin" /> Carregando...
                    </div>
                  ) : providers.length > 0 ? (
                    <ul className="flex flex-col gap-1">
                      {providers.map((provider) => (
                        <li key={provider.provider_id ?? provider.provider_name} className="text-xs text-brand-text flex items-center gap-2">
                          {provider.logo_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                              alt={provider.provider_name ?? 'provider'}
                              className="w-5 h-5 rounded"
                            />
                          ) : null}
                          <span>{provider.provider_name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[10px] text-brand-text-muted uppercase tracking-[0.12em]">
                      Sem stream BR
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Dialog.Trigger>

      {canEdit ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-xs translate-x-[-50%] translate-y-[-50%] gap-4 border border-[#222] bg-brand-bg p-6 shadow-lg rounded-xl">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <Dialog.Title className="text-lg font-light text-brand-gold tracking-wider">
                EDITAR PROGRESSO
              </Dialog.Title>
              <Dialog.Description className="text-sm text-brand-text-muted">
                {series.titulo}
              </Dialog.Description>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-4">
                <label htmlFor="temp" className="text-xs text-brand-text uppercase tracking-widest shrink-0 w-20">
                  Temp. Atual:
                </label>
                <input
                  id="temp"
                  type="number"
                  min="1"
                  value={localTemporada}
                  onChange={(event) => setLocalTemporada(event.target.value)}
                  className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2 rounded focus:outline-none focus:border-brand-gold text-right"
                />
              </div>

              <div className="flex items-center gap-4">
                <label htmlFor="toteps" className="text-xs text-brand-text uppercase tracking-widest shrink-0 w-20">
                  Total Eps:
                </label>
                <input
                  id="toteps"
                  type="number"
                  min="1"
                  value={localTotalEps}
                  onChange={(event) => setLocalTotalEps(event.target.value)}
                  className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2 rounded focus:outline-none focus:border-brand-gold text-right"
                />
              </div>

              <div className="flex items-center gap-4">
                <label htmlFor="eps" className="text-xs text-brand-text uppercase tracking-widest shrink-0 w-20">
                  Episodios
                </label>
                <input
                  id="eps"
                  type="number"
                  min="0"
                  max={limit || 9999}
                  value={localEps}
                  onChange={(event) => setLocalEps(event.target.value)}
                  className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2 rounded focus:outline-none focus:border-brand-gold text-right"
                />
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
                  className="px-6 py-2 text-xs uppercase tracking-widest bg-brand-gold text-brand-bg font-medium rounded transition-all hover:bg-opacity-90 active:scale-95"
                >
                  Salvar
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
      ) : null}
    </Dialog.Root>
  );
}
