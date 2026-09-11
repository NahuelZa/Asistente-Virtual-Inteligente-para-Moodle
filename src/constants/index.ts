export const VIEWS = {
  APIARIO: "apiario",
  COLMENA: "colmena",
} as const;

export type ViewType = (typeof VIEWS)[keyof typeof VIEWS];

export const ROUTES = {
  HOME: "/",
  APIARIO: "/apiario",
  COLMENA: "/colmena",
  COLMENAS: "/colmenas",
} as const;

export const COLLECTIONS = {
  APIARIOS: "apiarios",
  COLMENAS: "colmenas",
} as const;
