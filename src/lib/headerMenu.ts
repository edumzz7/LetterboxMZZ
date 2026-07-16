export const HEADER_MENU_OPEN_EVENT = 'cinerats:header-menu-open';

export type HeaderMenuId = 'info' | 'profile' | 'activity' | 'cineMatch';

export function notifyHeaderMenuOpen(menu: HeaderMenuId) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<HeaderMenuId>(HEADER_MENU_OPEN_EVENT, { detail: menu }));
}
