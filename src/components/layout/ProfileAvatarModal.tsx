import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { ImageUp, UserRound, X } from 'lucide-react';
import { AVATAR_OPTIONS, isCustomAvatar } from '../../lib/avatars';
import { uploadAvatarImage } from '../../lib/appData';
import AvatarDisplay from './AvatarDisplay';

interface ProfileAvatarModalProps {
  currentAvatarId: string;
  currentDisplayName?: string;
  isSaving: boolean;
  onSave: (avatarId: string, displayName: string) => Promise<unknown>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ProfileAvatarModal({
  currentAvatarId,
  currentDisplayName,
  isSaving,
  onSave,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ProfileAvatarModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const [selected, setSelected] = useState(currentAvatarId);
  const [displayName, setDisplayName] = useState(currentDisplayName || '');
  const [error, setError] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) setUncontrolledOpen(nextOpen);
    controlledOnOpenChange?.(nextOpen);
    if (nextOpen) {
      setSelected(currentAvatarId);
      setDisplayName(currentDisplayName || '');
      setError(null);
    } else {
      setTimeout(() => {
        document.body.style.pointerEvents = '';
      }, 500);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await onSave(selected, displayName.trim());
      handleOpenChange(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Falha ao salvar avatar.');
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    setIsProcessingUpload(true);

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Formato inválido (${file.type}). Use JPEG, PNG, WebP ou HEIC.`);
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB.');
      }

      // Upload to API
      const avatarPath = await uploadAvatarImage(file);

      // Set the returned path as the selected avatar
      setSelected(avatarPath);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Falha ao carregar imagem.');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <Dialog.Trigger asChild>
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-brand-gold/40 rounded-lg text-xs uppercase tracking-[0.14em] text-brand-gold hover:bg-brand-gold/10 transition">
            <UserRound size={14} /> Editar Perfil <AvatarDisplay avatarId={currentAvatarId} className="w-4 h-4" emojiClassName="text-sm" />
          </button>
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-lg translate-x-[-50%] translate-y-[-50%] border border-[#222] bg-brand-bg p-6 shadow-lg rounded-xl">
          <Dialog.Title className="text-lg text-brand-gold tracking-widest uppercase">Editar Perfil</Dialog.Title>
          <Dialog.Description className="text-sm text-brand-text-muted mt-2">
            Atualize seu nome de exibicao e selecione seu icone.
          </Dialog.Description>

          <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-brand-text-muted mb-1">
                Nome de Exibicao
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como quer ser chamado?"
                className="w-full bg-[#151515] border border-[#222] rounded-lg px-3 py-2 text-sm text-brand-text placeholder-brand-text-muted/50 focus:border-brand-gold/40 focus:outline-none transition"
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-brand-text-muted mb-2">
                Avatar
              </label>
              <div className="grid grid-cols-5 gap-2">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelected(option.id)}
                  title={option.label}
                  className={clsx(
                    'h-12 rounded-lg border text-2xl flex items-center justify-center transition',
                    selected === option.id
                      ? 'border-brand-gold bg-brand-gold/10'
                      : 'border-[#222] hover:border-brand-gold/40',
                  )}
                >
                  {option.emoji}
                </button>
              ))}
            </div>

            <label
              className={clsx(
                'mt-3 flex items-center justify-between gap-3 rounded-lg border border-dashed px-3 py-3 text-xs uppercase tracking-[0.14em] transition cursor-pointer',
                isCustomAvatar(selected)
                  ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                  : 'border-[#222] text-brand-text-muted hover:border-brand-gold/40 hover:text-brand-gold',
                isProcessingUpload && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="inline-flex items-center gap-2">
                <ImageUp size={15} />
                {isProcessingUpload ? 'Enviando...' : isCustomAvatar(selected) ? 'Imagem Personalizada' : 'Enviar Imagem'}
              </span>
              {isCustomAvatar(selected) ? (
                <AvatarDisplay avatarId={selected} className="w-8 h-8" emojiClassName="text-lg" />
              ) : null}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                className="sr-only"
                onChange={(event) => void handleUpload(event)}
                disabled={isProcessingUpload}
              />
            </label>
            <p className="text-xs text-brand-text-muted/60 mt-1">
              Formatos: JPEG, PNG, WebP, HEIC • Tamanho máximo: 10MB
            </p>
            </div>

            {error ? <p className="text-xs text-red-300 mt-3">{error}</p> : null}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || isProcessingUpload}
                className="px-4 py-2 text-xs uppercase tracking-[0.14em] bg-brand-gold text-brand-bg rounded disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar perfil'}
              </button>
            </div>
          </form>

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
