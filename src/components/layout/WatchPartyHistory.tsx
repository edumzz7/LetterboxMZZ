import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Film, Tv } from 'lucide-react';
import { useLocation } from 'wouter';
import type { RankedUser, WatchParty } from '../../types/app';
import { completeWatchParty, listWatchParties, updateWatchPartyProgress } from '../../lib/watchParties';
import TmdbImage from '../ui/TmdbImage';
import { Skeleton } from '../ui/LoadingSkeleton';

interface Props { currentUserId: string; users: RankedUser[]; compact?: boolean }

export default function WatchPartyHistory({ currentUserId, users, compact = false }: Props) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const parties = useQuery({ queryKey: ['watchparties', currentUserId], queryFn: listWatchParties, refetchInterval: 15000 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const all = parties.data || [];
  const visible = compact ? all.slice(0, 3) : all;

  async function update(party: WatchParty, finish: boolean) {
    setPendingId(party.id);
    setError(null);
    try {
      if (finish) await completeWatchParty(party.id);
      else await updateWatchPartyProgress(party.id, season, episode);
      setEditingId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['watchparties'] }),
        queryClient.invalidateQueries({ queryKey: ['series'] }),
        queryClient.invalidateQueries({ queryKey: ['personal-movies'] }),
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar a watchparty.');
    } finally { setPendingId(null); }
  }

  return <section className="rounded-2xl border border-[#151b28] bg-[#06080d] p-4 sm:p-6">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div><p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold">CineMatch</p><h2 className="mt-1 text-xl font-light">Minhas watchparties</h2></div>
      {compact && <button type="button" onClick={() => setLocation('/cinematch')} className="cursor-pointer text-xs text-brand-gold hover:underline">Ver todas</button>}
    </div>
    {parties.isLoading && <div role="status" aria-label="Carregando watchparties" className="grid gap-3 md:grid-cols-2">{[0, 1].map((item) => <div key={item} className="flex gap-3 rounded-xl border border-[#202632] p-3"><Skeleton className="h-24 w-16 shrink-0" /><div className="flex-1 space-y-3 pt-1"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-2.5 w-1/2" /><Skeleton className="h-2.5 w-1/3" /></div></div>)}</div>}
    {parties.isError && <p className="text-sm text-red-300">Não foi possível carregar as sessões.</p>}
    {!parties.isLoading && !parties.isError && !visible.length && <p className="text-sm text-brand-text-muted">Você ainda não tem watchparties. Escolha uma pessoa e descubra algo para verem juntos.</p>}
    {error && <p role="alert" className="mb-3 text-sm text-red-300">{error}</p>}
    <div className="grid gap-3 md:grid-cols-2">
      {visible.map((party) => {
        const partnerId = party.createdByUserId === currentUserId ? party.partnerUserId : party.createdByUserId;
        const partner = users.find((item) => item.id === partnerId);
        const Icon = party.mediaType === 'movie' ? Film : Tv;
        return <article key={party.id} className="flex gap-3 rounded-xl border border-[#202632] bg-[#0c0e13] p-3">
          {party.posterPath ? <TmdbImage src={party.posterPath} alt="" sizes="64px" wrapperClassName="h-24 w-16 shrink-0 rounded" className="h-24 w-16 shrink-0 rounded object-cover" /> : <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded bg-white/5"><Icon size={22} /></div>}
          <div className="min-w-0 flex-1">
            <button type="button" onClick={() => setLocation(`/${party.mediaType === 'movie' ? 'filme' : 'serie'}/${party.providerExternalId}`)} className="cursor-pointer text-left text-sm font-semibold hover:text-brand-gold">{party.title}</button>
            <p className="mt-1 text-xs text-brand-text-muted">com @{partner?.username || 'usuário'} · {party.status === 'completed' ? 'Concluída' : 'Em andamento'}</p>
            {party.mediaType === 'series' && party.progressSeason && <p className="mt-1 text-xs text-brand-gold">Até T{party.progressSeason} E{party.progressEpisode}</p>}
            <p className="mt-1 text-[11px] text-brand-text-muted">{party.createdByUserId === currentUserId ? party.creatorPoints : party.partnerPoints} MC recebidas</p>
            {party.status !== 'completed' && <div className="mt-3 flex flex-wrap gap-2">
              {party.mediaType === 'series' && <button type="button" onClick={() => { setEditingId(editingId === party.id ? null : party.id); setSeason(party.progressSeason || 1); setEpisode((party.progressEpisode || 0) + 1); }} className="cursor-pointer rounded border border-brand-gold/40 px-2 py-1 text-xs text-brand-gold hover:bg-brand-gold/10">Atualizar progresso</button>}
              <button type="button" disabled={pendingId === party.id} onClick={() => void update(party, true)} className="inline-flex cursor-pointer items-center gap-1 rounded border border-white/20 px-2 py-1 text-xs hover:border-brand-gold disabled:opacity-50"><Check size={13} />Concluir</button>
            </div>}
            {editingId === party.id && <form onSubmit={(event) => { event.preventDefault(); void update(party, false); }} className="mt-3 flex flex-wrap items-end gap-2">
              <label className="text-[11px] text-brand-text-muted">Temp.<input type="number" min={1} value={season} onChange={(event) => setSeason(Number(event.target.value))} className="mt-1 block w-14 rounded border border-white/20 bg-[#111520] p-1 text-white" /></label>
              <label className="text-[11px] text-brand-text-muted">Último ep.<input type="number" min={1} value={episode} onChange={(event) => setEpisode(Number(event.target.value))} className="mt-1 block w-16 rounded border border-white/20 bg-[#111520] p-1 text-white" /></label>
              <button type="submit" disabled={pendingId === party.id} className="cursor-pointer rounded bg-brand-gold px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50">Salvar</button>
            </form>}
          </div>
        </article>;
      })}
    </div>
  </section>;
}
