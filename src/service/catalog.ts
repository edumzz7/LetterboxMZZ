import type { PersonalMovie, SeriesEntry } from "../types";
import { DEFAULT_EDUMZZ_SERIES } from "../utils/mockData";

interface LegacyMovie {
  id: string;
  titulo: string;
  ano_oscar: number;
  categoria_principal: string | null;
  capa_url: string | null;
  plataforma_slug: string | null;
  status?: "watchlist" | "watched";
}

interface LegacySeries {
  id: string;
  titulo: string;
  capa_url: string | null;
  status: "watchlist" | "watching" | "watched";
  temporada: number;
  total_episodios: number;
  episodios_vistos: number;
  plataforma_slug: string | null;
}

export function readLegacyMovieData() {
  try {
    const raw = localStorage.getItem("cinehub_movies");
    if (!raw) {
      return {
        personalMovies: [],
        oscarStatuses: new Map<string, "watchlist" | "watched">(),
      };
    }

    const items = JSON.parse(raw) as LegacyMovie[];
    const personalMovies: Omit<
      PersonalMovie,
      "id" | "user_id" | "created_at"
    >[] = [];
    const oscarStatuses = new Map<string, "watchlist" | "watched">();

    items.forEach((movie) => {
      if (movie.categoria_principal === "Pessoal") {
        personalMovies.push({
          titulo: movie.titulo,
          ano_lancamento: movie.ano_oscar ?? null,
          capa_url: movie.capa_url,
          plataforma_slug: movie.plataforma_slug,
          status: movie.status ?? "watchlist",
          source: "manual",
          source_movie_id: null,
        });
        return;
      }

      oscarStatuses.set(
        movie.titulo.trim().toLowerCase(),
        movie.status ?? "watchlist",
      );
    });

    return { personalMovies, oscarStatuses };
  } catch {
    return {
      personalMovies: [],
      oscarStatuses: new Map<string, "watchlist" | "watched">(),
    };
  }
}

export function readLegacySeriesData(fallbackToDefault = true) {
  try {
    const raw = localStorage.getItem("cinehub_series");
    if (!raw) {
      return fallbackToDefault ? DEFAULT_EDUMZZ_SERIES : [];
    }

    const items = JSON.parse(raw) as LegacySeries[];
    return items.map((series) => {
      const status: SeriesEntry["status"] =
        (series.episodios_vistos || 0) <= 0
          ? "watchlist"
          : (series.total_episodios || 0) > 0 &&
              (series.episodios_vistos || 0) >= (series.total_episodios || 0)
            ? "watched"
            : series.status === "watched"
              ? "watched"
              : "watching";

      return {
        titulo: series.titulo,
        capa_url: series.capa_url,
        status,
        temporada: series.temporada || 1,
        total_episodios: series.total_episodios || 0,
        episodios_vistos: series.episodios_vistos || 0,
        plataforma_slug: series.plataforma_slug,
      };
    });
  } catch {
    return fallbackToDefault ? DEFAULT_EDUMZZ_SERIES : [];
  }
}
