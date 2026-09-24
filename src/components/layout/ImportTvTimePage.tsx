import { useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, Loader2, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { useDataImports, isActiveImport } from '../../hooks/useDataImports';
import { getImportErrors, downloadImportErrorsCSV, type DataImport, type DataImportPlatform } from '../../lib/appData';

interface Props { currentUserId: string; onBack: () => void; embedded?: boolean }
const platforms: Record<DataImportPlatform, string> = { tv_time: 'TV Time', letterboxd: 'Letterboxd' };
const statuses: Record<DataImport['status'], string> = {
  pending: 'Preparando importação', importing_movies: 'Importando obras e avaliações',
  importing_series: 'Importando séries', done: 'Concluída', failed: 'Falhou',
};
function StatusIcon({ item }: { item: DataImport }) {
  if (isActiveImport(item)) return <Loader2 size={20} className="animate-spin text-brand-gold" />;
  if (item.status === 'failed') return <XCircle size={20} className="text-red-400" />;
  if (item.errorCount) return <AlertCircle size={20} className="text-amber-400" />;
  return <CheckCircle size={20} className="text-green-400" />;
}

export default function ImportTvTimePage({ currentUserId, embedded = false }: Props) {
  const [platform, setPlatform] = useState<DataImportPlatform>('letterboxd');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const { history, upload, status, currentImport } = useDataImports(currentUserId);
  const errors = useQuery({
    queryKey: ['data-import-errors', currentUserId, selectedId],
    queryFn: () => getImportErrors(selectedId!), enabled: Boolean(selectedId),
    retry: false, refetchOnWindowFocus: false,
  });
  const imports = [...(history.data ?? [])];
  if (currentImport) {
    const index = imports.findIndex(item => item.id === currentImport.id);
    if (index < 0) imports.unshift(currentImport);
    else imports[index] = currentImport;
  }
  const selected = imports.find(item => item.id === selectedId);
  const busy = upload.isPending || imports.some(isActiveImport);
  const disabled = busy || history.isPending || history.isError;
  const resetFile = () => {
    setFile(null); setFileError(''); upload.reset();
    if (fileInput.current) fileInput.current.value = '';
  };
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file || disabled) return;
    setSelectedId(null);
    try {
      await upload.mutateAsync({ file, platform });
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch { /* The mutation error is displayed below. */ }
  }
  async function download() {
    if (!selectedId) return;
    setDownloadError(''); setDownloading(true);
    try { await downloadImportErrorsCSV(selectedId); }
    catch (error) { setDownloadError(error instanceof Error ? error.message : 'Não foi possível baixar o relatório.'); }
    finally { setDownloading(false); }
  }

  return <div className="min-w-0 space-y-6">
    {!embedded && <header>
      <h1 className="text-2xl font-bold uppercase tracking-widest text-brand-gold">Importar dados</h1>
      <p className="mt-2 text-sm text-brand-text-muted">Traga seu histórico do Letterboxd ou TV Time para o CineRats.</p>
    </header>}
    <section className="rounded-xl border border-[#222] bg-[#0a0f1e] p-4 sm:p-6">
      <form onSubmit={submit} className="space-y-5">
        <fieldset disabled={disabled}>
          <legend className="mb-3 text-sm font-semibold text-brand-text">De onde vêm seus dados?</legend>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(platforms) as DataImportPlatform[]).map(value =>
              <label key={value} className={'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ' + (platform === value ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' : 'border-[#333] text-brand-text-muted') + (disabled ? ' opacity-50' : ' cursor-pointer')}>
                <input type="radio" name="import-platform" value={value} checked={platform === value}
                  onChange={() => { resetFile(); setPlatform(value); }} className="accent-yellow-500" />
                {platforms[value]}
              </label>)}
          </div>
        </fieldset>
        <div className="space-y-2 text-sm text-brand-text-muted">
          {platform === 'letterboxd' ? <>
            <p>
              Você pode exportar seus dados do Letterboxd clicando{' '}
              <a href="https://letterboxd.com/settings/data/" target="_blank" rel="noreferrer" className="text-brand-gold underline decoration-brand-gold/50 underline-offset-2 transition hover:text-brand-text">
                aqui
              </a>:
            </p>
            <p>Depois, envie o ZIP exportado pelo Letterboxd. Serão importados histórico, watchlist, notas e resenhas.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Séries assistidas serão consideradas completas até a data do registro: todos os episódios lançados até esse dia, sem especiais.</li>
              <li>Usamos a nota atual e a resenha mais recente por obra. Avaliações que já estão no CineRats serão mantidas.</li>
            </ul>
          </> : <p>Envie o ZIP exportado pelo TV Time para importar filmes, episódios assistidos e watchlist.</p>}
          <p className="font-medium text-brand-gold">A importação não gera pontos, inclusive para notas e resenhas.</p>
          <p>Reenviar o mesmo arquivo pode duplicar filmes no histórico.</p>
          <p className="text-xs">Até 50 MB · Limite de uma importação por hora.</p>
        </div>
        <label htmlFor={inputId} className={'flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-[#333] p-6 text-center hover:border-brand-gold/50' + (disabled ? ' pointer-events-none opacity-50' : '')}>
          <Upload size={32} className="text-brand-gold" />
          <span className="max-w-full break-all text-sm text-brand-text">{file?.name ?? ('Selecionar ZIP do ' + platforms[platform])}</span>
          {file && <span className="text-xs text-brand-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</span>}
        </label>
        <input ref={fileInput} id={inputId} type="file" accept=".zip,application/zip,application/x-zip-compressed"
          disabled={disabled} className="block w-full text-sm text-brand-text-muted"
          onChange={event => {
            const next = event.target.files?.[0];
            setFile(null); setFileError(''); upload.reset();
            if (!next) return;
            if (!next.name.toLowerCase().endsWith('.zip')) setFileError('Selecione um arquivo ZIP.');
            else if (next.size === 0) setFileError('O arquivo está vazio.');
            else if (next.size > 50 * 1024 * 1024) setFileError('O arquivo deve ter no máximo 50 MB.');
            else setFile(next);
          }} />
        {(fileError || upload.error) && <p role="alert" className="text-sm text-red-300">{fileError || upload.error?.message}</p>}
        <button type="submit" disabled={disabled || !file}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-bg disabled:cursor-not-allowed disabled:opacity-50">
          {upload.isPending && <Loader2 size={16} className="animate-spin" />}
          {upload.isPending ? 'Enviando arquivo…' : 'Iniciar importação'}
        </button>
      </form>
    </section>
    {history.isPending && <p role="status" className="text-sm text-brand-text-muted">Carregando importações…</p>}
    {history.error && <div role="alert" className="space-y-2 text-sm text-red-300">
      <p>Não foi possível carregar as importações: {history.error.message}</p>
      <button onClick={() => void history.refetch()} className="underline">Tentar novamente</button>
    </div>}
    {status.error && <p role="alert" className="text-sm text-red-300">Não foi possível atualizar o andamento: {status.error.message}. Tentaremos novamente.</p>}
    {imports.length > 0 && <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-gold">Suas importações</h2>
      {imports.map(item => <article key={item.id} className="rounded-xl border border-[#222] bg-[#0a0f1e] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusIcon item={item} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-brand-text">{platforms[item.platform] ?? item.platform} · {statuses[item.status]}{item.status === 'done' && Boolean(item.errorCount) ? ' com pendências' : ''}</p>
            <p className="text-xs text-brand-text-muted">{item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'Aguardando atualização'}</p>
          </div>
          {!isActiveImport(item) && <button type="button" onClick={() => { setSelectedId(item.id); setDownloadError(''); }}
            className="rounded-lg border border-brand-gold/30 px-3 py-2 text-xs text-brand-gold">Ver resultado</button>}
        </div>
        {isActiveImport(item) && <p role="status" className="mt-3 text-xs text-brand-text-muted">O processamento pode levar alguns minutos. Você pode sair desta página e acompanhar depois.</p>}
        {item.errorMessage && <p className="mt-3 break-words text-sm text-red-300">{item.errorMessage}</p>}
        {Boolean(item.errorCount) && <p className="mt-2 text-xs text-amber-300">{item.errorCount} registro(s) com erro. Consulte o resultado.</p>}
      </article>)}
    </section>}
    {selectedId && <section className="space-y-4 rounded-xl border border-[#333] bg-[#0a0f1e] p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-brand-gold">Resultado da importação</h2>
        <button type="button" onClick={() => setSelectedId(null)} className="text-xs text-brand-text-muted">Fechar resultado</button>
      </div>
      {errors.isPending && <p role="status" className="text-sm text-brand-text-muted">Carregando resultado…</p>}
      {errors.error && <div role="alert" className="text-sm text-red-300">
        <p>Não foi possível consultar os erros: {errors.error.message}</p>
        <button onClick={() => void errors.refetch()} className="mt-2 underline">Tentar novamente</button>
      </div>}
      {errors.isSuccess && <>
        {selected?.status === 'failed' ? <p className="text-sm text-red-300">A importação falhou. {selected.errorMessage ?? 'Consulte os registros abaixo.'}</p>
          : errors.data.length === 0 ? <p className="text-sm text-green-400">Importação concluída sem erros reportados.</p>
          : <p className="text-sm text-amber-300">Importação concluída com {errors.data.length} registro(s) não importado(s).</p>}
        {errors.data.length > 0 && <>
          <button type="button" disabled={downloading} onClick={() => void download()} className="flex items-center gap-2 text-sm text-brand-gold disabled:opacity-50">
            <Download size={16} />{downloading ? 'Baixando…' : 'Baixar relatório CSV'}
          </button>
          {downloadError && <p role="alert" className="text-sm text-red-300">{downloadError}</p>}
          <ul className="max-h-96 space-y-3 overflow-y-auto">
            {errors.data.map(item => <li key={item.id} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="break-words text-sm font-medium text-brand-text">{item.mediaTitle ?? 'Obra não identificada'}</p>
              {item.seasonNumber != null && <p className="text-xs text-brand-text-muted">Temporada {item.seasonNumber}{item.episodeNumber != null ? (' · Episódio ' + item.episodeNumber) : ''}</p>}
              <p className="mt-1 break-words text-sm text-red-300">{item.errorMessage}</p>
            </li>)}
          </ul>
        </>}
      </>}
    </section>}
  </div>;
}
