import { Award, Heart, Users } from 'lucide-react';

const highlights = [
  {
    Icon: Award,
    title: 'Ranking',
    text: 'Reconhecimento para sua participa\u00e7\u00e3o e uma competi\u00e7\u00e3o saud\u00e1vel, no seu ritmo.',
  },
  {
    Icon: Heart,
    title: 'Ins\u00edgnias',
    text: 'Conquistas para celebrar h\u00e1bitos, descobertas e momentos marcantes da sua biblioteca.',
  },
  {
    Icon: Users,
    title: 'Comunidade',
    text: 'Recomenda\u00e7\u00f5es, conversas e pessoas com gostos parecidos com os seus.',
  },
];

export default function ProposalPage() {
  return (
    <main className='mx-auto w-full max-w-4xl px-4 py-10 sm:px-8 lg:py-16'>
      <div className='border-l border-brand-gold/40 pl-5 sm:pl-8'>
        <p className='text-xs uppercase tracking-[0.25em] text-brand-gold-alt'>
          Qual &eacute; a proposta?
        </p>
        <h1 className='mt-3 max-w-3xl text-3xl font-light uppercase tracking-[0.08em] sm:text-5xl'>
          Seu pr&oacute;ximo filme pode render uma boa conversa.
        </h1>
        <div className='mt-7 max-w-2xl space-y-4 text-sm leading-relaxed text-brand-text-muted'>
          <p>
            Bibliotecas digitais j&aacute; existem aos montes. O CineRats quer
            ir al&eacute;m de simplesmente registrar o que voc&ecirc; assistiu:
            aqui, sua biblioteca tamb&eacute;m vira parte da experi&ecirc;ncia.
            Avalia&ccedil;&otilde;es, resenhas, indica&ccedil;&otilde;es,
            rankings e conquistas d&atilde;o novos motivos para descobrir
            hist&oacute;rias, compartilhar opini&otilde;es e acompanhar sua
            pr&oacute;pria jornada.
          </p>
          <p>
            A ideia &eacute; aproximar pessoas atrav&eacute;s do que elas
            assistem. Uma indica&ccedil;&atilde;o pode apresentar seu
            pr&oacute;ximo filme favorito, uma resenha pode come&ccedil;ar uma
            discuss&atilde;o e gostos parecidos podem fazer voc&ecirc; descobrir
            algu&eacute;m novo. O cat&aacute;logo organiza o que voc&ecirc;
            v&ecirc;; a comunidade d&aacute; assunto para isso.
          </p>
          <p>
            Assistir, avaliar, escrever e descobrir coisas novas gera progresso,
            pontos e desbloqueia ins&iacute;gnias, enquanto os rankings trazem
            uma competi&ccedil;&atilde;o leve entre amigos e outros
            usu&aacute;rios. Tudo foi pensado para reconhecer quem participa sem
            transformar o hobby em obriga&ccedil;&atilde;o ou em uma corrida por
            consumo. Por isso, a pontua&ccedil;&atilde;o segue alguns limites e
            regras que valorizam const&acirc;ncia, descoberta e envolvimento
            mais do que simplesmente assistir o m&aacute;ximo poss&iacute;vel.
          </p>
        </div>
      </div>
      <div className='mt-10 border-t border-[#151b28]'>
        {highlights.map(({ Icon, title, text }) => (
          <div
            key={title}
            className='grid gap-3 border-b border-[#151b28] py-5 sm:grid-cols-[11rem_1fr] sm:items-start sm:gap-6'
          >
            <div className='flex items-center gap-3 text-brand-text'>
              <Icon size={18} className='shrink-0 text-brand-gold' />
              <h2 className='text-xs font-semibold uppercase tracking-[0.16em]'>
                {title}
              </h2>
            </div>
            <p className='text-sm leading-relaxed text-brand-text-muted'>
              {text}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
