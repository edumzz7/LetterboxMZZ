import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LogOut, Plus, Shuffle, UserRound, Image as ImageIcon } from 'lucide-react';
import type { SessionUser, RankedUser } from '../../types/app';
import AvatarDisplay from './AvatarDisplay';
import EditProfileModal from './EditProfileModal';
import ProfileAvatarModal from './ProfileAvatarModal';
import SuggestMovieModal from './SuggestMovieModal';
import CineMatchModal from './CineMatchModal';

interface UserDropdownMenuProps {
  session: SessionUser;
  currentRankedUser: RankedUser | undefined;
  users: RankedUser[];
  onLogout: () => void;
  avatarMutationPending: boolean;
  onSaveAvatar: (avatarId: string, displayName: string) => Promise<unknown>;
  onSaveProfile: (data: {
    display_name?: string;
    favorite_movie?: string;
    favorite_genre?: string;
    watch_preference?: 'home' | 'cinema';
  }) => Promise<unknown>;
}

export default function UserDropdownMenu({
  session,
  currentRankedUser,
  users,
  onLogout,
  avatarMutationPending,
  onSaveAvatar,
  onSaveProfile,
}: UserDropdownMenuProps) {
  const [activeModal, setActiveModal] = useState<
    'editProfile' | 'avatar' | 'suggest' | 'cineMatch' | null
  >(null);

  const displayAvatar = currentRankedUser?.avatar_id || 'U1F464';

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="flex items-center gap-2 outline-none rounded-full transition hover:ring-2 hover:ring-brand-gold/40 focus:ring-2 focus:ring-brand-gold">
          <AvatarDisplay avatarId={displayAvatar} className="w-10 h-10 border-2 border-brand-gold" />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[200px] bg-[#151515] border border-[#222] rounded-md shadow-xl p-1 text-sm text-brand-text"
            sideOffset={8}
            align="end"
          >
            <div className="px-2 py-2 mb-1 border-b border-[#222]">
              <p className="font-semibold">{currentRankedUser?.display_name || session.username}</p>
              <p className="text-xs text-brand-text-muted mt-0.5 opacity-70">
                @{session.username} • {currentRankedUser?.mcoins || 0} MC
              </p>
            </div>

            <DropdownMenu.Item
              onSelect={() => setTimeout(() => setActiveModal('editProfile'), 50)}
              className="flex items-center gap-2 px-2 py-2 outline-none cursor-pointer rounded hover:bg-brand-gold/10 hover:text-brand-gold transition"
            >
              <UserRound size={16} /> Editar Perfil
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => setTimeout(() => setActiveModal('avatar'), 50)}
              className="flex items-center gap-2 px-2 py-2 outline-none cursor-pointer rounded hover:bg-brand-gold/10 hover:text-brand-gold transition"
            >
              <ImageIcon size={16} /> Alterar Avatar
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => setTimeout(() => setActiveModal('suggest'), 50)}
              className="flex items-center gap-2 px-2 py-2 outline-none cursor-pointer rounded hover:bg-brand-gold/10 hover:text-brand-gold transition"
            >
              <Plus size={16} /> Indicar Filme
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => setTimeout(() => setActiveModal('cineMatch'), 50)}
              className="flex items-center gap-2 px-2 py-2 outline-none cursor-pointer rounded hover:bg-brand-gold/10 hover:text-brand-gold transition"
            >
              <Shuffle size={16} /> Cine-Match
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-[1px] bg-[#222] my-1" />

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
        <EditProfileModal
          user={currentRankedUser}
          open={activeModal === 'editProfile'}
          onOpenChange={(open) => setActiveModal(open ? 'editProfile' : null)}
          isSaving={avatarMutationPending}
          onSave={onSaveProfile}
        />
      )}

      {currentRankedUser && (
        <ProfileAvatarModal
          currentAvatarId={currentRankedUser.avatar_id}
          currentDisplayName={currentRankedUser.display_name}
          isSaving={avatarMutationPending}
          onSave={onSaveAvatar}
          open={activeModal === 'avatar'}
          onOpenChange={(open) => setActiveModal(open ? 'avatar' : null)}
        />
      )}

      <SuggestMovieModal
        currentUserId={session.id}
        users={users}
        open={activeModal === 'suggest'}
        onOpenChange={(open) => setActiveModal(open ? 'suggest' : null)}
      />

      <CineMatchModal
        currentUserId={session.id}
        users={users}
        open={activeModal === 'cineMatch'}
        onOpenChange={(open) => setActiveModal(open ? 'cineMatch' : null)}
      />
    </>
  );
}
