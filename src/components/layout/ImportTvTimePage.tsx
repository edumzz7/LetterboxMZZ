import { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Loader2, CheckCircle, XCircle, AlertCircle, Film, Tv, Download } from 'lucide-react';
import { useImportTvTime } from '../../hooks/useImportTvTime';

interface ImportTvTimePageProps {
  currentUserId: string;
  onBack: () => void;
}

export default function ImportTvTimePage({ currentUserId }: ImportTvTimePageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadImport,
    listImports,
    getImportStatus,
    listImportErrors,
    downloadErrorsCSV,
    isUploading,
    isLoadingErrors,
    currentImport,
    imports,
    importErrors,
  } = useImportTvTime(currentUserId);

  useEffect(() => {
    void listImports();
  }, [listImports]);

  useEffect(() => {
    if (currentImport?.id) {
      const interval = setInterval(() => {
        void getImportStatus(currentImport.id);
        if (currentImport.status === 'done' || currentImport.status === 'failed') {
          clearInterval(interval);
          if (currentImport.status === 'done') {
            void listImports();
          }
          if (currentImport.status === 'failed') {
            void listImportErrors(currentImport.id);
            setSelectedImportId(currentImport.id);
          }
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentImport, getImportStatus, listImportErrors, listImports]);

  const handleViewErrors = async (importId: string) => {
    setSelectedImportId(importId);
    await listImportErrors(importId);
  };

  const reset = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        setError('Por favor, selecione um arquivo ZIP.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 50MB.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Por favor, selecione um arquivo ZIP.');
      return;
    }

    try {
      await uploadImport(selectedFile);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao fazer upload.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'failed':
        return <XCircle size={20} className="text-red-400" />;
      case 'pending':
      case 'importing_movies':
      case 'importing_series':
        return <Loader2 size={20} className="animate-spin text-brand-gold" />;
      default:
        return <AlertCircle size={20} className="text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'importing_movies':
        return 'Importando filmes...';
      case 'importing_series':
        return 'Importando séries...';
      case 'done':
        return 'Concluído';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'pending':
      case 'importing_movies':
      case 'importing_series':
        return 'text-brand-gold';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isImporting = currentImport && currentImport.status !== 'done' && currentImport.status !== 'failed';

  // Process errors to extract useful information
  const processedErrors = useMemo(() => {
    return importErrors.map((err) => {
      // The error object already has processed fields at the top level
      const errorData = err as unknown as {
        id: string;
        error_message: string;
        row_data: Record<string, unknown> | null;
        created_at: string;
        mediaTitle?: string;
        mediaType?: string;
        seasonNumber?: number;
        episodeNumber?: number;
      };

      const title = errorData.mediaTitle || 'Desconhecido';
      const type = errorData.mediaType === 'movie' ? 'movie' as const
                 : errorData.mediaType === 'series' ? 'series' as const
                 : 'unknown' as const;

      let details = '';
      if (type === 'series' && errorData.seasonNumber !== undefined && errorData.episodeNumber !== undefined) {
        details = `T${errorData.seasonNumber}E${errorData.episodeNumber}`;
      } else if (type === 'series' && errorData.seasonNumber !== undefined) {
        details = `Temporada ${errorData.seasonNumber}`;
      }

      return {
        ...err,
        title,
        type,
        details,
      };
    });
  }, [importErrors]);

  const errorStats = useMemo(() => {
    const movies = processedErrors.filter((e) => e.type === 'movie').length;
    const series = processedErrors.filter((e) => e.type === 'series').length;
    const unknown = processedErrors.filter((e) => e.type === 'unknown').length;
    return { movies, series, unknown, total: processedErrors.length };
  }, [processedErrors]);

  return (
    <div className="min-w-0 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-brand-gold">
          Importar Tv Time
        </h1>
        <p className="mt-1 text-sm text-brand-text-muted">
          Importe sua filmografia e séries do Tv Time • Limite: 1 importação por hora • Máximo: 50MB
        </p>
      </div>

      {/* Upload Section */}
      <div className="rounded-xl border border-[#222] bg-[#0a0f1e] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-gold">
          Nova Importação
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-[#222] rounded-lg p-8 hover:border-brand-gold/30 transition">
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
              id="zip-upload"
              disabled={isUploading || Boolean(isImporting)}
            />
            <label
              htmlFor="zip-upload"
              className={`flex flex-col items-center gap-4 ${
                isUploading || isImporting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              <Upload size={40} className="text-brand-gold" />
              <div className="text-center">
                <p className="text-base text-brand-text font-medium">
                  {selectedFile ? selectedFile.name : 'Clique para selecionar arquivo ZIP'}
                </p>
                <p className="text-sm text-brand-text-muted mt-2">
                  {selectedFile
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : 'Arquivo exportado do Tv Time (máx 50MB)'}
                </p>
              </div>
            </label>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || !selectedFile || Boolean(isImporting)}
            className="w-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] bg-brand-gold text-brand-bg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-gold/90 transition"
          >
            {isUploading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 size={16} className="animate-spin" />
                Enviando arquivo...
              </span>
            ) : (
              'Iniciar Importação'
            )}
          </button>
        </form>
      </div>

      {/* Status Atual */}
      {currentImport && isImporting && (
        <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-gold">
            Importação em Andamento
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/10">
                {getStatusIcon(currentImport.status)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-brand-text">
                  {getStatusText(currentImport.status)}
                </p>
                <p className="text-xs text-brand-text-muted mt-1">
                  Iniciado em {formatDate(currentImport.createdAt)}
                </p>
              </div>
            </div>

            {/* Progress steps */}
            <div className="space-y-2 pl-14">
              <div className={`flex items-center gap-2 text-sm ${
                currentImport.status === 'pending' ? 'text-brand-gold' : 'text-brand-text-muted'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  currentImport.status === 'pending' ? 'bg-brand-gold animate-pulse' : 'bg-brand-text-muted'
                }`} />
                Aguardando processamento
              </div>
              <div className={`flex items-center gap-2 text-sm ${
                currentImport.status === 'importing_movies' ? 'text-brand-gold' : 'text-brand-text-muted'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  currentImport.status === 'importing_movies' ? 'bg-brand-gold animate-pulse' :
                  currentImport.lastStatus === 'importing_movies' ? 'bg-green-400' : 'bg-brand-text-muted'
                }`} />
                Importando filmes
              </div>
              <div className={`flex items-center gap-2 text-sm ${
                currentImport.status === 'importing_series' ? 'text-brand-gold' : 'text-brand-text-muted'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  currentImport.status === 'importing_series' ? 'bg-brand-gold animate-pulse' : 'bg-brand-text-muted'
                }`} />
                Importando séries
              </div>
            </div>

            <div className="border-t border-brand-gold/20 pt-4 mt-4">
              <p className="text-xs text-brand-text-muted">
                Este processo pode levar alguns minutos dependendo da quantidade de dados.
                A página atualiza automaticamente a cada 2 segundos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Histórico de Importações */}
      {imports.length > 0 && (
        <div className="rounded-xl border border-[#222] bg-[#0a0f1e] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-gold">
            Histórico de Importações
          </h2>
          <div className="space-y-3">
            {imports.map((imp) => (
              <div
                key={imp.id}
                className="rounded-lg border border-[#222] bg-[#06080d] p-4 hover:border-brand-gold/20 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a0f1e]">
                      {getStatusIcon(imp.status)}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${getStatusColor(imp.status)}`}>
                        {getStatusText(imp.status)}
                      </p>
                      <p className="text-xs text-brand-text-muted mt-0.5">
                        {formatDate(imp.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {imp.status === 'done' && imp.finishedAt && (
                      <div className="text-right">
                        <p className="text-xs text-green-400">Concluído</p>
                        <p className="text-[10px] text-brand-text-muted">
                          {formatDate(imp.finishedAt)}
                        </p>
                      </div>
                    )}
                    {(imp.status === 'done' || imp.status === 'failed') && (
                      <button
                        onClick={() => handleViewErrors(imp.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                          selectedImportId === imp.id
                            ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'
                            : 'bg-[#0a0f1e] text-brand-text-muted hover:text-brand-gold border border-[#222] hover:border-brand-gold/30'
                        }`}
                      >
                        {selectedImportId === imp.id ? 'Erros carregados' : 'Ver detalhes'}
                      </button>
                    )}
                  </div>
                </div>
                {imp.status === 'failed' && imp.errorMessage && (
                  <div className="mt-3 pt-3 border-t border-[#222]">
                    <p className="text-xs text-red-300">
                      <strong>Erro:</strong> {imp.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skeleton de Loading */}
      {selectedImportId && isLoadingErrors && (
        <div className="rounded-xl border border-brand-gold/20 bg-[#0a0f1e] p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-48 bg-brand-gold/20 rounded"></div>
            <div className="h-3 w-12 bg-brand-text-muted/20 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-brand-gold/10 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-brand-text-muted/20 rounded"></div>
                <div className="h-4 w-full bg-brand-text-muted/10 rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-20 bg-brand-text-muted/10 rounded-lg"></div>
              <div className="h-20 bg-brand-text-muted/10 rounded-lg"></div>
              <div className="h-20 bg-brand-text-muted/10 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-brand-text-muted/20 rounded"></div>
              <div className="h-24 bg-brand-text-muted/10 rounded-lg"></div>
              <div className="h-24 bg-brand-text-muted/10 rounded-lg"></div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando não há erros */}
      {selectedImportId && !isLoadingErrors && importErrors.length === 0 && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-green-400">
              Resultado da Importação
            </h2>
            <button
              onClick={() => {
                setSelectedImportId(null);
              }}
              className="text-xs text-brand-text-muted hover:text-brand-text"
            >
              Fechar
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-green-400">
                Importação 100% Concluída!
              </p>
              <p className="text-sm text-brand-text-muted mt-1">
                Todos os filmes e séries foram importados com sucesso. Nenhum erro foi encontrado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Erros da Importação */}
      {importErrors.length > 0 && selectedImportId && !isLoadingErrors && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-red-400">
              Itens Não Importados
            </h2>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => downloadErrorsCSV(selectedImportId)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-0 sm:py-0 rounded-lg sm:rounded-none bg-red-500/10 sm:bg-transparent border border-red-500/20 sm:border-0 text-xs text-red-300 hover:text-red-200 sm:text-brand-text-muted sm:hover:text-brand-text transition-colors"
              >
                <Download size={14} />
                <span className="sm:inline">Exportar Planilha</span>
              </button>
              <button
                onClick={() => {
                  setSelectedImportId(null);
                }}
                className="px-3 py-1.5 sm:px-0 sm:py-0 rounded-lg sm:rounded-none bg-red-500/10 sm:bg-transparent border border-red-500/20 sm:border-0 text-xs text-red-300 hover:text-red-200 sm:text-brand-text-muted sm:hover:text-brand-text transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Resumo dos erros */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {errorStats.movies > 0 && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2">
                  <Film size={16} className="text-red-400" />
                  <div>
                    <p className="text-xs text-brand-text-muted">Filmes</p>
                    <p className="text-lg font-bold text-red-400">{errorStats.movies}</p>
                  </div>
                </div>
              </div>
            )}
            {errorStats.series > 0 && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2">
                  <Tv size={16} className="text-red-400" />
                  <div>
                    <p className="text-xs text-brand-text-muted">Séries</p>
                    <p className="text-lg font-bold text-red-400">{errorStats.series}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <div className="flex items-center gap-2">
                <XCircle size={16} className="text-red-400" />
                <div>
                  <p className="text-xs text-brand-text-muted">Total de erros</p>
                  <p className="text-lg font-bold text-red-400">{errorStats.total}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de erros agrupada */}
          <div className="space-y-6">
            {/* Filmes com erro */}
            {errorStats.movies > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-300">
                  <Film size={14} />
                  Filmes ({errorStats.movies})
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-custom">
                  {processedErrors
                    .filter((err) => err.type === 'movie')
                    .map((err, idx) => (
                      <div
                        key={err.id}
                        className="rounded-lg border border-red-500/20 bg-red-500/5 p-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-red-200 truncate">{err.title}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Séries com erro */}
            {errorStats.series > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-300">
                  <Tv size={14} />
                  Séries ({errorStats.series})
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-custom">
                  {processedErrors
                    .filter((err) => err.type === 'series')
                    .map((err, idx) => (
                      <div
                        key={err.id}
                        className="rounded-lg border border-red-500/20 bg-red-500/5 p-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <p className="font-medium text-red-200 truncate">{err.title}</p>
                              {err.details && (
                                <span className="shrink-0 text-xs text-red-300/60">
                                  {err.details}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Erros desconhecidos */}
            {errorStats.unknown > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-300">
                  <AlertCircle size={14} />
                  Outros ({errorStats.unknown})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-custom">
                  {processedErrors
                    .filter((err) => err.type === 'unknown')
                    .map((err, idx) => (
                      <div
                        key={err.id}
                        className="rounded-lg border border-red-500/20 bg-red-500/5 p-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-red-200">{err.title}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-xs text-brand-text-muted">
              <strong className="text-red-400">Importante:</strong> Estes {errorStats.total} itens não foram importados devido aos erros acima.
              O resto do arquivo foi processado normalmente. Os erros mais comuns ocorrem quando o filme/série não é encontrado na base de dados do TMDB.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
