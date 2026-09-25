import clsx from 'clsx';
import { cloneElement, isValidElement, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

export type AppTab = 'home' | 'dashboard' | 'oscars' | 'movies' | 'series' | 'reviews' | 'personal';

export const APP_NAVIGATION_TABS: Array<{ id: AppTab; label: string; show?: boolean }> = [
  { id: 'home', label: 'Home' },
  { id: 'movies', label: 'Filmes' },
  { id: 'series', label: 'Séries' },
  { id: 'reviews', label: 'Comunidade' },
  { id: 'oscars', label: 'Oscar 2027' },
  { id: 'dashboard', label: 'Painel pessoal' },
];

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  canAccessOscars: boolean;
  canAccessHome: boolean;
  onGoHome: () => void;
  searchSlot?: ReactNode;
  rightSlot?: ReactNode;
  hideTabs?: boolean;
  hideTabsOnDesktop?: boolean;
  onBack?: () => void;
  title?: ReactNode;
  onToggleSidebar?: () => void;
  subSlot?: ReactNode;
}

const Header = ({ activeTab, onTabChange, canAccessOscars, canAccessHome, onGoHome, searchSlot, rightSlot, hideTabs, hideTabsOnDesktop, onBack }: HeaderProps) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const tabs = APP_NAVIGATION_TABS.map((tab) => ({
    ...tab,
    show: tab.id === 'home' ? canAccessHome : tab.id === 'oscars' ? canAccessOscars : true,
  }));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 w-screen overflow-visible border-b border-[#151b28] bg-[#06080d] shadow-[0_12px_36px_rgba(0,0,0,0.2)]">
      <div className="mx-auto grid w-full max-w-[1700px] grid-cols-1 items-center gap-3 border-b border-white/5 px-4 py-3 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:gap-5 lg:px-8">
        <button type="button" onClick={onGoHome} aria-label="Ir para a página inicial" className="justify-self-center text-xl font-semibold tracking-[0.12em] uppercase text-brand-text transition hover:opacity-80 sm:text-2xl lg:justify-self-start">
          <span className="text-brand-gold">C</span>ine<span className="text-brand-gold">R</span>ats
        </button>
        <div className="flex w-full min-w-0 justify-center">
          {isValidElement(searchSlot) ? cloneElement(searchSlot as ReactElement<{ mobileOpen?: boolean; mobileAlwaysExpanded?: boolean; onMobileOpenChange?: (open: boolean) => void }>, { mobileOpen: mobileSearchOpen, mobileAlwaysExpanded: true, onMobileOpenChange: setMobileSearchOpen }) : searchSlot}
        </div>
        <div className="hidden items-center justify-end gap-2 lg:flex">{rightSlot}</div>
      </div>

      {!hideTabs && (
        <nav className={clsx("mx-auto flex min-h-14 w-full max-w-[1700px] items-center justify-center gap-0 overflow-x-auto px-4 sm:px-6 lg:px-8", hideTabsOnDesktop && "lg:hidden")}>
          {onBack && <button onClick={onBack} className="p-2 text-brand-gold hover:bg-white/5 rounded-lg transition" aria-label="Voltar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>}
          {tabs.filter((tab) => tab.show !== false).map((tab) => (
            <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)} className={clsx('whitespace-nowrap border-r border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition last:border-r-0 sm:px-5 sm:text-xs', activeTab === tab.id ? 'text-brand-gold font-semibold border-b-2 border-b-brand-gold' : 'text-brand-text-muted hover:text-brand-text')}>
              {tab.id === 'oscars' ? <><span className="sm:hidden">Oscar</span><span className="hidden sm:inline">Oscar 2027</span></> : tab.label}
            </button>
          ))}
        </nav>
      )}
      </header>
      <div aria-hidden="true" className={clsx("shrink-0", hideTabs ? "h-[68px]" : hideTabsOnDesktop ? "h-[124px] lg:h-[68px]" : "h-[124px]")} />
    </>
  );
};

export default Header;
