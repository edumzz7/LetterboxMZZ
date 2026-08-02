import { useLocation } from 'wouter';

export default function LatestUpdatesSection() {
  const [, setLocation] = useLocation();

  return (
    <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Últimas atualizações</h2>
      <div className="mt-4 space-y-4 text-xs leading-relaxed text-brand-text-muted">
        <div>
          <p className="mb-2 font-semibold text-brand-text">02/08 - NEW</p>
          <ul className="list-inside list-disc space-y-1.5 pl-1 text-brand-text-muted/90">
            <li><button type="button" onClick={() => setLocation('/changelogs')} className="cursor-pointer text-brand-text underline decoration-brand-gold/60 underline-offset-2 transition hover:text-brand-gold">Changelogs</button> completo</li>
            <li>Adição da tela Home com as tendências da semana e sugestões</li>
            <li>Adição das telas dedicadas para atores e diretores</li>
            <li>Implementação da recuperação de senha</li>
            <li>Grupos e Blog seguem em construção</li>
          </ul>
        </div>
        <div className="border-t border-[#151b28] pt-3">
          <p className="mb-2 font-semibold text-brand-text">31/07</p>
          <ul className="list-inside list-disc space-y-1.5 pl-1 text-brand-text-muted/90">
            <li>
              Implementação de <button type="button" onClick={() => setLocation('/conquistas')} className="cursor-pointer text-brand-text underline decoration-brand-gold/60 underline-offset-2 transition hover:text-brand-gold">Desempenho e Conquistas</button>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
