import { useState } from 'react';
import { Film, Loader2, Lock, UserRound } from 'lucide-react';

type Mode = 'login' | 'register';

interface AuthScreenProps {
  onLogin: (identifier: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  error: string | null;
  isPending: boolean;
}

export default function AuthScreen({
  onLogin,
  onRegister,
  error,
  isPending,
}: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) return;

    if (mode === 'register' && !email.trim()) return;

    if (mode === 'login') {
      await onLogin(username, password);
      return;
    }

    await onRegister(username, email, password);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.15fr_0.85fr] border border-[#171717] rounded-[28px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.08),_transparent_35%),linear-gradient(135deg,_rgba(10,15,30,0.92),_rgba(0,0,0,0.98))] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <section className="p-8 md:p-12 lg:p-14 border-b lg:border-b-0 lg:border-r border-[#171717] flex flex-col justify-between gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 text-brand-gold uppercase tracking-[0.35em] text-xs">
              <Film size={16} />
              CineRats
            </div>

            <div className="space-y-4 max-w-xl">
              <h1 className="text-4xl md:text-5xl font-light leading-tight tracking-[0.08em] uppercase">
                SEU CLUBE DE CINEMA PARTICULAR.
              </h1>
              <p className="text-brand-text-muted leading-relaxed max-w-lg">
                Monte sua biblioteca particular, compartilhe seu gosto com os amigos e ganhe pontos a cada filme ou série assistido. Seu hobby favorito ainda mais interessante!
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-xs uppercase tracking-[0.22em]">
            <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
              Suba no ranking a cada play ou apenas monte sua coleção.
            </div>
            <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
              Palpite, indique e interaja
            </div>
            <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
              Seu feed, do seu jeito!
            </div>
          </div>
        </section>

        <section className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex justify-center mb-10">
            <img src="/logo-cn.png" alt="CineRats Logo" className="w-32 sm:w-40 drop-shadow-2xl opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300" />
          </div>

          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-brand-text-muted mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={mode === 'login' ? 'text-brand-gold' : 'hover:text-brand-text'}
            >
              Login
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={mode === 'register' ? 'text-brand-gold' : 'hover:text-brand-text'}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">
                {mode === 'login' ? 'Username ou E-mail' : 'Username'}
              </label>
              <div className="flex items-center gap-3 border border-[#222] rounded-2xl px-4 py-3 bg-[#090d18]">
                <UserRound size={16} className="text-brand-gold-alt shrink-0" />
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder={mode === 'login' ? "seu_usuario ou email" : "seu_usuario"}
                  autoComplete="username"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">
                  E-mail
                </label>
                <div className="flex items-center gap-3 border border-[#222] rounded-2xl px-4 py-3 bg-[#090d18]">
                  <UserRound size={16} className="text-brand-gold-alt shrink-0 opacity-0" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent outline-none"
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">
                Senha
              </label>
              <div className="flex items-center gap-3 border border-[#222] rounded-2xl px-4 py-3 bg-[#090d18]">
                <Lock size={16} className="text-brand-gold-alt shrink-0" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Sua senha"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            {error ? (
              <div className="border border-red-500/30 bg-red-500/10 rounded-2xl px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl px-5 py-3 uppercase tracking-[0.25em] text-sm bg-brand-gold text-black font-medium hover:opacity-90 disabled:opacity-60 disabled:pointer-events-none transition"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Processando
                </span>
              ) : mode === 'login' ? (
                'Entrar'
              ) : (
                'Criar conta'
              )}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-[#222] flex-1"></div>
              <span className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">OU</span>
              <div className="h-px bg-[#222] flex-1"></div>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                import('../../lib/appData').then(m => m.loginWithGoogle());
              }}
              className="w-full rounded-2xl px-5 py-3 uppercase tracking-[0.25em] text-sm bg-white text-black font-medium hover:bg-gray-100 disabled:opacity-60 disabled:pointer-events-none transition flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Entrar com Google
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
