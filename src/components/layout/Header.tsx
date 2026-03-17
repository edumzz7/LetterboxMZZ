import clsx from 'clsx';

interface HeaderProps {
  activeTab: 'oscars' | 'personal';
  onTabChange: (tab: 'oscars' | 'personal') => void;
  title: string;
  subtitle: string;
  canAccessOscars: boolean;
}

const Header = ({ activeTab, onTabChange, title, subtitle, canAccessOscars }: HeaderProps) => {
  return (
    <header className="flex flex-col gap-6">
      <div className="w-24 h-[1px] bg-brand-gold opacity-50" />

      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-light tracking-widest text-brand-text uppercase">
          {title}
        </h1>
        <p className="text-sm md:text-base text-brand-text-muted tracking-[0.18em] uppercase">
          {subtitle}
        </p>
      </div>

      <div className="w-24 h-[1px] bg-brand-gold opacity-50" />

      <nav className="flex flex-col md:flex-row items-center justify-center w-full gap-8 md:gap-16 mt-4 text-sm md:text-base text-brand-text-muted font-light tracking-wider border-b border-[#111] pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTabChange('oscars')}
            disabled={!canAccessOscars}
            className={clsx(
              'uppercase transition-colors pb-1',
              activeTab === 'oscars'
                ? 'text-brand-gold border-b-2 border-brand-gold'
                : 'hover:text-brand-text',
              !canAccessOscars && 'opacity-30 pointer-events-none',
            )}
          >
            OSCARS 2026
          </button>
        </div>

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
