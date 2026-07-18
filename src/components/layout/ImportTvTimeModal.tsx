import { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Upload, X, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useImportTvTime } from '../../hooks/useImportTvTime';

interface ImportTvTimeModalProps {
  currentUserId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ImportTvTimeModal({
  currentUserId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ImportTvTimeModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) setUncontrolledOpen(newOpen);
    controlledOnOpenChange?.(newOpen);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadImport,
    listImports,
    getImportStatus,
    listImportErrors,
    isUploading,
    currentImport,
    imports,
    importErrors,
  } = useImportTvTime(currentUserId);

  useEffect(() => {
    if (open) {
      void listImports();
    }
  }, [open, listImports]);

  useEffect(() => {
    if (currentImport?.id) {
      const interval = setInterval(() => {
        void getImportStatus(currentImport.id);
        if (currentImport.status === 'done' || currentImport.status === 'failed') {
          clearInterval(interval);
          if (currentImport.status === 'done') {
            void listImports();
          }
          if (currentImport.status === 'failed' || importErrors.length > 0) {
            void listImportErrors(currentImport.id);
          }
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentImport, getImportStatus, listImportErrors, listImports, importErrors.length]);

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
        return <CheckCircle size={16} className="text-green-400" />;
      case 'failed':
        return <XCircle size={16} className="text-red-400" />;
      case 'pending':
      case 'importing_movies':
      case 'importing_series':
        return <Loader2 size={16} className="animate-spin text-brand-gold" />;
      default:
        return <AlertCircle size={16} className="text-gray-400" />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-2xl translate-x-[-50%] translate-y-[-50%] border border-[#222] bg-brand-bg p-6 shadow-lg rounded-xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg text-brand-gold tracking-widest uppercase">
            Importar Tv Time
          </Dialog.Title>
          <Dialog.Description className="text-sm text-brand-text-muted mt-2">
            Faça upload do arquivo ZIP exportado do Tv Time para importar sua filmografia e séries.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="border-2 border-dashed border-[#222] rounded-lg p-6 hover:border-brand-gold/30 transition">
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
                id="zip-upload"
              />
              <label
                htmlFor="zip-upload"
                className="flex flex-col items-center gap-3 cursor-pointer"
              >
                <Upload size={32} className="text-brand-gold" />
                <div className="text-center">
                  <p className="text-sm text-brand-text">
                    {selectedFile ? selectedFile.name : 'Clique para selecionar arquivo ZIP'}
                  </p>
                  <p className="text-xs text-brand-text-muted mt-1">
                    Máximo 50MB
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {currentImport && currentImport.status !== 'done' && currentImport.status !== 'failed' && (
              <div className="bg-brand-gold/10 border border-brand-gold/30 rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 size={16} className="animate-spin text-brand-gold" />
                  <p className="text-sm text-brand-gold">Importação em andamento...</p>
                </div>
                <p className="text-xs text-brand-text-muted">
                  Status: {getStatusText(currentImport.status)}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || !selectedFile || Boolean(currentImport && currentImport.status !== 'done' && currentImport.status !== 'failed')}
              className="px-4 py-2.5 text-xs uppercase tracking-[0.14em] bg-brand-gold text-brand-bg rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-gold/90 transition"
            >
              {isUploading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 size={14} className="animate-spin" />
                  Enviando...
                </span>
              ) : (
                'Iniciar Importação'
              )}
            </button>
          </form>

          {imports.length > 0 && (
            <div className="mt-6 border-t border-[#222] pt-6">
              <h3 className="text-sm text-brand-gold uppercase tracking-wider mb-3">
                Histórico de Importações
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {imports.map((imp) => (
                  <div
                    key={imp.id}
                    className="bg-[#0a0f1e] border border-[#222] rounded p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(imp.status)}
                      <div>
                        <p className="text-xs text-brand-text">
                          {getStatusText(imp.status)}
                        </p>
                        <p className="text-[10px] text-brand-text-muted">
                          {formatDate(imp.createdAt)}
                        </p>
                      </div>
                    </div>
                    {imp.status === 'failed' && imp.errorMessage && (
                      <p className="text-[10px] text-red-300 max-w-xs truncate">
                        {imp.errorMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {importErrors.length > 0 && (
            <div className="mt-4 border-t border-[#222] pt-4">
              <h3 className="text-sm text-red-400 uppercase tracking-wider mb-3">
                Erros na Importação
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {importErrors.map((err) => (
                  <div
                    key={err.id}
                    className="bg-red-500/5 border border-red-500/20 rounded p-2"
                  >
                    <p className="text-[10px] text-red-300">{err.errorMessage}</p>
                    {err.rowData !== null && err.rowData !== undefined && (
                      <pre className="text-[9px] text-brand-text-muted mt-1 overflow-x-auto">
                        {JSON.stringify(err.rowData, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 hover:text-brand-gold">
              <X size={16} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
