import type { PersonalMovie, SeriesEntry, RankedUser, UserOscarPrediction } from '../types/app';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  secret: boolean;
  check: (
    movies: PersonalMovie[],
    series: SeriesEntry[],
    users: RankedUser[],
    userId: string,
    predictions: UserOscarPrediction[]
  ) => boolean;
}

const MOVIE_DIRECTORS: Record<string, string> = {
  // Nolan
  'oppenheimer': 'Christopher Nolan',
  'interstellar': 'Christopher Nolan',
  'interestelar': 'Christopher Nolan',
  'inception': 'Christopher Nolan',
  'a origem': 'Christopher Nolan',
  'the dark knight': 'Christopher Nolan',
  'o cavaleiro das trevas': 'Christopher Nolan',
  'memento': 'Christopher Nolan',
  'amnesia': 'Christopher Nolan',
  'dunkirk': 'Christopher Nolan',
  'tenet': 'Christopher Nolan',
  'the prestige': 'Christopher Nolan',
  'o grande truque': 'Christopher Nolan',

  // Tarantino
  'pulp fiction': 'Quentin Tarantino',
  'kill bill': 'Quentin Tarantino',
  'inglourious basterds': 'Quentin Tarantino',
  'bastardos inglorios': 'Quentin Tarantino',
  'django unchained': 'Quentin Tarantino',
  'django livre': 'Quentin Tarantino',
  'reservoir dogs': 'Quentin Tarantino',
  'caes de aluguel': 'Quentin Tarantino',
  'once upon a time in hollywood': 'Quentin Tarantino',
  'era uma vez em hollywood': 'Quentin Tarantino',
  'the hateful eight': 'Quentin Tarantino',
  'os oito odiados': 'Quentin Tarantino',

  // Scorsese
  'taxi driver': 'Martin Scorsese',
  'goodfellas': 'Martin Scorsese',
  'bons companheiros': 'Martin Scorsese',
  'the wolf of wall street': 'Martin Scorsese',
  'o lobo de wall street': 'Martin Scorsese',
  'shutter island': 'Martin Scorsese',
  'ilha do medo': 'Martin Scorsese',
  'the departed': 'Martin Scorsese',
  'os infiltrados': 'Martin Scorsese',
  'casino': 'Martin Scorsese',
  'raging bull': 'Martin Scorsese',
  'touro indomavel': 'Martin Scorsese',
  'killers of the flower moon': 'Martin Scorsese',
  'assassinos da lua das flores': 'Martin Scorsese',

  // Spielberg
  'jurassic park': 'Steven Spielberg',
  'schindler list': 'Steven Spielberg',
  'a lista de schindler': 'Steven Spielberg',
  'jaws': 'Steven Spielberg',
  'tubarao': 'Steven Spielberg',
  'saving private ryan': 'Steven Spielberg',
  'o resgate do soldado ryan': 'Steven Spielberg',
  'catch me if you can': 'Steven Spielberg',
  'prenda-me se for capaz': 'Steven Spielberg',
  'e.t. the extra-terrestrial': 'Steven Spielberg',
  'e.t. o extraterrestre': 'Steven Spielberg',
  'raiders of the lost ark': 'Steven Spielberg',
  'cacadores da arca perdida': 'Steven Spielberg',
};

export const ACHIEVEMENTS: Achievement[] = [
  // FILMES
  {
    id: 'first_movie',
    name: 'Primeira Impressão',
    description: 'Assistiu ao seu primeiro filme.',
    icon: 'Film',
    secret: false,
    check: (movies) => movies.filter((m) => m.status === 'watched').length >= 1,
  },
  {
    id: 'cinephile',
    name: 'Cinéfilo',
    description: 'Assistiu a 30 filmes.',
    icon: 'Clapperboard',
    secret: false,
    check: (movies) => movies.filter((m) => m.status === 'watched').length >= 30,
  },
  {
    id: 'marathon',
    name: 'Maratonou',
    description: 'Assistiu a 10 filmes em uma janela de 7 dias.',
    icon: 'Zap',
    secret: false,
    check: (movies) => {
      const times = movies
        .filter((m) => m.status === 'watched')
        .map((m) => new Date(m.created_at).getTime())
        .sort((a, b) => a - b);
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      return times.some((t, idx) => {
        if (idx + 9 >= times.length) return false;
        return times[idx + 9] - t <= sevenDaysMs;
      });
    },
  },
  {
    id: 'director',
    name: 'Diretor de Cinema',
    description: 'Assistiu a 50 filmes.',
    icon: 'Video',
    secret: false,
    check: (movies) => movies.filter((m) => m.status === 'watched').length >= 50,
  },
  {
    id: 'curious',
    name: 'Curioso',
    description: 'Adicionou 15 filmes à watchlist.',
    icon: 'Bookmark',
    secret: false,
    check: (movies) => movies.filter((m) => m.status === 'watchlist').length >= 15,
  },

  // SÉRIES
  {
    id: 'first_series',
    name: 'Pontapé Inicial',
    description: 'Acompanhando ou assistiu a 1 série.',
    icon: 'Tv',
    secret: false,
    check: (_, series) => series.length >= 1,
  },
  {
    id: 'dedicated_series',
    name: 'Dedicado',
    description: 'Acompanhando ou assistiu a 5 séries.',
    icon: 'Play',
    secret: false,
    check: (_, series) => series.length >= 5,
  },
  {
    id: 'no_social_life',
    name: 'Sem Vida Social',
    description: 'Acompanhando ou assistiu a 10 séries.',
    icon: 'Hourglass',
    secret: false,
    check: (_, series) => series.length >= 10,
  },

  // AVALIAÇÕES
  {
    id: 'critic_15',
    name: 'Crítico',
    description: 'Avaliou 15 filmes ou séries.',
    icon: 'Award',
    secret: false,
    check: (movies, series) => {
      const mCount = movies.filter((m) => (m.rating ?? m.avaliacao ?? 0) > 0).length;
      const sCount = series.filter((s) => (s.rating ?? s.avaliacao ?? 0) > 0).length;
      return mCount + sCount >= 15;
    },
  },
  {
    id: 'critic_30',
    name: 'Crítico Profissional',
    description: 'Avaliou 30 filmes ou séries.',
    icon: 'Trophy',
    secret: false,
    check: (movies, series) => {
      const mCount = movies.filter((m) => (m.rating ?? m.avaliacao ?? 0) > 0).length;
      const sCount = series.filter((s) => (s.rating ?? s.avaliacao ?? 0) > 0).length;
      return mCount + sCount >= 30;
    },
  },
  {
    id: 'critic_50',
    name: 'Jurado de Cannes',
    description: 'Avaliou 50 filmes ou séries.',
    icon: 'Medal',
    secret: false,
    check: (movies, series) => {
      const mCount = movies.filter((m) => (m.rating ?? m.avaliacao ?? 0) > 0).length;
      const sCount = series.filter((s) => (s.rating ?? s.avaliacao ?? 0) > 0).length;
      return mCount + sCount >= 50;
    },
  },

  // RESENHAS
  {
    id: 'review_abc',
    name: 'ABC',
    description: 'Escreveu sua primeira resenha.',
    icon: 'BookOpen',
    secret: false,
    check: (movies, series) => {
      const mCount = movies.filter((m) => m.review && m.review.trim().length > 0).length;
      const sCount = series.filter((s) => s.review && s.review.trim().length > 0).length;
      return mCount + sCount >= 1;
    },
  },
  {
    id: 'review_5',
    name: 'Eita que resenha',
    description: 'Escreveu 5 resenhas.',
    icon: 'MessageSquare',
    secret: false,
    check: (movies, series) => {
      const mCount = movies.filter((m) => m.review && m.review.trim().length > 0).length;
      const sCount = series.filter((s) => s.review && s.review.trim().length > 0).length;
      return mCount + sCount >= 5;
    },
  },
  {
    id: 'review_10',
    name: 'Colunista da Folha',
    description: 'Escreveu 10 resenhas.',
    icon: 'FileText',
    secret: false,
    check: (movies, series) => {
      const mCount = movies.filter((m) => m.review && m.review.trim().length > 0).length;
      const sCount = series.filter((s) => s.review && s.review.trim().length > 0).length;
      return mCount + sCount >= 10;
    },
  },
  {
    id: 'review_20',
    name: 'Redator de ENEM',
    description: 'Escreveu 20 resenhas.',
    icon: 'Scroll',
    secret: false,
    check: (movies, series) => {
      const mCount = movies.filter((m) => m.review && m.review.trim().length > 0).length;
      const sCount = series.filter((s) => s.review && s.review.trim().length > 0).length;
      return mCount + sCount >= 20;
    },
  },

  // OSCAR
  {
    id: 'oscar_bet',
    name: 'Vai de BET',
    description: 'Palpitou em 1 categoria do Oscar.',
    icon: 'Dices',
    secret: false,
    check: (_movies, _series, _users, _userId, predictions) => predictions.length >= 1,
  },
  {
    id: 'oscar_tigrinho',
    name: 'Tigrinho',
    description: 'Palpitou em todas as 5 categorias do Oscar.',
    icon: 'Coins',
    secret: false,
    check: (_movies, _series, _users, _userId, predictions) => predictions.length >= 5,
  },

  // SECRETAS (só aparecem depois de desbloquear)
  {
    id: 'hater',
    name: 'Hater',
    description: 'Avaliou 10 filmes ou séries com nota 1.0.',
    icon: 'ThumbsDown',
    secret: true,
    check: (movies, series) => {
      const mCount = movies.filter((m) => m.status === 'watched' && (m.rating === 1 || m.avaliacao === 1)).length;
      const sCount = series.filter((s) => (s.rating === 1 || s.avaliacao === 1)).length;
      return mCount + sCount >= 10;
    },
  },
  {
    id: 'coracao_mole',
    name: 'Coração Mole',
    description: 'Avaliou 20 filmes ou séries com nota 5.0.',
    icon: 'Heart',
    secret: true,
    check: (movies, series) => {
      const mCount = movies.filter((m) => m.status === 'watched' && (m.rating === 5 || m.avaliacao === 5)).length;
      const sCount = series.filter((s) => (s.rating === 5 || s.avaliacao === 5)).length;
      return mCount + sCount >= 20;
    },
  },
  {
    id: 'director_fan',
    name: 'Fã',
    description: 'Assistiu a 5 filmes do mesmo diretor.',
    icon: 'UserCheck',
    secret: true,
    check: (movies) => {
      const directorCount: Record<string, number> = {};
      movies
        .filter((m) => m.status === 'watched')
        .forEach((m) => {
          const normTitle = m.titulo.toLowerCase().trim();
          const director = MOVIE_DIRECTORS[normTitle];
          if (director) {
            directorCount[director] = (directorCount[director] || 0) + 1;
          }
        });
      return Object.values(directorCount).some((count) => count >= 5);
    },
  },
  {
    id: 'founder',
    name: 'Fundador',
    description: 'Você é um dos 10 primeiros usuários cadastrados!',
    icon: 'Rocket',
    secret: true,
    check: (_, __, users, userId) => {
      if (users.length === 0) return false;
      const sorted = [...users].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const top10Ids = sorted.slice(0, 10).map((u) => u.id);
      return top10Ids.includes(userId);
    },
  },
];

export function getUnlockedAchievements(
  movies: PersonalMovie[],
  series: SeriesEntry[],
  users: RankedUser[],
  userId: string,
  predictions: UserOscarPrediction[]
): Achievement[] {
  return ACHIEVEMENTS.filter((ach) => ach.check(movies, series, users, userId, predictions));
}
