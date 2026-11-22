import type {
  PersonalMovie,
  SeriesEntry,
  RankedUser,
  UserOscarPrediction,
  ActivityEntry,
} from "../types";
import type React from "react";
import {
  GiBull,
  GiTigerHead,
  GiCigar,
  GiSawedOffShotgun,
  GiAssassinPocket,
} from "react-icons/gi";
import { PiEyesFill } from "react-icons/pi";
import { MdOutlineTimeline } from "react-icons/md";
import { FcDvdLogo } from "react-icons/fc";
import { FaGlassCheers, FaUserShield } from "react-icons/fa";
import { TbAbc } from "react-icons/tb";
import { FaChildReaching } from "react-icons/fa6";
import {
  COMEDY_MOVIES,
  FAMILY_MOVIES,
  HORROR_SERIES,
  MOVIE_DIRECTORS,
  MOVIE_GENRES,
  MOVIE_LANGUAGES,
} from "../utils/mockData";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string | React.ElementType;
  secret: boolean;
  level: 1 | 2 | 3;
  check: (
    movies: PersonalMovie[],
    series: SeriesEntry[],
    users: RankedUser[],
    userId: string,
    predictions: UserOscarPrediction[],
    favoritesCount: number,
    favoritedByCount: number,
    activities: ActivityEntry[],
  ) => boolean;
}

function countRatedMovies(movies: PersonalMovie[], rating: number) {
  return movies.filter(
    (movie) =>
      movie.status === "watched" &&
      (movie.rating === rating || movie.avaliacao === rating),
  ).length;
}

function countRatedSeries(series: SeriesEntry[], rating: number) {
  return series.filter(
    (item) =>
      item.status !== "watchlist" &&
      (item.rating === rating || item.avaliacao === rating),
  ).length;
}

// TODO: transformar numa funcao bonitinha ppra poder desacoplar daqui e passar mock data
export const ACHIEVEMENTS: Achievement[] = [
  // FILMES
  {
    id: "first_movie",
    name: "Primeira Impressão",
    description: "Assistiu ao seu primeiro filme.",
    icon: "Film",
    secret: false,
    level: 1,
    check: (movies) => movies.filter((m) => m.status === "watched").length >= 1,
  },
  {
    id: "cinephile",
    name: "Cinéfilo",
    description: "Assistiu a 30 filmes.",
    icon: "Clapperboard",
    secret: false,
    level: 2,
    check: (movies) =>
      movies.filter((m) => m.status === "watched").length >= 30,
  },
  {
    id: "marathon",
    name: "Maratonou",
    description: "Assistiu a 10 filmes em uma janela de 7 dias.",
    icon: "Zap",
    secret: false,
    level: 2,
    check: (movies) => {
      const times = movies
        .filter((m) => m.status === "watched")
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
    id: "director",
    name: "Diretor de Cinema",
    description: "Assistiu a 50 filmes.",
    icon: "Video",
    secret: false,
    level: 3,
    check: (movies) =>
      movies.filter((m) => m.status === "watched").length >= 50,
  },
  {
    id: "curious",
    name: "Curioso",
    description: "Adicionou 15 filmes à watchlist.",
    icon: PiEyesFill,
    secret: false,
    level: 1,
    check: (movies) =>
      movies.filter((m) => m.status === "watchlist").length >= 15,
  },
  {
    id: "haja_tempo",
    name: "Haja Tempo...",
    description: "Adicionou 30 filmes à watchlist.",
    icon: "Bookmark",
    secret: false,
    level: 2,
    check: (movies) =>
      movies.filter((m) => m.status === "watchlist").length >= 30,
  },

  // DIRETORES (NV1 e NV2)
  {
    id: "tarantino_1",
    name: "Inglório",
    description: "Assistiu a 3 filmes do Tarantino.",
    icon: GiSawedOffShotgun,
    secret: false,
    level: 1,
    check: (movies) => {
      const count = movies.filter(
        (m) =>
          m.status === "watched" &&
          MOVIE_DIRECTORS[m.titulo.toLowerCase().trim()] ===
            "Quentin Tarantino",
      ).length;
      return count >= 3;
    },
  },
  {
    id: "del_toro_1",
    name: "Olé!",
    description: "Assistiu a 3 filmes do Guillermo del Toro.",
    icon: GiBull,
    secret: false,
    level: 1,
    check: (movies) => {
      const count = movies.filter(
        (m) =>
          m.status === "watched" &&
          MOVIE_DIRECTORS[m.titulo.toLowerCase().trim()] ===
            "Guillermo del Toro",
      ).length;
      return count >= 3;
    },
  },
  {
    id: "del_toro_2",
    name: "Forma Aquática",
    description: "Assistiu a 5 filmes do Guillermo del Toro.",
    icon: "Droplets",
    secret: false,
    level: 2,
    check: (movies) => {
      const count = movies.filter(
        (m) =>
          m.status === "watched" &&
          MOVIE_DIRECTORS[m.titulo.toLowerCase().trim()] ===
            "Guillermo del Toro",
      ).length;
      return count >= 5;
    },
  },
  {
    id: "nolan_1",
    name: "Não Linear",
    description: "Assistiu a 3 filmes do Nolan.",
    icon: MdOutlineTimeline,
    secret: false,
    level: 1,
    check: (movies) => {
      const count = movies.filter(
        (m) =>
          m.status === "watched" &&
          MOVIE_DIRECTORS[m.titulo.toLowerCase().trim()] ===
            "Christopher Nolan",
      ).length;
      return count >= 3;
    },
  },
  {
    id: "nolan_2",
    name: "Tempo Relativo",
    description: "Assistiu a 5 filmes do Christopher Nolan.",
    icon: "Infinity",
    secret: false,
    level: 2,
    check: (movies) => {
      const count = movies.filter(
        (m) =>
          m.status === "watched" &&
          MOVIE_DIRECTORS[m.titulo.toLowerCase().trim()] ===
            "Christopher Nolan",
      ).length;
      return count >= 5;
    },
  },
  {
    id: "spielberg_1",
    name: "Blockbuster Clássico",
    description: "Assistiu a 3 filmes do Spielberg.",
    icon: FcDvdLogo,
    secret: false,
    level: 1,
    check: (movies) => {
      const count = movies.filter(
        (m) =>
          m.status === "watched" &&
          MOVIE_DIRECTORS[m.titulo.toLowerCase().trim()] === "Steven Spielberg",
      ).length;
      return count >= 3;
    },
  },
  {
    id: "spielberg_2",
    name: "Aventureiro",
    description: "Assistiu a 5 filmes do Steven Spielberg.",
    icon: "Compass",
    secret: false,
    level: 2,
    check: (movies) => {
      const count = movies.filter(
        (m) =>
          m.status === "watched" &&
          MOVIE_DIRECTORS[m.titulo.toLowerCase().trim()] === "Steven Spielberg",
      ).length;
      return count >= 5;
    },
  },
  {
    id: "scorsese_1",
    name: "Godfella",
    description: "Assistiu a 3 filmes do Scorsese.",
    icon: FaGlassCheers,
    secret: false,
    level: 1,
    check: (movies) => {
      const count = movies.filter(
        (m) =>
          m.status === "watched" &&
          MOVIE_DIRECTORS[m.titulo.toLowerCase().trim()] === "Martin Scorsese",
      ).length;
      return count >= 3;
    },
  },
  {
    id: "scorsese_2",
    name: "Acende o charuto",
    description: "Assistiu a 5 filmes do Martin Scorsese.",
    icon: GiCigar,
    secret: false,
    level: 2,
    check: (movies) => {
      const count = movies.filter(
        (m) =>
          m.status === "watched" &&
          MOVIE_DIRECTORS[m.titulo.toLowerCase().trim()] === "Martin Scorsese",
      ).length;
      return count >= 5;
    },
  },

  // INFANTIL & COMÉDIA
  {
    id: "infantil_1",
    name: "Sessão da Tarde",
    description: "Assistiu ou tem na watchlist 5 filmes infantis.",
    icon: FaChildReaching,
    secret: false,
    level: 1,
    check: (movies) =>
      movies.filter((m) => FAMILY_MOVIES.has(m.titulo.toLowerCase().trim()))
        .length >= 5,
  },
  {
    id: "infantil_2",
    name: "Peter Pan",
    description: "Assistiu ou tem na watchlist 10 filmes infantis.",
    icon: "Baby",
    secret: false,
    level: 2,
    check: (movies) =>
      movies.filter((m) => FAMILY_MOVIES.has(m.titulo.toLowerCase().trim()))
        .length >= 10,
  },
  {
    id: "comedy_1",
    name: "Risadola",
    description: "Assistiu ou tem na watchlist 10 filmes de comédia.",
    icon: "Laugh",
    secret: false,
    level: 1,
    check: (movies) =>
      movies.filter((m) => COMEDY_MOVIES.has(m.titulo.toLowerCase().trim()))
        .length >= 10,
  },
  {
    id: "amargo",
    name: "Amargo",
    description: "Deu nota 2 ou menos para 3 filmes de comédia.",
    icon: "Frown",
    secret: false,
    level: 1,
    check: (movies) => {
      const comedyRated = movies.filter(
        (m) =>
          COMEDY_MOVIES.has(m.titulo.toLowerCase().trim()) &&
          (m.rating ?? m.avaliacao ?? 0) > 0 &&
          (m.rating ?? m.avaliacao ?? 0) <= 2,
      );
      return comedyRated.length >= 3;
    },
  },
  {
    id: "watchlist_25",
    name: "Vamos Marcar de Ver",
    description: "Tem 25+ itens na watchlist.",
    icon: "Calendar",
    secret: false,
    level: 2,
    check: (movies, series) => {
      const mWatch = movies.filter((m) => m.status === "watchlist").length;
      const sWatch = series.filter((s) => s.status === "watchlist").length;
      return mWatch + sWatch >= 25;
    },
  },

  // SÉRIES
  {
    id: "first_series",
    name: "Pontapé Inicial",
    description: "Acompanhando ou assistiu a 1 série.",
    icon: "Tv",
    secret: false,
    level: 1,
    check: (_, series) => series.length >= 1,
  },
  {
    id: "dedicated_series",
    name: "Dedicado",
    description: "Acompanhando ou assistiu a 5 séries.",
    icon: "Play",
    secret: false,
    level: 2,
    check: (_, series) => series.length >= 5,
  },
  {
    id: "no_social_life",
    name: "Sem Vida Social",
    description: "Concluiu 20 séries.",
    icon: "Hourglass",
    secret: false,
    level: 3,
    check: (_, series) =>
      series.filter((s) => s.status === "watched").length >= 20,
  },

  // AVALIAÇÕES
  {
    id: "critic_15",
    name: "Crítico",
    description: "Avaliou 15 filmes ou séries.",
    icon: "Award",
    secret: false,
    level: 1,
    check: (movies, series) => {
      const mCount = movies.filter(
        (m) => (m.rating ?? m.avaliacao ?? 0) > 0,
      ).length;
      const sCount = series.filter(
        (s) => (s.rating ?? s.avaliacao ?? 0) > 0,
      ).length;
      return mCount + sCount >= 15;
    },
  },
  {
    id: "critic_30",
    name: "Crítico Profissional",
    description: "Avaliou 30 filmes ou séries.",
    icon: "Trophy",
    secret: false,
    level: 2,
    check: (movies, series) => {
      const mCount = movies.filter(
        (m) => (m.rating ?? m.avaliacao ?? 0) > 0,
      ).length;
      const sCount = series.filter(
        (s) => (s.rating ?? s.avaliacao ?? 0) > 0,
      ).length;
      return mCount + sCount >= 30;
    },
  },
  {
    id: "critic_50",
    name: "Jurado de Cannes",
    description: "Avaliou 50 filmes ou séries.",
    icon: "Medal",
    secret: false,
    level: 3,
    check: (movies, series) => {
      const mCount = movies.filter(
        (m) => (m.rating ?? m.avaliacao ?? 0) > 0,
      ).length;
      const sCount = series.filter(
        (s) => (s.rating ?? s.avaliacao ?? 0) > 0,
      ).length;
      return mCount + sCount >= 50;
    },
  },

  // RESENHAS
  {
    id: "review_abc",
    name: "ABC",
    description: "Escreveu sua primeira resenha.",
    icon: TbAbc,
    secret: false,
    level: 1,
    check: (movies, series) => {
      const mCount = movies.filter(
        (m) => m.review && m.review.trim().length > 0,
      ).length;
      const sCount = series.filter(
        (s) => s.review && s.review.trim().length > 0,
      ).length;
      return mCount + sCount >= 1;
    },
  },
  {
    id: "review_5",
    name: "Eita que resenha",
    description: "Escreveu 5 resenhas.",
    icon: "MessageSquare",
    secret: false,
    level: 2,
    check: (movies, series) => {
      const mCount = movies.filter(
        (m) => m.review && m.review.trim().length > 0,
      ).length;
      const sCount = series.filter(
        (s) => s.review && s.review.trim().length > 0,
      ).length;
      return mCount + sCount >= 5;
    },
  },
  {
    id: "review_10",
    name: "Colunista da Folha",
    description: "Escreveu 10 resenhas.",
    icon: "FileText",
    secret: false,
    level: 3,
    check: (movies, series) => {
      const mCount = movies.filter(
        (m) => m.review && m.review.trim().length > 0,
      ).length;
      const sCount = series.filter(
        (s) => s.review && s.review.trim().length > 0,
      ).length;
      return mCount + sCount >= 10;
    },
  },
  {
    id: "review_20",
    name: "Redator de ENEM",
    description: "Escreveu 20 resenhas.",
    icon: "Scroll",
    secret: false,
    level: 3,
    check: (movies, series) => {
      const mCount = movies.filter(
        (m) => m.review && m.review.trim().length > 0,
      ).length;
      const sCount = series.filter(
        (s) => s.review && s.review.trim().length > 0,
      ).length;
      return mCount + sCount >= 20;
    },
  },

  // OSCAR
  {
    id: "oscar_bet",
    name: "Vai de BET",
    description: "Palpitou em 1 categoria do Oscar.",
    icon: "Dices",
    secret: false,
    level: 1,
    check: (_movies, _series, _users, _userId, predictions) =>
      predictions.length >= 1,
  },
  {
    id: "oscar_tigrinho",
    name: "Tigrinho",
    description: "Palpitou em todas as 5 categorias do Oscar.",
    icon: GiTigerHead,
    secret: false,
    level: 2,
    check: (_movies, _series, _users, _userId, predictions) =>
      predictions.length >= 5,
  },

  // SECRETAS
  {
    id: "hater",
    name: "Hater",
    description: "Avaliou 10 filmes ou séries com nota 1.0.",
    icon: "ThumbsDown",
    secret: true,
    level: 3,
    check: (movies, series) => {
      return countRatedMovies(movies, 1) + countRatedSeries(series, 1) >= 10;
    },
  },
  {
    id: "coracao_mole",
    name: "Coração Mole",
    description: "Avaliou 20 filmes ou séries com nota 5.0.",
    icon: "Heart",
    secret: true,
    level: 3,
    check: (movies, series) => {
      return countRatedMovies(movies, 5) + countRatedSeries(series, 5) >= 20;
    },
  },
  {
    id: "director_fan",
    name: "Fã",
    description: "Assistiu a 5 filmes do mesmo diretor.",
    icon: "UserCheck",
    secret: true,
    level: 3,
    check: (movies) => {
      const directorCount: Record<string, number> = {};
      movies
        .filter((m) => m.status === "watched")
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
    id: "founder",
    name: "Fundador",
    description: "Você é um dos 10 primeiros usuários cadastrados!",
    icon: "Rocket",
    secret: true,
    level: 3,
    check: (_, __, users, userId) => {
      if (users.length === 0) return false;
      const sorted = [...users].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      const top10Ids = sorted.slice(0, 10).map((u) => u.id);
      return top10Ids.includes(userId);
    },
  },
  {
    id: "je_parlo_mucho",
    name: "Je parlo mucho",
    description: "Assistiu a 3 filmes de idiomas diferentes, além do inglês",
    icon: "Languages",
    secret: false,
    level: 3,
    check: (movies) => {
      const languages = new Set<string>();
      movies
        .filter((m) => m.status === "watched")
        .forEach((m) => {
          const lang = MOVIE_LANGUAGES[m.titulo.toLowerCase().trim()];
          if (lang && lang !== "en") {
            languages.add(lang);
          }
        });
      return languages.size >= 3;
    },
  },
  {
    id: "poliglota",
    name: "Poliglota",
    description:
      "Assistiu a 5 filmes de idiomas diferentes (inglês não conta).",
    icon: "Globe",
    secret: true,
    level: 3,
    check: (movies) => {
      const languages = new Set<string>();
      movies
        .filter((m) => m.status === "watched")
        .forEach((m) => {
          const lang = MOVIE_LANGUAGES[m.titulo.toLowerCase().trim()];
          if (lang && lang !== "en") {
            languages.add(lang);
          }
        });
      return languages.size >= 5;
    },
  },
  {
    id: "universal",
    name: "Universal",
    description:
      "Assistiu a 7 filmes de idiomas diferentes (inglês não conta).",
    icon: "Sparkles",
    secret: true,
    level: 3,
    check: (movies) => {
      const languages = new Set<string>();
      movies
        .filter((m) => m.status === "watched")
        .forEach((m) => {
          const lang = MOVIE_LANGUAGES[m.titulo.toLowerCase().trim()];
          if (lang && lang !== "en") {
            languages.add(lang);
          }
        });
      return languages.size >= 7;
    },
  },
  {
    id: "serial_killer",
    name: "Assassino em SÉRIE",
    description: "Terminou 5 séries de terror.",
    icon: GiAssassinPocket,
    secret: true,
    level: 3,
    check: (_, series) => {
      const finishedHorror = series.filter(
        (s) =>
          s.status === "watched" &&
          HORROR_SERIES.has(s.titulo.toLowerCase().trim()),
      );
      return finishedHorror.length >= 5;
    },
  },
  {
    id: "vereador",
    name: "Vereador",
    description: "Adicionou 10 pessoas aos amigos.",
    icon: "Users",
    secret: true,
    level: 3,
    check: (_1, _2, _3, _4, _5, favoritesCount) => favoritesCount >= 10,
  },
  {
    id: "eleito",
    name: "Eleito",
    description: "Foi adicionado por 10 pessoas aos amigos.",
    icon: "Crown",
    secret: true,
    level: 3,
    check: (_1, _2, _3, _4, _5, _6, favoritedByCount) => favoritedByCount >= 10,
  },
  {
    id: "ecletico",
    name: "Eclético",
    description: "Viu filmes de 12 gêneros diferentes.",
    icon: "Shuffle",
    secret: true,
    level: 3,
    check: (movies) => {
      const genres = new Set<string>();
      movies
        .filter((m) => m.status === "watched")
        .forEach((m) => {
          const genre = MOVIE_GENRES[m.titulo.toLowerCase().trim()];
          if (genre) {
            genres.add(genre);
          }
        });
      return genres.size >= 12;
    },
  },
  {
    id: "influente",
    name: "Influente",
    description:
      "5 filmes indicados foram vistos pelos usuários que receberam.",
    icon: "HeartHandshake",
    secret: true,
    level: 3,
    check: (_1, _2, _3, _4, _5, _6, _7, activities) => {
      const recoWatchedCount = activities.filter(
        (act) => act.message.includes("foi assistido") && act.mcoins_delta > 0,
      ).length;
      return recoWatchedCount >= 5;
    },
  },
  {
    id: "fiel_escudeiro",
    name: "Fiel Escudeiro",
    description: "Adicionou novos itens em 15 dias diferentes.",
    icon: FaUserShield,
    secret: false,
    level: 3,
    check: (movies, series) => {
      const dates = new Set<string>();
      movies.forEach((m) => {
        if (m.created_at) dates.add(m.created_at.slice(0, 10));
      });
      series.forEach((s) => {
        if (s.created_at) dates.add(s.created_at.slice(0, 10));
      });
      return dates.size >= 15;
    },
  },
];

export function getUnlockedAchievements(
  movies: PersonalMovie[],
  series: SeriesEntry[],
  users: RankedUser[],
  userId: string,
  predictions: UserOscarPrediction[],
  favoritesCount: number,
  favoritedByCount: number,
  activities: ActivityEntry[],
): Achievement[] {
  const unlocked = ACHIEVEMENTS.filter((ach) =>
    ach.check(
      movies,
      series,
      users,
      userId,
      predictions,
      favoritesCount,
      favoritedByCount,
      activities,
    ),
  );

  // Filter out lower tier achievements for directors and languages
  const idsToExclude = new Set<string>();

  if (unlocked.some((ach) => ach.id === "del_toro_2"))
    idsToExclude.add("del_toro_1");
  if (unlocked.some((ach) => ach.id === "nolan_2")) idsToExclude.add("nolan_1");
  if (unlocked.some((ach) => ach.id === "spielberg_2"))
    idsToExclude.add("spielberg_1");
  if (unlocked.some((ach) => ach.id === "scorsese_2"))
    idsToExclude.add("scorsese_1");

  if (unlocked.some((ach) => ach.id === "universal")) {
    idsToExclude.add("poliglota");
    idsToExclude.add("je_parlo_mucho");
  } else if (unlocked.some((ach) => ach.id === "poliglota")) {
    idsToExclude.add("je_parlo_mucho");
  }

  if (unlocked.some((ach) => ach.id === "director")) {
    idsToExclude.add("cinephile");
    idsToExclude.add("first_movie");
  } else if (unlocked.some((ach) => ach.id === "cinephile")) {
    idsToExclude.add("first_movie");
  }

  if (unlocked.some((ach) => ach.id === "haja_tempo")) {
    idsToExclude.add("curious");
  }

  if (unlocked.some((ach) => ach.id === "infantil_2")) {
    idsToExclude.add("infantil_1");
  }

  // Series exclusions
  if (unlocked.some((ach) => ach.id === "no_social_life")) {
    idsToExclude.add("dedicated_series");
    idsToExclude.add("first_series");
  } else if (unlocked.some((ach) => ach.id === "dedicated_series")) {
    idsToExclude.add("first_series");
  }

  // Critic exclusions
  if (unlocked.some((ach) => ach.id === "critic_50")) {
    idsToExclude.add("critic_30");
    idsToExclude.add("critic_15");
  } else if (unlocked.some((ach) => ach.id === "critic_30")) {
    idsToExclude.add("critic_15");
  }

  // Review exclusions
  if (unlocked.some((ach) => ach.id === "review_20")) {
    idsToExclude.add("review_10");
    idsToExclude.add("review_5");
    idsToExclude.add("review_abc");
  } else if (unlocked.some((ach) => ach.id === "review_10")) {
    idsToExclude.add("review_5");
    idsToExclude.add("review_abc");
  } else if (unlocked.some((ach) => ach.id === "review_5")) {
    idsToExclude.add("review_abc");
  }

  return unlocked.filter((ach) => !idsToExclude.has(ach.id));
}

export interface AchievementProgressContext {
  movies: PersonalMovie[];
  series: SeriesEntry[];
  users: RankedUser[];
  userId: string;
  predictions: UserOscarPrediction[];
  favoritesCount: number;
  favoritedByCount: number;
  activities: ActivityEntry[];
}

function progressRatio(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

function watchedMovies(movies: PersonalMovie[]) {
  return movies.filter((movie) => movie.status === "watched");
}

function watchedMovieCountForDirector(
  movies: PersonalMovie[],
  director: string,
) {
  return watchedMovies(movies).filter(
    (movie) => MOVIE_DIRECTORS[movie.titulo.toLowerCase().trim()] === director,
  ).length;
}

function maxSevenDayMovieCount(movies: PersonalMovie[]) {
  const times = watchedMovies(movies)
    .map((movie) => new Date(movie.created_at).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  let max = 0;
  times.forEach((time, index) => {
    let end = index;
    while (end < times.length && times[end] - time <= sevenDaysMs) end += 1;
    max = Math.max(max, end - index);
  });
  return max;
}

function uniqueNonEnglishLanguages(movies: PersonalMovie[]) {
  return new Set(
    watchedMovies(movies)
      .map((movie) => MOVIE_LANGUAGES[movie.titulo.toLowerCase().trim()])
      .filter((language): language is string =>
        Boolean(language && language !== "en"),
      ),
  ).size;
}

export function getFavoriteDirector(movies: PersonalMovie[]) {
  const counts = new Map<string, number>();
  watchedMovies(movies).forEach((movie) => {
    const director =
      movie.diretor || MOVIE_DIRECTORS[movie.titulo.toLowerCase().trim()];
    if (director) counts.set(director, (counts.get(director) ?? 0) + 1);
  });
  return (
    [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0]?.[0] ?? null
  );
}

export function getAchievementProgress(
  achievement: Achievement,
  context: AchievementProgressContext,
) {
  const {
    movies,
    series,
    users,
    userId,
    predictions,
    favoritesCount,
    favoritedByCount,
    activities,
  } = context;
  const watched = watchedMovies(movies).length;
  const watchlist = movies.filter(
    (movie) => movie.status === "watchlist",
  ).length;
  const rated =
    movies.filter((movie) => (movie.rating ?? movie.avaliacao ?? 0) > 0)
      .length +
    series.filter((item) => (item.rating ?? item.avaliacao ?? 0) > 0).length;
  const reviews =
    movies.filter((movie) => Boolean(movie.review?.trim())).length +
    series.filter((item) => Boolean(item.review?.trim())).length;
  const allTitles = movies.filter((movie) =>
    FAMILY_MOVIES.has(movie.titulo.toLowerCase().trim()),
  ).length;
  const comedyTitles = movies.filter((movie) =>
    COMEDY_MOVIES.has(movie.titulo.toLowerCase().trim()),
  ).length;
  const days = new Set(
    [...movies, ...series]
      .map((item) => item.created_at?.slice(0, 10))
      .filter(Boolean),
  ).size;
  const directorFanCount = Math.max(
    0,
    ...Object.values(
      watchedMovies(movies).reduce<Record<string, number>>((counts, movie) => {
        const director = MOVIE_DIRECTORS[movie.titulo.toLowerCase().trim()];
        if (director) counts[director] = (counts[director] ?? 0) + 1;
        return counts;
      }, {}),
    ),
  );
  const unlocked = achievement.check(
    movies,
    series,
    users,
    userId,
    predictions,
    favoritesCount,
    favoritedByCount,
    activities,
  );

  switch (achievement.id) {
    case "first_movie":
      return progressRatio(watched, 1);
    case "cinephile":
      return progressRatio(watched, 30);
    case "marathon":
      return progressRatio(maxSevenDayMovieCount(movies), 10);
    case "director":
      return progressRatio(watched, 50);
    case "curious":
      return progressRatio(watchlist, 15);
    case "haja_tempo":
      return progressRatio(watchlist, 30);
    case "tarantino_1":
      return progressRatio(
        watchedMovieCountForDirector(movies, "Quentin Tarantino"),
        3,
      );
    case "del_toro_1":
      return progressRatio(
        watchedMovieCountForDirector(movies, "Guillermo del Toro"),
        3,
      );
    case "del_toro_2":
      return progressRatio(
        watchedMovieCountForDirector(movies, "Guillermo del Toro"),
        5,
      );
    case "nolan_1":
      return progressRatio(
        watchedMovieCountForDirector(movies, "Christopher Nolan"),
        3,
      );
    case "nolan_2":
      return progressRatio(
        watchedMovieCountForDirector(movies, "Christopher Nolan"),
        5,
      );
    case "spielberg_1":
      return progressRatio(
        watchedMovieCountForDirector(movies, "Steven Spielberg"),
        3,
      );
    case "spielberg_2":
      return progressRatio(
        watchedMovieCountForDirector(movies, "Steven Spielberg"),
        5,
      );
    case "scorsese_1":
      return progressRatio(
        watchedMovieCountForDirector(movies, "Martin Scorsese"),
        3,
      );
    case "scorsese_2":
      return progressRatio(
        watchedMovieCountForDirector(movies, "Martin Scorsese"),
        5,
      );
    case "infantil_1":
      return progressRatio(allTitles, 5);
    case "infantil_2":
      return progressRatio(allTitles, 10);
    case "comedy_1":
      return progressRatio(comedyTitles, 10);
    case "amargo":
      return progressRatio(
        movies.filter(
          (movie) =>
            COMEDY_MOVIES.has(movie.titulo.toLowerCase().trim()) &&
            (movie.rating ?? movie.avaliacao ?? 0) > 0 &&
            (movie.rating ?? movie.avaliacao ?? 0) <= 2,
        ).length,
        3,
      );
    case "watchlist_25":
      return progressRatio(
        watchlist + series.filter((item) => item.status === "watchlist").length,
        25,
      );
    case "first_series":
      return progressRatio(series.length, 1);
    case "dedicated_series":
      return progressRatio(series.length, 5);
    case "no_social_life":
      return progressRatio(
        series.filter((item) => item.status === "watched").length,
        20,
      );
    case "critic_15":
      return progressRatio(rated, 15);
    case "critic_30":
      return progressRatio(rated, 30);
    case "critic_50":
      return progressRatio(rated, 50);
    case "review_abc":
      return progressRatio(reviews, 1);
    case "review_5":
      return progressRatio(reviews, 5);
    case "review_10":
      return progressRatio(reviews, 10);
    case "review_20":
      return progressRatio(reviews, 20);
    case "oscar_bet":
      return progressRatio(predictions.length, 1);
    case "oscar_tigrinho":
      return progressRatio(predictions.length, 5);
    case "hater":
      return progressRatio(
        countRatedMovies(movies, 1) + countRatedSeries(series, 1),
        10,
      );
    case "coracao_mole":
      return progressRatio(
        countRatedMovies(movies, 5) + countRatedSeries(series, 5),
        20,
      );
    case "director_fan":
      return progressRatio(directorFanCount, 5);
    case "founder":
      return unlocked ? 100 : 0;
    case "je_parlo_mucho":
      return progressRatio(uniqueNonEnglishLanguages(movies), 3);
    case "poliglota":
      return progressRatio(uniqueNonEnglishLanguages(movies), 5);
    case "universal":
      return progressRatio(uniqueNonEnglishLanguages(movies), 7);
    case "serial_killer":
      return progressRatio(
        series.filter(
          (item) =>
            item.status === "watched" &&
            HORROR_SERIES.has(item.titulo.toLowerCase().trim()),
        ).length,
        5,
      );
    case "vereador":
      return progressRatio(favoritesCount, 10);
    case "eleito":
      return progressRatio(favoritedByCount, 10);
    case "ecletico":
      return progressRatio(
        new Set(
          watchedMovies(movies)
            .map((movie) => MOVIE_GENRES[movie.titulo.toLowerCase().trim()])
            .filter(Boolean),
        ).size,
        12,
      );
    case "influente":
      return progressRatio(
        activities.filter(
          (activity) =>
            activity.message.includes("foi assistido") &&
            activity.mcoins_delta > 0,
        ).length,
        5,
      );
    case "fiel_escudeiro":
      return progressRatio(days, 15);
    default:
      return unlocked ? 100 : 0;
  }
}
