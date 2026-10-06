import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Film, Shuffle, Sparkles, Tv } from 'lucide-react';
import type { RankedUser, WatchPartyMediaType } from '../../types/app';
import { getCatalogGenres } from '../../lib/tmdb';
import { getCineMatchPool, pickCineMatchCandidate } from '../../lib/cinematch';
import type { CineMatchCandidate } from '../../lib/cinematch';
import { createWatchParty } from '../../lib/watchParties';
import WatchPartyHistory from './WatchPartyHistory';
import TmdbImage from '../ui/TmdbImage';
import { Skeleton } from '../ui/LoadingSkeleton';

interface Props { currentUserId: string; users: RankedUser[] }

export default function CineMatchPage({ currentUserId, users }: Props) {
  const queryClient = useQueryClient();
  const [partnerId, setPartnerId] = useState('');
  const [mediaType, setMediaType] = useState<WatchPartyMediaType>('movie');
  const [genreId, setGenreId] = useState<number | null>(null);
  const [skippedIds, setSkippedIds] = useState<Set<number>>(new Set());
  const [candidate, setCandidate] = useState<CineMatchCandidate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const partners = users.filter((user) => user.id !== currentUserId);
  const genreQuery = useQuery({ queryKey: ['cinematch-genres', mediaType], queryFn: () => getCatalogGenres(mediaType === 'movie' ? 'movie' : 'tv'), staleTime: 86_400_000 });
  const poolQuery = useQuery({
    queryKey: ['cinematch-pool', currentUserId, partnerId, mediaType],
    queryFn: () => getCineMatchPool(currentUserId, partnerId, mediaType),
    enabled: Boolean(partnerId), staleTime: 300_000,
  });
  const pool = poolQuery.data || [];
  const eligibleCount = useMemo(() => pool.filter((item) => genreId === null || item.genreIds.includes(genreId)).length, [pool, genreId]);

  useEffect(() => { setCandidate(null); setSkippedIds(new Set()); setError(null); }, [partnerId, mediaType, genreId]);

  function draw(skipCurrent: boolean) {
    const skipped = new Set(skippedIds);
    if (skipCurrent && candidate) skipped.add(candidate.id);
    let next = pickCineMatchCandidate(pool, genreId, skipped);
    if (!next && skipped.size && eligibleCount > 0) {
      skipped.clear();
      if (skipCurrent && candidate && eligibleCount > 1) skipped.add(candidate.id);
      next = pickCineMatchCandidate(pool, genreId, skipped);
    }
    setCandidate(next);
    setSkippedIds(skipped);
    setError(next ? null : 'Não há mais sugestões para este filtro. Escolha outro gênero ou parceiro.');
  }

  async function accept() {
    if (!candidate || !partnerId) return;
    setIsSaving(true); setError(null);
    try {
      await createWatchParty({ partnerUserId: partnerId, mediaType, providerExternalId: String(candidate.id), genreId });
      await queryClient.invalidateQueries({ queryKey: ['watchparties'] });
      setSkippedIds(new Set([...skippedIds, candidate.id]));
      setCandidate(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível criar a watchparty.'); }
    finally { setIsSaving(false); }
  }

  return <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-12">
    <header className="rounded-2xl border border-[#151b28] bg-[#06080d] p-5 sm:p-8">
      <div className="flex items-center gap-3 text-brand-gold"><Shuffle size={21} /><span className="text-xs font-semibold uppercase tracking-[0.25em]">CineMatch</span></div>
      <h1 className="mt-3 text-3xl font-light">Encontre algo para assistir juntos</h1>
      <p className="mt-2 text-sm text-brand-text-muted">Escolha um parceiro, o tipo de mídia e um gênero. As sugestões partem dos últimos 10 títulos vistos por cada pessoa.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="text-xs uppercase tracking-[0.12em] text-brand-gold">Parceiro
          <select value={partnerId} onChange={(event) => setPartnerId(event.target.value)} className="mt-2 w-full cursor-pointer rounded-lg border border-[#252a35] bg-[#111520] p-3 text-sm normal-case tracking-normal text-white">
            <option value="">Selecione uma pessoa</option>
            {partners.map((user) => <option key={user.id} value={user.id}>{user.display_name || user.username} (@{user.username})</option>)}
          </select>
        </label>
        <div className="text-xs uppercase tracking-[0.12em] text-brand-gold">Mídia<div className="mt-2 flex gap-2">
          {(['movie', 'series'] as const).map((type) => <button key={type} type="button" onClick={() => { setMediaType(type); setGenreId(null); }} aria-pressed={mediaType === type} className={`flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border p-3 text-sm normal-case tracking-normal ${mediaType === type ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' : 'border-[#252a35] text-white'}`}>{type === 'movie' ? <Film size={15} /> : <Tv size={15} />}{type === 'movie' ? 'Filmes' : 'Séries'}</button>)}
        </div></div>
        <label className="text-xs uppercase tracking-[0.12em] text-brand-gold">Gênero
          <select value={genreId ?? ''} onChange={(event) => setGenreId(event.target.value ? Number(event.target.value) : null)} className="mt-2 w-full cursor-pointer rounded-lg border border-[#252a35] bg-[#111520] p-3 text-sm normal-case tracking-normal text-white">
            <option value="">Surpreenda-me</option>
            {(genreQuery.data || []).map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
          </select>
        </label>
      </div>
      {partnerId && <div className="mt-6">
      {poolQuery.isLoading ? <div role="status" aria-label="Carregando sugestões" className="mt-4 flex items-center gap-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-40" /></div> : poolQuery.isError ? <p role="alert" className="text-sm text-red-300">Não foi possível montar as sugestões. Tente novamente.</p> : <p className="text-xs text-brand-text-muted">{eligibleCount} {eligibleCount === 1 ? 'possibilidade' : 'possibilidades'} para a escolha atual.</p>}
        {!candidate && <button type="button" disabled={poolQuery.isLoading || eligibleCount === 0} onClick={() => draw(false)} className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"><Sparkles size={16} /> Sortear sugestão</button>}
      </div>}
      {candidate && <div className="mt-6 flex gap-4 rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-4">
        <TmdbImage src={`https://image.tmdb.org/t/p/w185${candidate.posterPath}`} alt="" sizes="84px" wrapperClassName="h-32 w-21 shrink-0 rounded" className="h-32 w-21 rounded object-cover" />
        <div><p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold">Sugestão para vocês</p><h2 className="mt-2 text-lg font-semibold">{candidate.title}</h2>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={isSaving} onClick={() => void accept()} className="cursor-pointer rounded bg-brand-gold px-3 py-2 text-xs font-semibold text-black disabled:opacity-50">Escolher e criar watchparty</button><button type="button" onClick={() => draw(true)} className="cursor-pointer rounded border border-white/20 px-3 py-2 text-xs hover:border-brand-gold">Nova sugestão</button></div>
        </div>
      </div>}
      {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    </header>
    <WatchPartyHistory currentUserId={currentUserId} users={users} />
  </main>;
}
