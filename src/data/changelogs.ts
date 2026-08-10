export interface ChangelogEntry {
  date: string;
  title: string;
  items: string[];
}

export const CHANGELOGS: ChangelogEntry[] = [
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
