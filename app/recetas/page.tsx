import Link from "next/link";
import { getRecipes } from "@/lib/queries";
import { CATEGORY_INFO, RECIPE_CATEGORIES } from "@/lib/utils";
import { RecipeCard, EmptyState } from "@/components/Cards";
import Filters from "@/components/Filters";
import PageHero from "@/components/PageHero";

export const metadata = { title: "Recetas" };
export const dynamic = "force-dynamic";

type SP = { q?: string; categoria?: string; orden?: string };

export default async function RecetasPage({ searchParams }: { searchParams: Promise<SP> }) {
  const { q, categoria, orden } = await searchParams;
  const sort = orden === "mejores" ? "mejores" : "recientes";
  const recipes = await getRecipes({ q, categoria, sort });
  const hero = categoria && CATEGORY_INFO[categoria];

  const sortHref = (o: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (categoria) p.set("categoria", categoria);
    if (o !== "recientes") p.set("orden", o);
    const s = p.toString();
    return s ? `/recetas?${s}` : "/recetas";
  };

  return (
    <>
      <PageHero
        image={hero ? hero.image : "/img/recetas-hero.jpg"}
        title={categoria ?? "Recetas"}
        subtitle={hero ? hero.text : "El arte de una vida buena, sana y saludable."}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/recetas/nueva" className="btn-primary">+ Crear receta</Link>
          <Link href="/ia" className="btn !border !border-white/40 text-white hover:bg-white/10">✨ Receta con IA</Link>
        </div>
      </PageHero>

      <div className="container-lc py-10">
        <Filters basePath="/recetas" categories={RECIPE_CATEGORIES} current={categoria} q={q} placeholder="Buscar receta…" extra={orden ? { orden } : undefined} />
        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-carbon/55">{recipes.length} {recipes.length === 1 ? "receta" : "recetas"}</p>
          <div className="flex gap-1 rounded-full border border-arena bg-papel p-1 text-sm">
            {[
              ["recientes", "Recientes"],
              ["mejores", "Mejor calificadas"],
            ].map(([k, label]) => (
              <Link key={k} href={sortHref(k)} className={`rounded-full px-3 py-1 ${sort === k ? "bg-madera text-crema" : "text-carbon/65 hover:text-madera"}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6">
          {recipes.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((r) => <RecipeCard key={r._id} recipe={r} />)}
            </div>
          ) : (
            <EmptyState title="No encontramos recetas">
              Prueba con otra búsqueda o <Link href="/recetas/nueva" className="font-semibold text-brasa hover:underline">sube la primera</Link>.
            </EmptyState>
          )}
        </div>
      </div>
    </>
  );
}
