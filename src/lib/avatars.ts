export const AVATAR_OPTIONS = [
  { id: 'avatar_popcorn', emoji: '🍿' },
  { id: 'avatar_clapper', emoji: '🎬' },
  { id: 'avatar_projector', emoji: '📽️' },
  { id: 'avatar_bat', emoji: '🦇' },
  { id: 'avatar_wizard', emoji: '🧙‍♂️' },
  { id: 'avatar_ufo', emoji: '🛸' },
  { id: 'avatar_zombie', emoji: '🧟' },
  { id: 'avatar_detective', emoji: '🕵️' },
  { id: 'avatar_cowboy', emoji: '🤠' },
  { id: 'avatar_robot', emoji: '🤖' },
] as const;

export function avatarEmoji(avatarId: string | null | undefined) {
  const match = AVATAR_OPTIONS.find((item) => item.id === avatarId);
  return match?.emoji ?? '🎬';
}
