import type { HeaderMenuId } from "../types";
import { HEADER_MENU_OPEN_EVENT } from "./constants";

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function notifyHeaderMenuOpen(menu: HeaderMenuId) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<HeaderMenuId>(HEADER_MENU_OPEN_EVENT, { detail: menu }),
  );
}
