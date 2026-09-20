import { useState } from 'react';
import { Film, Loader2, Lock, Hash } from 'lucide-react';

interface EnterCodeScreenProps {
  onSubmit: (email: string, code: string, password: string, confirmPassword: string) => Promise<void>;
  onBackToLogin: () => void;
  error: string | null;
  isPending: boolean;
  initialEmail: string;
  initialCode: string;
}

export default function EnterCodeScreen({
  onSubmit,
  onBackToLogin,
  error,
  isPending,
  initialEmail,
  initialCode,
}: EnterCodeScreenProps) {
  const [code, setCode] = useState(initialCode);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(Boolean(initialCode));

  const handleCodeSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim() || code.length !== 6) return;
    setShowPasswordFields(true);
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password.trim() || !confirmPassword.trim()) return;

    if (password !== confirmPassword) {
      return;
    }

    await onSubmit(initialEmail, code, password, confirmPassword);
  };

  const passwordsMatch = !password || !confirmPassword || password === confirmPassword;

  if (!showPasswordFields) {
    // Tela de digitação de código
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
                  DIGITE O CÓDIGO.
                </h1>
                <p className="text-brand-text-muted leading-relaxed max-w-lg">
                  Enviamos um código de 6 dígitos para <span className="text-brand-gold">{initialEmail}</span>. Verifique seu email ou clique no link que enviamos.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-xs uppercase tracking-[0.22em]">
              <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
                Código de 6 dígitos
              </div>
              <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
                Verificação rápida
              </div>
              <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
                Acesso seguro
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
                onClick={onBackToLogin}
                className="hover:text-brand-text"
              >
                Voltar ao login
              </button>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="code" className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">
                  Código
                </label>
                <div className="flex items-center gap-3 border border-[#222] rounded-2xl px-4 py-3 bg-[#090d18]">
                  <Hash size={16} className="text-brand-gold-alt shrink-0" />
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    className="w-full bg-transparent outline-none text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="off"
                    autoFocus
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
                disabled={code.length !== 6}
                className="w-full rounded-2xl px-5 py-3 uppercase tracking-[0.25em] text-sm bg-brand-gold text-black font-medium hover:opacity-90 disabled:opacity-60 disabled:pointer-events-none transition"
              >
                Continuar
              </button>
            </form>
          </section>
        </div>
      </div>
    );
  }

  // Tela de definição de senha (quando já tem o código)
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
                NOVA SENHA.
              </h1>
              <p className="text-brand-text-muted leading-relaxed max-w-lg">
                Digite sua nova senha. Certifique-se de que seja segura e fácil de lembrar.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-xs uppercase tracking-[0.22em]">
            <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
              Senha segura
            </div>
            <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
              Confirmação
            </div>
            <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
              Acesso imediato
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
              onClick={onBackToLogin}
              className="hover:text-brand-text"
            >
              Voltar ao login
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">
                Nova Senha
              </label>
              <div className="flex items-center gap-3 border border-[#222] rounded-2xl px-4 py-3 bg-[#090d18]">
                <Lock size={16} className="text-brand-gold-alt shrink-0" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  minLength={6}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">
                Confirmar Senha
              </label>
              <div className="flex items-center gap-3 border border-[#222] rounded-2xl px-4 py-3 bg-[#090d18]">
                <Lock size={16} className="text-brand-gold-alt shrink-0" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            {!passwordsMatch && (
              <div className="border border-red-500/30 bg-red-500/10 rounded-2xl px-4 py-3 text-sm text-red-200">
                As senhas não coincidem
              </div>
            )}

            {error ? (
              <div className="border border-red-500/30 bg-red-500/10 rounded-2xl px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending || !passwordsMatch}
              className="w-full rounded-2xl px-5 py-3 uppercase tracking-[0.25em] text-sm bg-brand-gold text-black font-medium hover:opacity-90 disabled:opacity-60 disabled:pointer-events-none transition"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Processando
                </span>
              ) : (
                'Redefinir senha'
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
