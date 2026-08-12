import { useMemo, useState } from 'react';
import { Award, BadgeHelp, BookOpen, CircleDollarSign, ContactRound, Gem, Group, Search, Trophy } from 'lucide-react';
import { Link } from 'wouter';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
  keywords?: string;
  searchText?: string;
}

interface FaqSection {
  id: string;
  title: string;
  icon: typeof Trophy;
  items: FaqItem[];
}

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'premiacao',
    title: 'Premiação',
    icon: Trophy,
    items: [
      {
        question: 'Qual é a diferença entre MCoins, insígnias e premiações?',
        answer: (
          <>
            <strong className="text-brand-text">MCoins</strong> são as moedas, ou pontos, que definem sua posição no ranking. <strong className="text-brand-text">Insígnias</strong> são estéticas, agregam valor ao seu perfil e valorizam seu empenho. A <strong className="text-brand-text">premiação</strong> é o presente dado, com muito carinho, ao vencedor mensal. Atualmente, é fornecido um ingresso de cinema como gesto de agradecimento por acreditarem no projeto e fazerem desta plataforma parte do seu dia.
          </>
        ),
        searchText: 'MCoins moedas pontos posição ranking Insígnias estéticas perfil empenho premiação presente vencedor mensal ingresso cinema agradecimento projeto plataforma dia',
      },
      {
        question: 'Existe uma temporada ou período específico para as premiações?',
        answer: 'O ranking é mensal. Na virada de cada mês, os pontos são zerados e todos os usuários passam a ter uma nova chance, independentemente das pontuações anteriores.',
      },
      {
        question: 'Como são definidos os vencedores de uma premiação?',
        answer: 'Atualmente, no ranking geral, o único dado levado em consideração é a quantidade de MCoins. Posteriormente, com a criação dos grupos, a flexibilidade de avaliação aumentará muito.',
      },
    ],
  },
  {
    id: 'pontuacao',
    title: 'Pontuação',
    icon: CircleDollarSign,
    items: [
      {
        question: 'Como funcionam os MCoins e quais ações geram pontos?',
        answer: (
          <>
            O detalhamento da pontuação está disponível no final da página de <Link href="/conquistas" className="text-brand-gold underline decoration-brand-gold/50 underline-offset-2 transition hover:text-brand-text">Conquistas</Link>. Vale mencionar que as métricas de pontuação estão passando por uma reformulação, visando deixar o processo mais justo, dando menos ênfase à finalização de temporadas inteiras e valorizando mais o tempo de tela, independentemente da posição do episódio.
          </>
        ),
        keywords: 'mcoins pontos moedas ranking ações',
        searchText: 'detalhamento pontuação Conquistas métricas reformulação justo finalização temporadas tempo tela episódio',
      },
      {
        question: 'Qual é a diferença entre marcar uma mídia como vista recentemente ou há mais tempo?',
        answer: (
          <>
            Uma mídia vista recentemente, no mês atual, gera pontuação. Já uma mídia adicionada como vista há mais tempo tem apenas um papel de catálogo na sua biblioteca. Atualmente, não existe uma forma de garantirmos que o usuário tenha visto uma mídia no período informado. Por isso, estamos trabalhando para endurecer as regras de cadastro, exigindo avaliações e resenhas dentro de um período após o cadastro. Além disso, após a criação dos grupos, os usuários terão liberdade para endurecer ou afrouxar as regras conforme os combinados internos.
          </>
        ),
        keywords: 'retroativo recente mês pontos catálogo avaliação resenha',
        searchText: 'mídia vista recentemente mês atual gera pontuação adicionada vista há mais tempo catálogo biblioteca garantir período informado endurecer regras cadastro avaliações resenhas grupos combinados internos',
      },
      {
        question: 'Avaliar, escrever uma resenha ou editar uma avaliação gera pontos novamente?',
        answer: 'Não. As resenhas e avaliações geram pontuação uma única vez. Qualquer alteração de nota ou texto fica a critério do usuário, para fins de catálogo pessoal.',
        keywords: 'nota resenha avaliação editar pontuação',
      },
    ],
  },
  {
    id: 'navegacao',
    title: 'Navegação',
    icon: BookOpen,
    items: [
      {
        question: 'Como adicionar alguém aos meus amigos?',
        answer: 'Ao visitar o perfil de um usuário, um ícone ao lado do nome indicará se o usuário visitado já é seu amigo.',
        keywords: 'amigos perfil adicionar seguir',
      },
      {
        question: 'Qual é a vantagem de adicionar alguém como amigo?',
        answer: 'Não existe uma “vantagem” competitiva em adicionar alguém como amigo. Você passa a receber notificações das ações que o usuário realizar, como assistir a um filme, avaliar uma série ou adicionar uma mídia à watchlist.',
        keywords: 'amigos notificações alertas watchlist',
      },
      {
        question: 'Como funciona o CineMatch?',
        answer: 'A intenção do CineMatch é ajudar usuários que estão consumindo conteúdo em dupla, facilitando a escolha de uma mídia e o cadastro de informações. A mídia é dada como vista para todos os usuários envolvidos. Existe uma atualização em curso que visa abranger grupos maiores de pessoas e WatchParties que não necessariamente sejam presenciais, como uma jornada por uma saga inteira combinada pelo grupo.',
        keywords: 'cinematch cine match dupla watchparty grupo sugestão',
      },
    ],
  },
  {
    id: 'insignias',
    title: 'Insígnias',
    icon: Award,
    items: [
      {
        question: 'O que são as insígnias e como desbloqueá-las?',
        answer: (
          <>
            Insígnias são pequenos badges, ou emblemas, conquistados após a realização de uma série de ações específicas, como assistir a todos os filmes de um diretor, finalizar um grande número de séries, adicionar muitos filmes à watchlist ou indicar filmes aos amigos. Elas podem ser visualizadas na área de destaque do seu usuário, abaixo da sua foto, ou na tela de <Link href="/conquistas" className="text-brand-gold underline decoration-brand-gold/50 underline-offset-2 transition hover:text-brand-text">Conquistas</Link>, com maior detalhamento.
          </>
        ),
        keywords: 'badges emblemas conquistas desbloquear perfil',
        searchText: 'insígnias badges emblemas ações específicas filmes diretor séries watchlist amigos área de destaque foto Conquistas detalhamento',
      },
      {
        question: 'As insígnias secretas ficam visíveis antes de serem desbloqueadas?',
        answer: 'Não. As insígnias secretas só são visualizadas depois que o usuário cumpre todos os requisitos. A ideia é incentivar o uso da plataforma de diversas formas, não somente como catálogo: interagindo com outros usuários, indicando séries, adicionando amigos e fazendo pequenas “runs” de atores e diretores específicos.',
        keywords: 'secretas ocultas requisitos runs atores diretores',
      },
      {
        question: 'Como funciona a porcentagem de progresso exibida em cada insígnia?',
        answer: 'Algumas insígnias, especialmente as de maior raridade, não dependem de uma ação específica, mas de um processo de médio ou longo prazo. Por isso, na tela de Conquistas, é possível acompanhar a porcentagem de progresso para desbloquear cada insígnia.',
        keywords: 'progresso porcentagem raridade nível',
      },
    ],
  },
  {
    id: 'grupos',
    title: 'Grupos',
    icon: Group,
    items: [
      {
        question: 'O que serão os Grupos CineRats?',
        answer: 'Os grupos terão o intuito de fazer com que sua disputa seja apenas com quem você desejar. Nem todo grupo precisará visar uma disputa: também viabilizaremos versões “amigáveis” para quem quiser apenas desfrutar do hobby com os amigos, mantendo-se fora dos rankings.',
        keywords: 'grupos disputa amigos ranking comunidade',
      },
      {
        question: 'Os grupos terão ranking, pontuação ou desafios próprios?',
        answer: 'Sim. A ideia é dar liberdade para que os grupos se organizem da forma que melhor desejarem, criando metas e desafios internos conforme as personalidades dos integrantes.',
        keywords: 'ranking pontos desafios metas',
      },
      {
        question: 'Como criar ou participar de um grupo?',
        answer: 'Assim que estiverem disponíveis, cada pessoa poderá criar ou buscar um grupo por meio de seções dedicadas na sua página inicial. A ideia é tornar esse acesso fácil e a navegação fluida.',
        keywords: 'criar participar entrar grupo página inicial',
      },
    ],
  },
  {
    id: 'oscar',
    title: 'Oscar',
    icon: Gem,
    items: [
      {
        question: 'Como funcionam os palpites do Oscar 2027?',
        answer: 'Como a Academia ainda não indicou oficialmente nenhum filme ou ator a nenhuma categoria do Oscar, nossa aba de palpites é exclusivamente recreativa. Assim que tivermos a oficialização das indicações, teremos um movimento especial na plataforma, dedicado ao evento.',
        keywords: 'oscar palpites academia categorias indicações',
      },
      {
        question: 'O que acontece se eu não preencher todas as categorias?',
        answer: 'Nada. Você apenas não participa da resenha dos ratos, e seus colegas de rataria ficarão tristes com você :(',
        keywords: 'categorias preencher aposta',
      },
      {
        question: 'Os palpites ficam visíveis para outros usuários?',
        answer: 'Sim. Os usuários que visitarem seu perfil poderão visualizar seus palpites e as informações sobre suas preferências, conforme preenchidas.',
        keywords: 'palpites perfil público visualizar preferências',
      },
    ],
  },
  {
    id: 'contato',
    title: 'Contato',
    icon: ContactRound,
    items: [
      {
        question: 'Como faço para entrar em contato, denunciar bugs e sugerir melhorias?',
        answer: (
          <>
            Nossos meios de contato oficiais são o e-mail <a href="mailto:contato@cinerats.com" className="text-brand-gold underline decoration-brand-gold/50 underline-offset-2 transition hover:text-brand-text">contato@cinerats.com</a> e o Instagram <a href="https://instagram.com/usecinerats" target="_blank" rel="noreferrer" className="text-brand-gold underline decoration-brand-gold/50 underline-offset-2 transition hover:text-brand-text">@usecinerats</a>.
          </>
        ),
        keywords: 'contato email instagram bug erro sugestão melhoria',
        searchText: 'meios oficiais e-mail contato Instagram usecinerats denunciar bugs sugerir melhorias',
      },
    ],
  },
];

export default function FaqScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = normalizeSearchValue(searchTerm);

  const filteredSections = useMemo(() => FAQ_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!normalizedSearchTerm) return true;
      const searchableText = normalizeSearchValue(`${item.question} ${item.keywords || ''} ${item.searchText || ''} ${typeof item.answer === 'string' ? item.answer : ''}`);
      return searchableText.includes(normalizedSearchTerm);
    }),
  })).filter((section) => section.items.length > 0), [normalizedSearchTerm]);

  const totalResults = filteredSections.reduce((total, section) => total + section.items.length, 0);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col gap-3 border-b border-white/5 pb-6 sm:mb-10 sm:pb-8">
        <div className="flex items-center gap-3">
          <BadgeHelp size={24} className="text-brand-gold" />
          <h1 className="text-2xl font-light tracking-[0.16em] text-brand-gold uppercase sm:text-3xl">F.A.Q.</h1>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-brand-text-muted">
          Encontre respostas para as dúvidas mais comuns sobre o funcionamento do CineRats.
        </p>
      </div>

      <div className="mb-8 sm:mb-10">
        <label htmlFor="faq-search" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-text-muted">
          Pesquisar dúvidas
        </label>
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" />
          <input
            id="faq-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Digite um termo, como pontos, amigos ou Oscar"
            className="w-full rounded-2xl border border-[#222] bg-[#090d18] py-3.5 pl-11 pr-4 text-sm text-brand-text outline-none transition placeholder:text-brand-text-muted/60 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15"
          />
        </div>
        <p className="mt-2 text-[11px] text-brand-text-muted">
          {searchTerm ? `${totalResults} ${totalResults === 1 ? 'dúvida encontrada' : 'dúvidas encontradas'}.` : 'A busca considera perguntas, respostas e termos relacionados.'}
        </p>
      </div>

      {filteredSections.length > 0 ? (
        <div className="flex flex-col gap-8 sm:gap-10">
          {filteredSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <section key={section.id} aria-labelledby={`faq-section-${section.id}`}>
                <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
                  <SectionIcon size={17} className="text-brand-gold" />
                  <h2 id={`faq-section-${section.id}`} className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
                    {section.title}
                  </h2>
                </div>
                <div className="divide-y divide-white/5 rounded-2xl border border-[#151b28] bg-black/15">
                  {section.items.map((item) => (
                    <details key={item.question} className="group px-4 first:rounded-t-2xl last:rounded-b-2xl sm:px-5">
                      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-brand-text outline-none transition hover:text-brand-gold focus-visible:text-brand-gold [&::-webkit-details-marker]:hidden">
                        <span>{item.question}</span>
                        <span className="shrink-0 text-xl font-light leading-none text-brand-gold transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                      </summary>
                      <div className="max-w-4xl pb-5 pr-7 text-sm leading-relaxed text-brand-text-muted">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#151b28] bg-black/15 px-5 py-12 text-center">
          <Search size={22} className="mx-auto mb-3 text-brand-gold-alt" />
          <p className="text-sm text-brand-text">Nenhuma dúvida encontrada.</p>
          <p className="mt-1 text-xs text-brand-text-muted">Tente buscar por outro termo.</p>
        </div>
      )}
    </div>
  );
}
