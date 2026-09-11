export const VIEWS = {
  APIARIO: "apiario",
  COLMENA: "colmena",
  LISTADO_APIARIOS: "apiarios",
  LISTADO_COLMENAS: "colmenas",
  LISTADO: "apiarios",
} as const;

export type ViewType = (typeof VIEWS)[keyof typeof VIEWS];

export const ROUTES = {
  HOME: "/",
  APIARIO: "/apiario",
  COLMENA: "/colmena",
  COLMENAS: "/colmenas",
  APIARIOS: "/apiarios",
  LISTADO_APIARIOS: "/apiarios",
  LISTADO_COLMENAS: "/colmenas",
  LISTADO: "/listado",
} as const;

export const COLLECTIONS = {
  APIARIOS: "apiarios",
  COLMENAS: "colmenas",
} as const;
