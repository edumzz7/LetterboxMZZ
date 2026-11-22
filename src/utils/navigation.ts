export type AppTab =
  | "home"
  | "dashboard"
  | "oscars"
  | "movies"
  | "series"
  | "reviews"
  | "personal";

export const APP_NAVIGATION_TABS: Array<{
  id: AppTab;
  label: string;
  show?: boolean;
}> = [
  { id: "home", label: "Home" },
  { id: "movies", label: "Filmes" },
  { id: "series", label: "Séries" },
  { id: "reviews", label: "Comunidade" },
  { id: "oscars", label: "Oscar 2027" },
  { id: "dashboard", label: "Perfil" },
];
