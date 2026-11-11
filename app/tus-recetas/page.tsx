import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getFavoriteRecipes, getRecipesByAuthor } from "@/lib/queries";
import { RecipeCard, EmptyState } from "@/components/Cards";
import PageHero from "@/components/PageHero";

export const metadata = { title: "Tus recetas" };
export const dynamic = "force-dynamic";

export default async function TusRecetasPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await requireUser();
  const { tab } = await searchParams;
  const active = tab === "mias" ? "mias" : "guardadas";
  const [mine, saved] = await Promise.all([getRecipesByAuthor(session.id), getFavoriteRecipes(session.id)]);
  const list = active === "mias" ? mine : saved;

  return (
    <>
      <PageHero image="/img/restaurante.jpg" title="Tus recetas" subtitle="Las que guardaste para después y las que tú compartiste.">
        <div className="flex flex-wrap gap-3">
          <Link href="/recetas/nueva" className="btn-primary">+ Crear receta</Link>
          <Link href="/ia" className="btn !border !border-white/40 text-white hover:bg-white/10">✨ Crear con IA</Link>
        </div>
      </PageHero>

      <div className="container-lc py-10">
        <div className="flex gap-1 border-b border-arena">
          {[
            ["guardadas", `Guardadas (${saved.length})`],
            ["mias", `Mis recetas (${mine.length})`],
          ].map(([k, label]) => (
            <Link
              key={k}
              href={k === "guardadas" ? "/tus-recetas" : "/tus-recetas?tab=mias"}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${
                active === k ? "border-madera text-madera" : "border-transparent text-carbon/55 hover:text-madera"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="mt-8">
          {list.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((r) => <RecipeCard key={r._id} recipe={r} />)}
            </div>
          ) : active === "guardadas" ? (
            <EmptyState title="Aún no guardas recetas">
              Dale a <b>“Guardar receta”</b> en cualquier receta y aparecerá aquí. <Link href="/recetas" className="font-semibold text-brasa hover:underline">Ver recetas</Link>
            </EmptyState>
          ) : (
            <EmptyState title="Todavía no compartes recetas">
              <Link href="/recetas/nueva" className="font-semibold text-brasa hover:underline">Sube tu primera receta</Link> o crea una con IA.
            </EmptyState>
          )}
        </div>
      </div>
    </>
  );
}
