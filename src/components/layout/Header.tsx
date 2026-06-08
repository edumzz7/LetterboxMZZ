import clsx from 'clsx';
import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';

interface HeaderProps {
  activeTab: 'dashboard' | 'oscars' | 'personal';
  onTabChange: (tab: 'dashboard' | 'oscars' | 'personal') => void;
  title: ReactNode;
  canAccessOscars: boolean;
  onToggleSidebar: () => void;
  rightSlot?: ReactNode;
  subSlot?: ReactNode;
}

const Header = ({
  activeTab,
  onTabChange,
  title,
  canAccessOscars,
  onToggleSidebar,
  rightSlot,
  subSlot,
}: HeaderProps) => {
  return (
    <header className="flex flex-col gap-6">
      <div className="w-24 h-[1px] bg-brand-gold opacity-50" />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl md:text-4xl font-light tracking-widest text-brand-text uppercase">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            {rightSlot}
            <button
              onClick={onToggleSidebar}
              className="xl:hidden inline-flex items-center gap-2 px-3 py-2 border border-[#222] rounded-lg text-xs uppercase tracking-[0.14em] text-brand-text-muted hover:text-brand-gold"
            >
              <Menu size={14} /> Ranking
            </button>
          </div>
        </div>
        {subSlot}
      </div>

      <div className="w-24 h-[1px] bg-brand-gold opacity-50" />

      <nav className="flex flex-col md:flex-row items-center justify-center w-full gap-8 md:gap-16 mt-4 text-sm md:text-base text-brand-text-muted font-light tracking-wider border-b border-[#111] pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTabChange('dashboard')}
            className={clsx(
              'uppercase transition-colors pb-1',
              activeTab === 'dashboard'
                ? 'text-brand-gold border-b-2 border-brand-gold'
                : 'hover:text-brand-text',
            )}
          >
            PAINEL PESSOAL
          </button>
        </div>

        {canAccessOscars && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => onTabChange('oscars')}
              className={clsx(
                'uppercase transition-colors pb-1',
                activeTab === 'oscars'
                  ? 'text-brand-gold border-b-2 border-brand-gold'
                  : 'hover:text-brand-text',
              )}
            >
              OSCAR 2027
            </button>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={() => onTabChange('personal')}
            className={clsx(
              'uppercase transition-colors pb-1',
              activeTab === 'personal'
                ? 'text-brand-gold border-b-2 border-brand-gold'
                : 'hover:text-brand-text',
            )}
          >
            FILMES E SERIES
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
