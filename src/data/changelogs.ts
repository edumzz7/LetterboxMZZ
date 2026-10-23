export interface ChangelogEntry {
  date: string;
  title: string;
  items: Array<string | ChangelogLinkItem>;
  summaryItems?: Array<string | ChangelogLinkItem>;
}

export interface ChangelogLinkItem {
  before: string;
  linkText: string;
  linkHref: string;
  after?: string;
}

export const CHANGELOGS: ChangelogEntry[] = [
  {
    date: '2026-10-22',
    title: 'Grupos: dispute o ranking só com seus amigos',
    summaryItems: [
      'Chegaram os Grupos! Crie um grupo ou encontre um para participar e dispute o ranking mensal de MCoins só entre os membros.',
    ],
    items: [
      'Nova página de Grupos, com as abas “Meus grupos” e “Outros grupos”, onde é possível buscar grupos pelo nome.',
      'Cada grupo tem seu próprio ranking mensal, com as mesmas regras de pontuação do ranking geral e zerado na virada de cada mês.',
      'Entre em um grupo por convite do administrador ou solicitando participação. Cada pessoa pode participar de até 3 grupos, e cada grupo comporta até 15 membros.',
      'Novas notificações no sino: convites, solicitações e aceites levam direto à página do grupo.',
      'Se o administrador sair, o membro mais antigo assume a administração do grupo.',
    ],
  },
  {
    date: '2026-10-14',
    title: 'Artistas favoritos, novo CineMatch e melhorias gerais',
    summaryItems: [
      'Agora você pode favoritar artistas e diretores e receber notificações sobre novos projetos!',
      'CineMatch de cara nova: encontre o que assistir juntos presencialmente, com progresso e pontuação atualizados automaticamente para ambos.',
    ],
    items: [
      'Nova função para favoritar artistas e diretores diretamente na página da pessoa. Seus favoritos ficam reunidos em “Meus artistas favoritos” e também aparecem no Painel Pessoal.',
      'Ao favoritar um artista ou diretor, você pode acompanhar seus novos projetos e receber notificações sempre que uma novidade surgir.',
      'O CineMatch está de cara nova para ajudar quem vai assistir presencialmente com alguém e ainda não sabe o que escolher. Encontre filmes e séries para assistir juntos.',
      'Progresso compartilhado no CineMatch: quando um dos usuários envolvidos atualiza o andamento da série ou marca o filme como visto, o sistema atualiza os registros e atribui a pontuação automaticamente para ambos.',
      'Correção de pequenos fluxos no acompanhamento de séries e na autenticação de resenhas, além de ajustes gerais de navegação e uso.',
    ],
  },
  {
    date: '2026-09-25',
    title: 'Navegação mobile e atividades',
    items: [
      'Nova barra fixa no mobile com acesso à navegação, configurações, notificações e CineMatch.',
      'O menu mobile agora abre em um drawer lateral mais amplo, com rolagem interna e informações do perfil.',
      'Criação da página de Atividades: no mobile, o sino abre uma lista completa das novidades da comunidade e dos amigos.',
      'Header mobile reorganizado, com o logo centralizado e a barra de busca em uma linha própria.',
      'O rodapé com o crédito CineRats e o contato agora aparece ao final da página no mobile.',
      'A tela Comunidade passou a exibir diretamente todas as resenhas, sem o seletor entre “Todos” e “Amigos”.',
      'Ajustes na navegação desktop, com resumo de perfil e atalhos mantidos na lateral e ações restauradas no cabeçalho.',
    ],
  },
  {
    date: '2026-09-24',
    title: 'Comunidade e resenhas',
    items: [
      'Criação da aba Comunidade, um feed para acompanhar as resenhas publicadas pela comunidade CineRats.',
      'Novo visual de publicações, com autor, texto da resenha e acesso direto à obra avaliada.',
      'Carregamento contínuo de resenhas: mais publicações aparecem automaticamente conforme a navegação avança.',
    ],
  },
  {
    date: '2026-09-23',
    title: 'Importações, estreias e melhorias gerais',
    items: [
      'Adição da importação do Letterboxd para trazer histórico, watchlist, notas e resenhas para o CineRats.',
      'Criação da seção “Chegando em Breve”, com filmes e séries previstos para os próximos 60 dias e acesso às páginas dedicadas.',
      'Início da construção de “Meus artistas favoritos”, com a apresentação da futura área para acompanhar artistas.',
      'Ajustes de autorização na Home.',
      'Correção da apresentação das insígnias e conquistas nos perfis.',
      'Correções de enquadramento e rolagem horizontal no dashboard de usuários.',
      'Correções de bugs apontados pela comunidade.',
    ],
  },
  {
    date: '2026-09-16',
    title: 'Nova Home Page e melhorias gerais',
    items: [
      'Nova Home Page.',
      'Modificações estéticas importantes.',
      'Correção de bugs apontados pela comunidade.',
      'Correção de pontuação.',
    ],
  },
  {
    date: '2026-08-17',
    title: 'Sistema de pontos',
    items: [
      {
        before: 'Atualização no sistema de pontos, detalhes em ',
        linkText: 'Conquistas',
        linkHref: '/conquistas',
        after: '.',
      },
    ],
  },
  {
    date: '2026-08-12',
    title: 'Novidades e correções',
    items: [
      'Blindagem da pontuação na adição de séries como vistas, com um modal de confirmação da data de consumo da mídia.',
      'Correção de bug no comportamento mobile durante uma sequência de pesquisas.',
      'Criação da página de F.A.Q.',
    ],
  },
  {
    date: '2026-08-10',
    title: 'Novidades e correções',
    items: [
      'Adição de sugestões por gênero.',
      'Correção de "Visto" na tela dedicada de filmes.',
      'Ajustes de bugs visuais na tela Home.',
      'Melhorias no modal de post para o Instagram.',
    ],
  },
  {
    date: '2026-08-02',
    title: 'Ajustes de experiência e navegação',
    items: [
      'Ajustamos o modal de edição de perfil, unificando as opções anteriores de editar perfil e editar avatar para facilitar a navegação.',
      'Corrigimos bugs na barra de pesquisa.',
      'Refinamos a estética das páginas dedicadas de filmes, séries, atores e diretores.',
      'Agora é possível editar as preferências diretamente pelo Painel Pessoal.',
      'As resenhas agora direcionam o usuário para a mídia correspondente.',
    ],
  },
  {
    date: '2026-07-31',
    title: 'Desempenho e Conquistas',
    items: [
      'Implementação da tela de Desempenho e Conquistas.',
    ],
  },
];
