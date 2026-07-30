import { useState } from 'react';
import { Film, Loader2, Mail } from 'lucide-react';

interface RequestPasswordResetScreenProps {
  onSubmit: (email: string) => Promise<void>;
  onBackToLogin: () => void;
  error: string | null;
  isPending: boolean;
  success: boolean;
}

export default function RequestPasswordResetScreen({
  onSubmit,
  onBackToLogin,
  error,
  isPending,
  success,
}: RequestPasswordResetScreenProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    await onSubmit(email);
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
                RESETAR SENHA.
              </h1>
              <p className="text-brand-text-muted leading-relaxed max-w-lg">
                Informe o e-mail cadastrado e enviaremos um código de 6 dígitos para redefinir sua senha.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-xs uppercase tracking-[0.22em]">
            <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
              Código enviado por email
            </div>
            <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
              Acesso rápido
            </div>
            <div className="border border-[#1c1c1c] rounded-2xl p-4 bg-black/30">
              Seguro e simples
            </div>
          </div>
        </section>

        <section className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex justify-center mb-10">
            <img src="/logo-cn.png" alt="CineRats Logo" className="w-32 sm:w-40 drop-shadow-2xl opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300" />
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="border border-brand-gold/30 bg-brand-gold/10 rounded-2xl px-4 py-3 text-sm text-brand-text">
                Código enviado! Redirecionando para a próxima etapa...
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-brand-text-muted mb-6">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="hover:text-brand-text"
                >
                  Voltar ao login
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">
                    E-mail
                  </label>
                  <div className="flex items-center gap-3 border border-[#222] rounded-2xl px-4 py-3 bg-[#090d18]">
                    <Mail size={16} className="text-brand-gold-alt shrink-0" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full bg-transparent outline-none"
                      placeholder="seu@email.com"
                      autoComplete="email"
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
                  disabled={isPending}
                  className="w-full rounded-2xl px-5 py-3 uppercase tracking-[0.25em] text-sm bg-brand-gold text-black font-medium hover:opacity-90 disabled:opacity-60 disabled:pointer-events-none transition"
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Enviando
                    </span>
                  ) : (
                    'Enviar código'
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
