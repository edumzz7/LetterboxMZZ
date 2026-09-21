export default function LatestUpdatesSection() {
  return (
    <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Últimas atualizações</h2>
      <div className="mt-4 space-y-4 text-xs leading-relaxed text-brand-text-muted">
        <div>
          <p className="mb-2 font-semibold text-brand-text">16/09 - NEW</p>
          <ul className="list-inside list-disc space-y-1.5 pl-1 text-brand-text-muted/90">
            <li>Nova Home Page.</li>
            <li>Modificações estéticas importantes.</li>
            <li>Correção de bugs apontados pela comunidade.</li>
            <li>Correção de pontuação.</li>
          </ul>
        </div>
        <p>Bugs notáveis devem ser encaminhados ao nosso e-mail, contato@cinerats.com</p>
      </div>
    </section>
  );
}
