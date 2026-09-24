import { Link } from 'wouter';

export default function LatestUpdatesSection() {
  return (
    <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Últimas atualizações</h2>
      <div className="mt-4 space-y-4 text-xs leading-relaxed text-brand-text-muted">
        <div>
          <p className="mb-2 font-semibold text-brand-text">23/09 - NEW</p>
          <ul className="list-inside list-disc space-y-1.5 pl-1 text-brand-text-muted/90">
            <li>
              <Link href="/imports" className="text-brand-gold underline decoration-brand-gold/50 underline-offset-2 transition hover:text-brand-text">
                Adição da importação do Letterboxd.
              </Link>
            </li>
            <li>Agora é possível acompanhar as próximas estreias em “Chegando em Breve”.</li>
            <li>Correção de bugs apontados pela comunidade.</li>
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
