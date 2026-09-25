import { Link } from 'wouter';
import { CHANGELOGS } from '../../data/changelogs';

export default function LatestUpdatesSection() {
  const latestUpdate = CHANGELOGS[0];

  if (!latestUpdate) return null;

  const [, month, day] = latestUpdate.date.split('-');
  const formattedDate = `${day}/${month}`;

  return (
    <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Últimas atualizações</h2>
      <div className="mt-4 space-y-4 text-xs leading-relaxed text-brand-text-muted">
        <div>
          <p className="mb-2 font-semibold text-brand-text">{formattedDate} - NEW</p>
          <ul className="list-inside list-disc space-y-1.5 pl-1 text-brand-text-muted/90">
            {latestUpdate.items.slice(0, 3).map((item) => (
              <li key={typeof item === 'string' ? item : `${item.before}-${item.linkHref}`}>
                {typeof item === 'string' ? item : (
                  <>
                    {item.before}
                    <Link href={item.linkHref} className="text-brand-gold underline decoration-brand-gold/50 underline-offset-2 transition hover:text-brand-text">
                      {item.linkText}
                    </Link>
                    {item.after}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        <p>
          Bugs notáveis devem ser encaminhados ao nosso e-mail,{' '}
          <a href="mailto:contato@cinerats.com" className="text-brand-gold underline decoration-brand-gold/50 underline-offset-2 transition hover:text-brand-text">
            contato@cinerats.com
          </a>
        </p>
      </div>
    </section>
  );
}
