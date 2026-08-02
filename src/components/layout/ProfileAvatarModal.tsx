import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { ChevronDown, ChevronUp, ImageUp, UserRound, X } from 'lucide-react';
import { AVATAR_OPTIONS, isCustomAvatar } from '../../lib/avatars';
import { uploadAvatarImage } from '../../lib/appData';
import AvatarDisplay from './AvatarDisplay';

interface ProfileAvatarModalProps {
  currentAvatarId: string;
  currentDisplayName?: string;
  isSaving: boolean;
  onSave: (avatarId: string, displayName: string) => Promise<unknown>;
  onOpenPreferences: () => void;
  onDeleteProfile: (currentPassword: string) => Promise<unknown>;
  isDeleting?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ProfileAvatarModal({
  currentAvatarId,
  currentDisplayName,
  isSaving,
  onSave,
  onOpenPreferences,
  onDeleteProfile,
  isDeleting = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ProfileAvatarModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [selected, setSelected] = useState(currentAvatarId);
  const [displayName, setDisplayName] = useState(currentDisplayName || '');
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showGenericAvatars, setShowGenericAvatars] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) setUncontrolledOpen(nextOpen);
    controlledOnOpenChange?.(nextOpen);
    if (nextOpen) {
      setSelected(currentAvatarId);
      setDisplayName(currentDisplayName || '');
      setError(null);
      setDeleteError(null);
      setCurrentPassword('');
      setShowGenericAvatars(false);
      setIsConfirmingDelete(false);
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
      setError(saveError instanceof Error ? saveError.message : 'Falha ao salvar perfil.');
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    setIsProcessingUpload(true);
    try {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      if (!allowedTypes.includes(file.type)) throw new Error(`Formato inválido (${file.type}). Use JPEG, PNG, WebP ou HEIC.`);
      if (file.size > 10 * 1024 * 1024) throw new Error('Arquivo muito grande. Tamanho máximo: 10MB.');
      setSelected(await uploadAvatarImage(file));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Falha ao carregar imagem.');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setDeleteError(null);
    try {
      await onDeleteProfile(currentPassword);
      setIsConfirmingDelete(false);
      setCurrentPassword('');
    } catch (deleteProfileError) {
      setDeleteError(deleteProfileError instanceof Error ? deleteProfileError.message : 'Falha ao excluir perfil.');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <Dialog.Trigger asChild>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-brand-gold/40 px-3 py-2 text-xs uppercase tracking-[0.14em] text-brand-gold transition hover:bg-brand-gold/10">
            <UserRound size={14} /> Editar Perfil <AvatarDisplay avatarId={currentAvatarId} className="h-4 w-4" emojiClassName="text-sm" />
          </button>
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 max-h-[90vh] w-[92vw] max-w-lg translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-xl border border-[#222] bg-brand-bg p-6 shadow-lg">
          <Dialog.Title className="text-lg uppercase tracking-widest text-brand-gold">Editar Perfil</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-brand-text-muted">Personalize sua imagem e seu nome de exibição.</Dialog.Description>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-5">
            <div className="rounded-xl border border-brand-gold/25 bg-[#111] p-4">
              <div className="flex items-center gap-4">
                <AvatarDisplay avatarId={selected} className="h-20 w-20 border-2 border-brand-gold/50" emojiClassName="text-4xl" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-brand-gold">Imagem personalizada</p>
                  <p className="mt-1 text-xs leading-relaxed text-brand-text-muted">Priorize uma imagem própria. JPEG, PNG, WebP ou HEIC, até 10MB.</p>
                  <label className={clsx('mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs uppercase tracking-[0.12em] transition', isProcessingUpload ? 'cursor-not-allowed border-[#333] text-brand-text-muted opacity-50' : 'border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10')}>
                    <ImageUp size={15} /> {isProcessingUpload ? 'Enviando...' : isCustomAvatar(selected) ? 'Trocar imagem' : 'Enviar imagem'}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="sr-only" onChange={(event) => void handleUpload(event)} disabled={isProcessingUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="relative">
              <button type="button" onClick={() => setShowGenericAvatars((current) => !current)} className="flex w-full items-center justify-between rounded-lg border border-[#222] px-3 py-2 text-left text-xs uppercase tracking-[0.14em] text-brand-text-muted transition hover:border-brand-gold/40 hover:text-brand-gold">
                <span>Avatares genéricos</span>
                {showGenericAvatars ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showGenericAvatars && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 grid grid-cols-5 gap-2 rounded-xl border border-[#333] bg-[#0b0d12] p-3 shadow-2xl">
                  {AVATAR_OPTIONS.map((option) => (
                    <button key={option.id} type="button" onClick={() => { setSelected(option.id); setShowGenericAvatars(false); }} title={option.label} className={clsx('flex h-12 items-center justify-center rounded-lg border text-2xl transition', selected === option.id ? 'border-brand-gold bg-brand-gold/10' : 'border-[#222] hover:border-brand-gold/40')}>
                      {option.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-brand-text-muted">Nome de exibição</label>
              <input type="text" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Como quer ser chamado?" className="w-full rounded-lg border border-[#222] bg-[#151515] px-3 py-2 text-sm text-brand-text placeholder-brand-text-muted/50 transition focus:border-brand-gold/40 focus:outline-none" />
            </div>

            <button type="button" onClick={() => { handleOpenChange(false); onOpenPreferences(); }} className="self-start text-xs uppercase tracking-[0.14em] text-brand-gold-alt transition hover:text-brand-gold hover:underline">
              Editar preferências
            </button>

            {error && <p className="text-xs text-red-300">{error}</p>}

            <div className="mt-2 flex items-center justify-between gap-3 border-t border-[#222] pt-4">
              <button type="button" onClick={() => { setDeleteError(null); setCurrentPassword(''); setIsConfirmingDelete(true); }} className="rounded border border-red-500/40 px-4 py-2 text-xs uppercase tracking-[0.14em] text-red-300 transition hover:bg-red-500/10">Excluir perfil</button>
              <button type="submit" disabled={isSaving || isProcessingUpload} className="rounded bg-brand-gold px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-bg transition hover:bg-brand-gold/90 disabled:opacity-50">{isSaving ? 'Salvando...' : 'Salvar perfil'}</button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button type="button" aria-label="Fechar editar perfil" className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:text-brand-gold hover:opacity-100"><X size={16} /></button>
          </Dialog.Close>

          {isConfirmingDelete && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 px-4">
              <div className="w-full max-w-md rounded-xl border border-red-500/30 bg-[#090b11] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
                <h3 className="text-lg uppercase tracking-[0.14em] text-red-300">Confirmar exclusão</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">Essa ação remove seu perfil do app. Digite sua senha atual para confirmar.</p>
                <form onSubmit={handleDelete} className="mt-5 flex flex-col gap-4">
                  <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" placeholder="Senha atual" className="w-full rounded-lg border border-[#222] bg-[#151515] px-3 py-2 text-sm text-brand-text focus:border-red-400/50 focus:outline-none" required />
                  {deleteError && <p className="text-xs text-red-300">{deleteError}</p>}
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => { setIsConfirmingDelete(false); setCurrentPassword(''); setDeleteError(null); }} className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-brand-text-muted transition hover:text-brand-text">Cancelar</button>
                    <button type="submit" disabled={isDeleting} className="rounded bg-red-600 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white disabled:opacity-50">{isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
