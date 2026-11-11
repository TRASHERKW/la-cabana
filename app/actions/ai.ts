"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { RECIPE_CATEGORIES } from "@/lib/utils";
import { uniqueSlug } from "@/lib/recipe-helpers";
import { Recipe } from "@/models/Recipe";

const aiRecipeSchema = z.object({
  title: z.string().min(2).max(120),
  summary: z.string().max(500).catch(""),
  category: z.enum(RECIPE_CATEGORIES as [string, ...string[]]).catch("Almuerzos"),
  prepMinutes: z.coerce.number().int().min(0).max(1440).catch(30),
  servings: z.coerce.number().int().min(1).max(50).catch(2),
  difficulty: z.enum(["Fácil", "Media", "Difícil"]).catch("Fácil"),
  ingredients: z.array(z.string().min(1)).min(1).max(40),
  steps: z.array(z.string().min(1)).min(1).max(30),
});

export type AIRecipe = z.infer<typeof aiRecipeSchema>;
export type AIResult = { ok: true; recipe: AIRecipe } | { ok: false; error: string; needsLogin?: boolean };

// Límite sencillo en memoria para no gastar la llave: 8 recetas cada 10 minutos por usuario
const hits = new Map<string, number[]>();
function allowed(userId: string) {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 8) return false;
  recent.push(now);
  hits.set(userId, recent);
  return true;
}

/** Genera una receta saludable con Gemini. La API key vive solo en el servidor (.env.local). */
export async function generateRecipeAction(prompt: string): Promise<AIResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Inicia sesión para usar la IA", needsLogin: true };

  const request = String(prompt ?? "").trim();
  if (request.length < 3) return { ok: false, error: "Cuéntale a la IA qué se te antoja" };
  if (request.length > 500) return { ok: false, error: "Máximo 500 caracteres" };

  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, error: "Falta configurar GEMINI_API_KEY en .env.local" };
  if (!allowed(session.id)) return { ok: false, error: "Llevas muchas recetas seguidas. Espera unos minutos 🙂" };

  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const instructions = `Eres un chef experto en cocina saludable y mexicana casera. Genera UNA receta sencilla en español de México según la solicitud del usuario.
Responde SOLO con JSON con esta forma exacta:
{"title": string, "summary": string (1-2 frases antojables), "category": uno de ${JSON.stringify(RECIPE_CATEGORIES)},
 "prepMinutes": número, "servings": número, "difficulty": "Fácil" | "Media" | "Difícil",
 "ingredients": [string con cantidad, ...], "steps": [string, ...]}
Si la solicitud no tiene que ver con comida, crea una receta saludable sorpresa.
Solicitud del usuario: """${request}"""`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: instructions }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Gemini error", res.status, await res.text().catch(() => ""));
      return { ok: false, error: res.status === 429 ? "La IA está saturada, intenta en un minuto" : "La IA no respondió. Revisa tu GEMINI_API_KEY." };
    }
    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = aiRecipeSchema.safeParse(JSON.parse(json));
    if (!parsed.success) return { ok: false, error: "La IA respondió algo raro. Intenta de nuevo." };
    return { ok: true, recipe: parsed.data };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "No se pudo generar la receta. Intenta de nuevo." };
  }
}

/** Publica tal cual la receta generada en el recetario del usuario. */
export async function publishAIRecipeAction(input: AIRecipe) {
  const session = await requireUser();
  const parsed = aiRecipeSchema.safeParse(input);
  if (!parsed.success) return { error: "Receta inválida" };
  await connectDB();
  const slug = await uniqueSlug(Recipe, parsed.data.title);
  await Recipe.create({ ...parsed.data, slug, author: session.id, fromAI: true, published: true });
  revalidatePath("/", "layout");
  redirect(`/recetas/${slug}`);
}
