import { useState, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useLocation } from 'wouter';
import { KeyRound, LogOut, Plus, Shield, Settings, Upload, Image as ImageIcon, UserRound } from 'lucide-react';
import type { SessionUser, RankedUser } from '../../types/app';
import ProfileAvatarModal from './ProfileAvatarModal';
import SuggestMovieModal from './SuggestMovieModal';
import CineMatchModal from './CineMatchModal';
import ChangePasswordModal from './ChangePasswordModal';
import AdminPanel from './AdminPanel';
import ShareReviewModal from './ShareReviewModal';
import { HEADER_MENU_OPEN_EVENT, notifyHeaderMenuOpen } from '../../lib/headerMenu';

interface UserDropdownMenuProps {
  session: SessionUser;
  currentRankedUser: RankedUser | undefined;
  users: RankedUser[];
  favoriteUserIds: string[];
  onLogout: () => void;
  avatarMutationPending: boolean;
  onSaveAvatar: (avatarId: string, displayName: string) => Promise<unknown>;
  onOpenPreferences: () => void;
  onDeleteProfile: (currentPassword: string) => Promise<void>;
  deleteProfilePending?: boolean;
  onChangePassword: (userId: string, current: string, next: string) => Promise<void>;
  onAdminReset: (targetUsername: string, newPassword: string) => Promise<void>;
  adminUsername?: string;
}

export default function UserDropdownMenu({
  session,
  currentRankedUser,
  users,
  favoriteUserIds,
  onLogout,
  avatarMutationPending,
  onSaveAvatar,
  onOpenPreferences,
  onDeleteProfile,
  deleteProfilePending = false,
  onChangePassword,
  onAdminReset,
  adminUsername,
}: UserDropdownMenuProps) {
  const [, setLocation] = useLocation();
  const [activeModal, setActiveModal] = useState<
    'avatar' | 'suggest' | 'cineMatch' | 'changePassword' | 'adminPanel' | 'shareReview' | null
  >(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleOpenCineMatch = () => setActiveModal('cineMatch');
    window.addEventListener('open-cinematch', handleOpenCineMatch);
    return () => window.removeEventListener('open-cinematch', handleOpenCineMatch);
  }, []);

  useEffect(() => {
    const handleOtherHeaderMenu = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== 'profile') setMenuOpen(false);
    };
    window.addEventListener(HEADER_MENU_OPEN_EVENT, handleOtherHeaderMenu);
    return () => window.removeEventListener(HEADER_MENU_OPEN_EVENT, handleOtherHeaderMenu);
  }, []);

  const isAdmin = adminUsername && session.username === adminUsername;

  return (
    <>
      <DropdownMenu.Root open={menuOpen} onOpenChange={(open) => { if (open) notifyHeaderMenuOpen('profile'); setMenuOpen(open); }}>
        <DropdownMenu.Trigger aria-label="Abrir opções do perfil" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-gold bg-black text-white outline-none transition hover:bg-brand-gold/10 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0">
          <Settings size={18} />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[200px] bg-[#06080d] border border-[#151b28] rounded-md shadow-xl p-1 text-sm text-brand-text"
            sideOffset={8}
            align="end"
          >
            <div 
              onClick={() => {
                setLocation(`/${session.username}`);
              }}
              className="px-2 py-2 mb-1 border-b border-[#151b28] cursor-pointer hover:bg-brand-gold/10 hover:text-brand-gold transition rounded"
              title="Ir para minha dashboard"
            >
              <p className="font-semibold">{currentRankedUser?.display_name || session.username}</p>
              <p className="text-xs text-brand-text-muted mt-0.5 opacity-70">
                @{session.username} • {currentRankedUser?.mcoins || 0} MC
              </p>
            </div>

            <DropdownMenu.Item
              onSelect={() => setTimeout(() => setActiveModal('avatar'), 50)}
              className="flex items-center gap-2 px-2 py-2 outline-none cursor-pointer rounded hover:bg-brand-gold/10 hover:text-brand-gold transition"
            >
              <UserRound size={16} /> Editar Perfil
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => setTimeout(() => setActiveModal('shareReview'), 50)}
              className="flex items-center gap-2 px-2 py-2 outline-none cursor-pointer rounded hover:bg-brand-gold/10 hover:text-brand-gold transition"
            >
              <ImageIcon size={16} /> Compartilhar Resenha
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => setTimeout(() => setActiveModal('changePassword'), 50)}
              className="flex items-center gap-2 px-2 py-2 outline-none cursor-pointer rounded hover:bg-brand-gold/10 hover:text-brand-gold transition"
            >
              <KeyRound size={16} /> Alterar Senha
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => setTimeout(() => setActiveModal('suggest'), 50)}
              className="flex items-center gap-2 px-2 py-2 outline-none cursor-pointer rounded hover:bg-brand-gold/10 hover:text-brand-gold transition"
            >
              <Plus size={16} /> Indicar Filme
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => setTimeout(() => setLocation('/imports'), 50)}
              className="flex items-center gap-2 px-2 py-2 outline-none cursor-pointer rounded hover:bg-brand-gold/10 hover:text-brand-gold transition"
            >
              <Upload size={16} /> Importar dados
            </DropdownMenu.Item>

            {isAdmin && (
              <>
                <DropdownMenu.Separator className="h-[1px] bg-[#151b28] my-1" />
                <DropdownMenu.Item
                  onSelect={() => setTimeout(() => setActiveModal('adminPanel'), 50)}
                  className="flex items-center gap-2 px-2 py-2 outline-none cursor-pointer rounded hover:bg-brand-gold/10 hover:text-brand-gold transition"
                >
                  <Shield size={16} /> Painel Admin
                </DropdownMenu.Item>
              </>
            )}

            <DropdownMenu.Separator className="h-[1px] bg-[#151b28] my-1" />

            <DropdownMenu.Item
              onSelect={onLogout}
              className="flex items-center gap-2 px-2 py-2 outline-none cursor-pointer rounded hover:bg-red-500/10 text-red-400 transition"
            >
              <LogOut size={16} /> Sair
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {currentRankedUser && (
        <ProfileAvatarModal
          currentAvatarId={currentRankedUser.avatar_id}
          currentDisplayName={currentRankedUser.display_name}
          isSaving={avatarMutationPending}
          onSave={onSaveAvatar}
          onOpenPreferences={onOpenPreferences}
          onDeleteProfile={onDeleteProfile}
          isDeleting={deleteProfilePending}
          open={activeModal === 'avatar'}
          onOpenChange={(open) => setActiveModal(open ? 'avatar' : null)}
        />
      )}

      <ChangePasswordModal
        userId={session.id}
        open={activeModal === 'changePassword'}
        onOpenChange={(open) => setActiveModal(open ? 'changePassword' : null)}
        onChangePassword={onChangePassword}
      />

      <ShareReviewModal
        currentUserId={session.id}
        currentDisplayName={currentRankedUser?.display_name || session.username}
        open={activeModal === 'shareReview'}
        onOpenChange={(open) => setActiveModal(open ? 'shareReview' : null)}
      />

      <SuggestMovieModal
        currentUserId={session.id}
        users={users}
        open={activeModal === 'suggest'}
        onOpenChange={(open) => setActiveModal(open ? 'suggest' : null)}
      />

      <CineMatchModal
        currentUserId={session.id}
        users={users}
        favoriteUserIds={favoriteUserIds}
        open={activeModal === 'cineMatch'}
        onOpenChange={(open) => setActiveModal(open ? 'cineMatch' : null)}
      />

      {isAdmin && (
        <AdminPanel
          users={users}
          currentUserId={session.id}
          open={activeModal === 'adminPanel'}
          onOpenChange={(open) => setActiveModal(open ? 'adminPanel' : null)}
          onAdminReset={onAdminReset}
        />
      )}
    </>
  );
}
