import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChevronDown, Loader2, Lock, Menu, UserRound, X } from 'lucide-react';
import { useLocation } from 'wouter';
import type { ReactElement, ReactNode } from 'react';
import type { SessionUser } from '../../types/app';

interface PublicHeaderProps {
  session: SessionUser | null;
  searchSlot: ReactNode;
  onLogin: (identifier: string, password: string) => Promise<void>;
  loginError: string | null;
  loginPending: boolean;
}

interface SearchSlotProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  mobileBorderless?: boolean;
}

export default function PublicHeader({
  session,
  searchSlot,
  onLogin,
  loginError,
  loginPending,
}: PublicHeaderProps) {
  const [, setLocation] = useLocation();
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const nextY = window.scrollY;
      if (Math.abs(nextY - lastY) < 10) return;
      setVisible(
        nextY < 80 ||
          nextY < lastY ||
          loginOpen ||
          menuOpen ||
          mobileSearchOpen,
      );
      lastY = nextY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [loginOpen, menuOpen, mobileSearchOpen]);
  useEffect(() => {
    if (!loginOpen) return;
    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      if (!loginDropdownRef.current?.contains(event.target as Node)) {
        setLoginOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePointerDown);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsidePointerDown);
  }, [loginOpen]);
  const go = (path: string) => {
    setMenuOpen(false);
    setMobileSearchOpen(false);
    setLoginOpen(false);
    setLocation(path);
  };
  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password.trim()) return;
    await onLogin(identifier, password);
  };
  const handleMobileSearchOpenChange = (open: boolean) => {
    setMobileSearchOpen(open);
    if (open) {
      setMenuOpen(false);
      setLoginOpen(false);
    }
  };
  const renderedSearchSlot = isValidElement<SearchSlotProps>(searchSlot)
    ? cloneElement(searchSlot as ReactElement<SearchSlotProps>, {
        mobileOpen: mobileSearchOpen,
        onMobileOpenChange: handleMobileSearchOpenChange,
        mobileBorderless: true,
      })
    : searchSlot;
  const nav = [
    ['Filmes', '/movies'],
    ['Séries', '/series'],
    ['Qual é a proposta?', '/proposta'],
    ['FAQ', '/faq'],
  ] as const;
  return (
    <div
      className={`sticky top-0 z-50 transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-[calc(100%+12px)]'}`}
    >
      <header className='relative border-b border-[#151b28] bg-[#06080d]/95 px-4 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.25)] backdrop-blur sm:px-6 lg:px-8'>
        <div className='relative mx-auto flex max-w-[1700px] items-center gap-2 sm:gap-3'>
          <button
            type='button'
            onClick={() => go('/')}
            className='shrink-0 text-lg font-semibold uppercase tracking-[0.12em] text-brand-text sm:text-xl'
            aria-label='Ir para a home do CineRats'
          >
            <span className='text-brand-gold'>C</span>ine
            <span className='text-brand-gold'>R</span>ats
          </button>
          <div
            className={`min-w-0 flex-1 ${mobileSearchOpen ? 'max-md:absolute max-md:inset-x-0 max-md:top-0 max-md:z-30' : ''}`}
          >
            {renderedSearchSlot}
          </div>
          <nav className='hidden items-center gap-4 xl:flex'>
            {nav.map(([label, path]) => (
              <button
                key={path}
                type='button'
                onClick={() => go(path)}
                className='whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted transition hover:text-brand-gold'
              >
                {label}
              </button>
            ))}
          </nav>
          <div className='flex shrink-0 items-center gap-1 sm:gap-2'>
            {session ? (
              <button
                type='button'
                onClick={() => go(`/${session.username}`)}
                className='rounded-xl border border-brand-gold/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-gold transition hover:bg-brand-gold/10'
              >
                Minha dashboard
              </button>
            ) : (
              <>
                <div ref={loginDropdownRef} className='relative'>
                  <button
                    type='button'
                    onClick={() => setLoginOpen((value) => !value)}
                    className='inline-flex items-center gap-1 rounded-xl px-2 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-brand-text transition hover:bg-white/5 hover:text-brand-gold sm:px-3 sm:text-[10px] sm:tracking-[0.14em]'
                  >
                    <span className='sm:hidden'>Login</span>
                    <span className='hidden sm:inline'>Faça login</span>
                    <ChevronDown size={13} className='hidden sm:block' />
                  </button>
                  {loginOpen && (
                    <form
                      onSubmit={submitLogin}
                      className='fixed inset-x-4 top-[72px] z-50 w-auto space-y-3 rounded-2xl border border-[#222] bg-brand-card p-4 shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[19rem]'
                    >
                      <div className='flex items-center gap-2 rounded-xl border border-[#222] bg-[#090d18] px-3 py-2'>
                        <UserRound size={14} className='text-brand-gold-alt' />
                        <input
                          value={identifier}
                          onChange={(event) =>
                            setIdentifier(event.target.value)
                          }
                          autoComplete='username'
                          placeholder='E-mail ou username'
                          className='min-w-0 flex-1 bg-transparent text-sm outline-none'
                        />
                      </div>
                      <div className='flex items-center gap-2 rounded-xl border border-[#222] bg-[#090d18] px-3 py-2'>
                        <Lock size={14} className='text-brand-gold-alt' />
                        <input
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          type='password'
                          autoComplete='current-password'
                          placeholder='Senha'
                          className='min-w-0 flex-1 bg-transparent text-sm outline-none'
                        />
                      </div>
                      <div className='flex items-center justify-between gap-3'>
                        <button
                          type='button'
                          onClick={() => go('/conta/esqueci-senha')}
                          className='text-[10px] uppercase tracking-[0.12em] text-brand-text-muted hover:text-brand-gold'
                        >
                          Esqueci minha senha
                        </button>
                        <button
                          type='submit'
                          disabled={loginPending}
                          className='rounded-xl bg-brand-gold px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black disabled:opacity-60'
                        >
                          {loginPending ? (
                            <Loader2 size={15} className='animate-spin' />
                          ) : (
                            'Entrar'
                          )}
                        </button>
                      </div>
                      {loginError && (
                        <p className='text-xs text-red-300'>{loginError}</p>
                      )}
                    </form>
                  )}
                </div>
                <button
                  type='button'
                  onClick={() => go('/cadastro')}
                  className='rounded-xl bg-brand-gold px-2 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-black transition hover:opacity-90 sm:px-3 sm:text-[10px] sm:tracking-[0.14em]'
                >
                  <span className='sm:hidden'>Criar conta</span>
                  <span className='hidden sm:inline'>Crie sua conta</span>
                </button>
              </>
            )}
          </div>
          <button
            type='button'
            onClick={() => {
              setMobileSearchOpen(false);
              setMenuOpen((value) => !value);
            }}
            aria-label='Abrir navegação'
            className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-text transition hover:bg-white/5 hover:text-brand-gold md:hidden'
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {menuOpen && (
          <nav className='mx-auto mt-3 grid max-w-[1700px] grid-cols-2 gap-1 border-t border-white/5 pt-3 md:hidden'>
            {nav.map(([label, path]) => (
              <button
                key={path}
                type='button'
                onClick={() => go(path)}
                className='rounded-lg px-3 py-2 text-left text-xs text-brand-text-muted hover:bg-white/5 hover:text-brand-gold'
              >
                {label}
              </button>
            ))}
          </nav>
        )}
      </header>
    </div>
  );
}
