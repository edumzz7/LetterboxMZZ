import { CalendarDays, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { CHANGELOGS } from '../../data/changelogs';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}

export default function ChangelogsScreen() {
  const [, setLocation] = useLocation();

  return (
    <div className="animate-in fade-in duration-500 space-y-10">
      <header className="border-b border-[#151515] pb-8">
        <p className="text-xs uppercase tracking-[0.24em] text-brand-gold-alt">CineRats</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extralight uppercase tracking-[0.08em] text-brand-text sm:text-4xl">Changelogs</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-brand-gold">
            <Sparkles size={12} /> Atualizações
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-brand-text-muted">
          Um histórico das melhorias, correções e novidades que chegam ao CineRats.
        </p>
      </header>

      <section aria-label="Histórico de atualizações" className="space-y-8">
        {CHANGELOGS.map((entry) => (
          <article key={entry.date} className="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
            <time dateTime={entry.date} className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-brand-text-muted sm:justify-end sm:pt-6 sm:text-right">
              <CalendarDays size={14} className="text-brand-gold-alt" />
              {formatDate(entry.date)}
            </time>

            <div className="relative border-l border-brand-gold/25 pl-6 sm:pl-8">
              <span className="absolute -left-[5px] top-7 h-2.5 w-2.5 rounded-full border-2 border-brand-bg bg-brand-gold shadow-[0_0_0_4px_rgba(212,175,55,0.12)]" />
              <div className="rounded-3xl border border-[#1b2330] bg-[linear-gradient(135deg,rgba(212,175,55,0.08),rgba(6,8,13,0.96)_38%)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)] sm:p-7">
                <div className="border-b border-white/5 pb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold-alt">Atualização do CineRats</p>
                  <h2 className="mt-2 text-xl font-light tracking-wide text-brand-text sm:text-2xl">{entry.title}</h2>
                </div>
                <ul className="mt-5 space-y-4 text-sm font-light leading-relaxed text-brand-text-muted">
                  {entry.items.map((item) => (
                    <li key={typeof item === 'string' ? item : `${item.before}-${item.linkHref}`} className="relative pl-5 before:absolute before:left-0 before:top-[0.65em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand-gold">
                      {typeof item === 'string' ? item : (
                        <>
                          {item.before}
                          <button type="button" onClick={() => setLocation(item.linkHref)} className="text-brand-text underline decoration-brand-gold/60 underline-offset-2 transition hover:text-brand-gold">
                            {item.linkText}
                          </button>
                          {item.after}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
