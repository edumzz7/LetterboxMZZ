import { useLocation } from 'wouter';

export default function LatestUpdatesSection() {
  const [, setLocation] = useLocation();

  return (
    <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Últimas atualizações</h2>
      <div className="mt-4 space-y-4 text-xs leading-relaxed text-brand-text-muted">
        <div>
          <p className="mb-2 font-semibold text-brand-text">10/08 - NEW</p>
          <ul className="list-inside list-disc space-y-1.5 pl-1 text-brand-text-muted/90">
            <li>Implementada tela de <button type="button" onClick={() => setLocation('/faq')} className="cursor-pointer text-brand-text underline decoration-brand-gold/60 underline-offset-2 transition hover:text-brand-gold">F.A.Q.</button></li>
            <li><button type="button" onClick={() => setLocation('/changelogs')} className="cursor-pointer text-brand-text underline decoration-brand-gold/60 underline-offset-2 transition hover:text-brand-gold">Changelogs</button> completo</li>
            <li>Adição da tela Home com as tendências da semana e sugestões por gênero e última mídia assistida</li>
            <li>Implementação da recuperação de senha</li>
            <li>Grupos e Blog seguem em construção</li>
            <li>Bugs notáveis devem ser encaminhados ao nosso e-mail, contato@cinerats.com</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
