export function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

export function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Convierte un documento de Mongoose (lean) en un objeto plano serializable para componentes cliente. */
export function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export const RECIPE_CATEGORIES = ["Desayunos", "Almuerzos", "Cenas", "Postres"];
export const PRODUCT_CATEGORIES = ["Pimientas", "Especias", "Hierbas", "Despensa"];

export const CATEGORY_INFO: Record<string, { image: string; text: string }> = {
  Desayunos: { image: "/img/desayuno.jpg", text: "Para empezar el día con energía" },
  Almuerzos: { image: "/img/almuerzo.jpg", text: "Platos completos y llenadores" },
  Cenas: { image: "/img/cena.jpg", text: "Ligeras y reconfortantes" },
  Postres: { image: "/img/postres.jpg", text: "El antojo dulce, versión sana" },
};

export const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/share/1AzewmxcDW/" },
  { name: "Instagram", href: "https://www.instagram.com/la_cabana._.food" },
  { name: "X", href: "https://x.com/LaCabaa175607" },
];

export const ORDER_STATUS: Record<string, string> = {
  pendiente: "Pendiente",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
