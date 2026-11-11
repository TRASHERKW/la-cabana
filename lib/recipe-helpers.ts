import { z } from "zod";
import type { Model } from "mongoose";
import { RECIPE_CATEGORIES, slugify } from "./utils";
import { imageField } from "./validation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uniqueSlug(M: Model<any>, base: string, excludeId?: string) {
  const reserved = ["nueva", "nuevo", "editar"];
  const r0 = slugify(base) || "item";
  const root = reserved.includes(r0) ? `${r0}-receta` : r0;
  let slug = root;
  let n = 2;
  while (await M.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) slug = `${root}-${n++}`;
  return slug;
}

export const recipeSchema = z.object({
  title: z.string().trim().min(3, "El título es muy corto").max(120),
  summary: z.string().trim().max(500).default(""),
  category: z.enum(RECIPE_CATEGORIES as [string, ...string[]], { message: "Elige una categoría" }),
  image: imageField,
  prepMinutes: z.coerce.number().int().min(0).max(1440),
  servings: z.coerce.number().int().min(1, "Mínimo 1 porción").max(100),
  difficulty: z.enum(["Fácil", "Media", "Difícil"]),
});

