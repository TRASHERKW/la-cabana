import { z } from "zod";

/** Imagen: vacía, una ruta interna (/img/..., /api/images/...) o una URL https. */
export const imageField = z
  .string()
  .trim()
  .default("")
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\/\S+$/i.test(v), "La imagen debe ser una URL válida");

export const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
