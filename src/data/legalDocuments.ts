export type LegalListItem = {
  label?: string;
  text: string;
  href?: string;
};

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: LegalListItem[] };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
};

const CONTACT_ITEMS: LegalListItem[] = [
  {
    label: 'E-mail',
    text: 'contato@cinerats.com',
    href: 'mailto:contato@cinerats.com',
  },
  {
    label: 'Instagram',
    text: '@usecinerats',
    href: 'https://instagram.com/usecinerats',
  },
];

export const PRIVACY_POLICY: LegalDocument = {
  eyebrow: 'Privacidade',
  title: 'Política de Privacidade',
  updatedAt: '02/11/2026',
  intro:
    'O CineRats valoriza a sua privacidade e a transparência. Esta Política explica como coletamos, usamos e protegemos as suas informações ao utilizar a nossa plataforma, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).',
  sections: [
    {
      title: 'Dados que Coletamos',
      blocks: [
        {
          type: 'ul',
          items: [
            {
              label: 'Dados de Cadastro',
              text: 'Ao criar uma conta, coletamos seu nome de usuário, endereço de e-mail e senha (armazenada de forma criptografada, sem acesso direto por nossa equipe).',
            },
            {
              label: 'Dados de Perfil e Atividade',
              text: 'Caso você opte por personalizar sua conta e interagir na plataforma, armazenamos sua foto de perfil, filmes e séries marcados como vistos, notas atribuídas, resenhas publicadas, comentários em avaliações de outros usuários, além de sua pontuação e insígnias conquistadas no sistema de gamificação.',
            },
            {
              label: 'Dados de Navegação e Uso',
              text: 'Coletamos dados técnicos anonimizados ou agregados sobre como você interage com o site (páginas visitadas, cliques, tipo de dispositivo e navegador) para melhorar a experiência e corrigir erros.',
            },
          ],
        },
      ],
    },
    {
      title: 'Visibilidade das Suas Informações (Perfil Público)',
      blocks: [
        {
          type: 'p',
          text: 'O CineRats é uma plataforma voltada à comunidade e gamificação. Ao utilizar o sistema, você está ciente de que as seguintes informações são públicas e visíveis para outros usuários da plataforma:',
        },
        {
          type: 'ul',
          items: [
            { text: 'Nome de usuário e foto de perfil;' },
            { text: 'Pontuação, nível e insígnias (conquistas);' },
            {
              text: 'Filmes e séries marcados como "Vistos" e suas respectivas notas;',
            },
            {
              text: 'Resenhas publicadas e comentários feitos em avaliações de terceiros.',
            },
          ],
        },
        {
          type: 'p',
          text: 'O seu endereço de e-mail e sua senha são estritamente privados e nunca são exibidos publicamente.',
        },
      ],
    },
    {
      title: 'Como Usamos os Seus Dados',
      blocks: [
        { type: 'p', text: 'Utilizamos suas informações exclusivamente para:' },
        {
          type: 'ul',
          items: [
            { text: 'Autenticar seu acesso e manter sua conta segura;' },
            {
              text: 'Calcular sua pontuação, liberar insígnias e manter seu histórico de filmes e séries atualizado;',
            },
            {
              text: 'Exibir suas interações (resenhas, notas e comentários) para a comunidade;',
            },
            {
              text: 'Entrar em contato para comunicações essenciais sobre a conta ou suporte técnico;',
            },
            { text: 'Analisar o desempenho da plataforma e otimizar a interface.' },
          ],
        },
        {
          type: 'p',
          text: 'Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing ou publicidade.',
        },
      ],
    },
    {
      title: 'Cookies, Analytics e Serviços de Terceiros',
      blocks: [
        {
          type: 'p',
          text: 'Para manter o CineRats funcionando de forma rápida e intuitiva, utilizamos serviços de infraestrutura e análise confiáveis:',
        },
        {
          type: 'ul',
          items: [
            {
              label: 'Cookies Essenciais',
              text: 'Utilizados para manter sua sessão ativa (login) enquanto você navega.',
            },
            {
              label: 'Vercel Analytics',
              text: 'Utilizado para monitorar a velocidade, tráfego e estabilidade das páginas de forma agregada.',
            },
            {
              label: 'Microsoft Clarity',
              text: 'Utilizado para compreender como os usuários interagem com a interface (por meio de mapas de calor e métricas de navegação), ajudando a identificar falhas de usabilidade. Nenhuma informação sensível ou senha é capturada por esta ferramenta.',
            },
            {
              label: 'Provedores de Banco de Dados e Hospedagem',
              text: 'Seus dados são armazenados em servidores seguros em nuvem com criptografia em trânsito (HTTPS) e controle de acesso restrito.',
            },
          ],
        },
      ],
    },
    {
      title: 'Seus Direitos (LGPD)',
      blocks: [
        {
          type: 'p',
          text: 'Você tem total controle sobre os seus dados e pode, a qualquer momento:',
        },
        {
          type: 'ul',
          items: [
            {
              text: 'Acessar, editar ou atualizar seu nome de usuário, foto e avaliações diretamente no seu perfil;',
            },
            {
              text: 'Solicitar a exportação ou a exclusão definitiva da sua conta e de todos os dados associados a ela.',
            },
          ],
        },
        {
          type: 'p',
          text: 'Para exercer qualquer um desses direitos ou tirar dúvidas sobre privacidade, basta enviar uma solicitação para nossos canais oficiais.',
        },
      ],
    },
    {
      title: 'Alterações nesta Política',
      blocks: [
        {
          type: 'p',
          text: 'Como o CineRats está em evolução constante, podemos atualizar esta Política periodicamente. Caso façamos alterações relevantes, avisaremos na plataforma.',
        },
      ],
    },
    {
      title: 'Contato',
      blocks: [{ type: 'ul', items: CONTACT_ITEMS }],
    },
  ],
};

export const TERMS_OF_USE: LegalDocument = {
  eyebrow: 'Termos',
  title: 'Termos de Uso',
  updatedAt: '02/11/2026',
  intro:
    'Bem-vindo ao CineRats! Ao criar uma conta ou utilizar a nossa plataforma, você concorda com as regras e condições descritas abaixo.',
  sections: [
    {
      title: 'O que é o CineRats',
      blocks: [
        {
          type: 'p',
          text: 'O CineRats é uma plataforma independente e gamificada de catalogação, acompanhamento e descoberta de filmes e séries, criada para incentivar o hábito de assistir e compartilhar experiências cinematográficas.',
        },
        {
          type: 'ul',
          items: [
            {
              label: 'Aviso Importante sobre Conteúdo Audiovisual',
              text: 'O CineRats não hospeda, não transmite (streaming) e não disponibiliza downloads de filmes, episódios de séries ou qualquer arquivo de vídeo protegido por direitos autorais. Funcionamos exclusivamente como um catálogo interativo e rede comunitária para cinéfilos.',
            },
          ],
        },
      ],
    },
    {
      title: 'Cadastro e Conta',
      blocks: [
        {
          type: 'ul',
          items: [
            {
              text: 'Para utilizar os recursos interativos, você deve fornecer um e-mail válido e escolher um nome de usuário adequado.',
            },
            {
              text: 'Você é o único responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas em sua conta.',
            },
            {
              text: 'Não é permitido criar contas com o objetivo de se passar por outra pessoa, utilizar nomes de usuário ofensivos ou automatizar ações (uso de bots/scripts).',
            },
          ],
        },
      ],
    },
    {
      title: 'Regras da Comunidade e Conteúdo Gerado pelo Usuário',
      blocks: [
        {
          type: 'p',
          text: 'Ao publicar resenhas, atribuir notas, comentar em avaliações alheias ou escolher sua foto de perfil, você concorda em manter um ambiente respeitoso e acolhedor. É estritamente proibido:',
        },
        {
          type: 'ul',
          items: [
            {
              text: 'Publicar discurso de ódio, racismo, homofobia, assédio, ameaças ou ataques pessoais a outros membros;',
            },
            {
              text: 'Utilizar fotos de perfil com conteúdo explícito (NSFW), violento ou ilegal;',
            },
            {
              text: 'Fazer spam, autopromoção excessiva ou divulgar links maliciosos/pirataria nos comentários e resenhas;',
            },
            {
              text: 'Manipular artificialmente o sistema de pontuação, notas ou insígnias da plataforma.',
            },
          ],
        },
        {
          type: 'p',
          text: 'Direitos sobre o texto: as resenhas e comentários que você escreve continuam sendo seus, mas ao publicá-los no CineRats, você nos concede uma licença gratuita e não exclusiva para exibi-los na plataforma.',
        },
      ],
    },
    {
      title: 'Moderação e Suspensão de Contas',
      blocks: [
        {
          type: 'p',
          text: 'Reservamo-nos o direito de remover qualquer resenha, comentário ou foto de perfil que viole estes Termos, bem como advertir, zerar pontuações obtidas de forma fraudulenta ou banir permanentemente contas que prejudiquem a comunidade ou o funcionamento do sistema, sem necessidade de aviso prévio.',
        },
      ],
    },
    {
      title: 'Atribuição de Dados de Terceiros (TMDB)',
      blocks: [
        {
          type: 'p',
          text: 'O CineRats utiliza a API do TMDB (The Movie Database) para exibir metadados, pôsteres, sinopses e informações técnicas sobre filmes e séries, mas não é endossado, certificado ou afiliado oficialmente ao TMDB. Todos os direitos sobre marcas, cartazes e títulos pertencem aos seus respectivos estúdios e distribuidores.',
        },
      ],
    },
    {
      title: 'Disponibilidade do Serviço ("No Estado em que se Encontra")',
      blocks: [
        {
          type: 'p',
          text: 'O CineRats é um projeto independente fornecido gratuitamente para a comunidade. Trabalhamos constantemente para manter o sistema estável, mas não garantimos que a plataforma estará livre de interrupções, bugs temporários ou alterações nas regras de gamificação (como ajustes de pontuação e critérios de insígnias para melhorar o equilíbrio do sistema).',
        },
      ],
    },
    {
      title: 'Contato e Denúncias',
      blocks: [
        {
          type: 'p',
          text: 'Caso encontre algum bug, comportamento inadequado de outros usuários ou queira falar com a criação do projeto:',
        },
        { type: 'ul', items: CONTACT_ITEMS },
      ],
    },
  ],
};
