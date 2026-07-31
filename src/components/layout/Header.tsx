import clsx from 'clsx';
import { cloneElement, isValidElement, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

interface HeaderProps {
  activeTab: 'home' | 'dashboard' | 'oscars' | 'movies' | 'series' | 'personal';
  onTabChange: (tab: 'home' | 'dashboard' | 'oscars' | 'movies' | 'series' | 'personal') => void;
  canAccessOscars: boolean;
  canAccessHome: boolean;
  onGoHome: () => void;
  searchSlot?: ReactNode;
  rightSlot?: ReactNode;
  hideTabs?: boolean;
  onBack?: () => void;
  title?: ReactNode;
  onToggleSidebar?: () => void;
  subSlot?: ReactNode;
}

const Header = ({ activeTab, onTabChange, canAccessOscars, canAccessHome, onGoHome, searchSlot, rightSlot, hideTabs, onBack }: HeaderProps) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const tabs: Array<{ id: HeaderProps['activeTab']; label: string; show?: boolean }> = [
    { id: 'home', label: 'Home', show: canAccessHome },
    { id: 'movies', label: 'Filmes' },
    { id: 'series', label: 'Séries' },
    { id: 'oscars', label: 'Oscar 2027', show: canAccessOscars },
    { id: 'dashboard', label: 'Painel pessoal' },
  ];

  return (
    <header className="relative z-30 overflow-visible rounded-2xl border border-[#151b28] bg-[#06080d] shadow-[0_12px_36px_rgba(0,0,0,0.2)]">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/5 px-3 py-3 sm:gap-5 sm:px-5">
        <button type="button" onClick={onGoHome} aria-label="Ir para a página inicial" className={clsx('shrink-0 text-xl sm:text-2xl font-semibold tracking-[0.12em] uppercase text-brand-text transition hover:opacity-80', mobileSearchOpen && 'max-md:hidden')}>
          <span className="text-brand-gold">C</span>ine<span className="text-brand-gold">R</span>ats
        </button>
        <div className={clsx('min-w-0 flex justify-center', mobileSearchOpen && 'max-md:col-span-3')}>
          {isValidElement(searchSlot) ? cloneElement(searchSlot as ReactElement<{ mobileOpen?: boolean; onMobileOpenChange?: (open: boolean) => void }>, { mobileOpen: mobileSearchOpen, onMobileOpenChange: setMobileSearchOpen }) : searchSlot}
        </div>
        <div className={clsx('flex items-center justify-end gap-1.5 sm:gap-2', mobileSearchOpen && 'max-md:hidden')}>{rightSlot}</div>
      </div>

      {!hideTabs && (
        <nav className="flex min-h-14 items-center justify-center gap-0 overflow-x-auto px-2 sm:px-5">
          {onBack && <button onClick={onBack} className="p-2 text-brand-gold hover:bg-white/5 rounded-lg transition" aria-label="Voltar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>}
          {tabs.filter((tab) => tab.show !== false).map((tab) => (
            <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)} className={clsx('whitespace-nowrap border-r border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition last:border-r-0 sm:px-5 sm:text-xs', activeTab === tab.id ? 'text-brand-gold font-semibold border-b-2 border-b-brand-gold' : 'text-brand-text-muted hover:text-brand-text')}>
              {tab.id === 'oscars' ? <><span className="sm:hidden">Oscar</span><span className="hidden sm:inline">Oscar 2027</span></> : tab.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
