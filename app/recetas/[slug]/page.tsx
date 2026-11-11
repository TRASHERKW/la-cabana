import Link from "next/link";
import { notFound } from "next/navigation";
import { getFavoriteIds, getRecipeBySlug } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import Cover from "@/components/Cover";
import Avatar from "@/components/Avatar";
import { ProductCard } from "@/components/Cards";
import RecipeActions from "@/components/RecipeActions";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteMyRecipeAction, deleteReviewAction } from "@/app/actions/recipes";
import ReviewForm from "@/components/ReviewForm";
import Stars from "@/components/Stars";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const recipe = await getRecipeBySlug((await params).slug);
  return { title: recipe?.title ?? "Receta", description: recipe?.summary };
}

export default async function RecetaPage({ params }: Props) {
  const [recipe, session] = await Promise.all([getRecipeBySlug((await params).slug), getSession()]);
  if (!recipe) notFound();

  const isOwner = !!session && recipe.author?._id === session.id;
  const canManage = isOwner || session?.role === "admin";
  if (!recipe.published && !canManage) notFound();

  const favorites = await getFavoriteIds(session?.id);
  const myReview = recipe.ratings.find((r) => r.user?._id === session?.id);
  // Primero las reseñas con comentario, luego las más recientes
  const reviews = [...recipe.ratings].sort(
    (a, b) => Number(!!b.comment) - Number(!!a.comment) || (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")
  );
  const breakdown = [5, 4, 3, 2, 1].map((n) => ({ n, count: recipe.ratings.filter((r) => r.stars === n).length }));

  return (
    <article className="container-lc py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/recetas?categoria=${encodeURIComponent(recipe.category)}`} className="text-sm text-carbon/60 hover:text-brasa">
          ← {recipe.category}
        </Link>
        {canManage && (
          <div className="flex items-center gap-4">
            <Link href={`/recetas/${recipe.slug}/editar`} className="text-sm font-semibold text-brasa hover:underline">Editar</Link>
            <DeleteButton id={recipe._id} action={deleteMyRecipeAction} />
          </div>
        )}
      </div>

      {!recipe.published && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">Esta receta está oculta: solo tú y el admin pueden verla.</p>
      )}

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lg">
          <Cover src={recipe.image} alt={recipe.title} />
          {recipe.fromAI && <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-madera">✨ Hecha con IA</span>}
        </div>
        <div className="self-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-bosque">{recipe.category}</p>
          <h1 className="mt-2 text-4xl leading-tight text-madera-oscura md:text-5xl">{recipe.title}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-carbon/60">
            <Avatar src={recipe.author?.avatar} name={recipe.author?.name ?? "La Cabaña"} size="h-7 w-7" />
            Por <span className="font-semibold text-carbon/80">{recipe.author?.name ?? "La Cabaña"}</span>
          </div>
          {recipe.summary && <p className="mt-4 text-lg leading-relaxed text-carbon/70">{recipe.summary}</p>}
          <dl className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["Tiempo", `${recipe.prepMinutes} min`],
              ["Porciones", recipe.servings],
              ["Dificultad", recipe.difficulty],
            ].map(([k, v]) => (
              <div key={k} className="card px-4 py-3 text-center">
                <dt className="text-xs text-carbon/50">{k}</dt>
                <dd className="mt-0.5 font-semibold text-madera">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <RecipeActions
              recipeId={recipe._id}
              slug={recipe.slug}
              initialSaved={favorites.includes(recipe._id)}
              avg={recipe.ratingAvg}
              count={recipe.ratingCount}
              loggedIn={!!session}
            />
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-[1fr_1.6fr]">
        <section className="card h-fit bg-paja/60 p-6">
          <h2 className="text-2xl text-madera-oscura">Ingredientes</h2>
          <ul className="mt-4 space-y-2.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex gap-3 text-carbon/80">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brasa" />
                {ing}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-2xl text-madera-oscura">Preparación</h2>
          <ol className="mt-4 space-y-5">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-madera font-display text-sm text-crema">{i + 1}</span>
                <p className="pt-1 leading-relaxed text-carbon/80">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>


      <section id="resenas" className="mt-16 scroll-mt-32">
        <h2 className="text-2xl text-madera-oscura">Reseñas</h2>
        <div className="mt-6 grid gap-10 md:grid-cols-[1fr_1.6fr]">
          <div className="space-y-6">
            <div className="card p-5">
              <div className="flex items-end gap-3">
                <span className="font-display text-5xl text-madera">{recipe.ratingCount ? recipe.ratingAvg.toFixed(1) : "–"}</span>
                <div className="pb-1">
                  <Stars value={recipe.ratingAvg} size="text-lg" />
                  <p className="text-xs text-carbon/55">{recipe.ratingCount} {recipe.ratingCount === 1 ? "reseña" : "reseñas"}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-1.5">
                {breakdown.map(({ n, count }) => (
                  <li key={n} className="flex items-center gap-2 text-xs text-carbon/60">
                    <span className="w-6">{n} ★</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-arena">
                      <span className="block h-full rounded-full bg-amber-500" style={{ width: `${recipe.ratingCount ? (count / recipe.ratingCount) * 100 : 0}%` }} />
                    </span>
                    <span className="w-5 text-right">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            {isOwner ? (
              <p className="text-sm text-carbon/55">Es tu receta: aquí verás lo que opina la comunidad.</p>
            ) : session ? (
              <ReviewForm recipeId={recipe._id} initialStars={myReview?.stars ?? 0} initialComment={myReview?.comment ?? ""} />
            ) : (
              <p className="card p-4 text-sm text-carbon/70">
                <Link href={`/login?next=/recetas/${recipe.slug}`} className="font-semibold text-brasa hover:underline">Inicia sesión</Link> para dejar tu reseña.
              </p>
            )}
          </div>

          <ul className="space-y-4">
            {reviews.length === 0 && <li className="card p-6 text-center text-sm text-carbon/55">Nadie ha reseñado esta receta todavía. ¡Sé el primero!</li>}
            {reviews.map((r, i) => (
              <li key={r.user?._id ?? i} className={`card p-4 ${r.user?._id === session?.id ? "ring-2 ring-brasa/30" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={r.user?.avatar} name={r.user?.name ?? "Usuario"} size="h-9 w-9" />
                    <div>
                      <p className="text-sm font-semibold text-madera-oscura">
                        {r.user?.name ?? "Usuario eliminado"}
                        {r.user?._id === session?.id && <span className="ml-1.5 font-normal text-carbon/45">(tú)</span>}
                      </p>
                      <div className="flex items-center gap-2">
                        <Stars value={r.stars} />
                        {r.updatedAt && (
                          <span className="text-xs text-carbon/45">{new Date(r.updatedAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {session && r.user && (r.user._id === session.id || session.role === "admin") && (
                    <form action={deleteReviewAction}>
                      <input type="hidden" name="recipeId" value={recipe._id} />
                      <input type="hidden" name="userId" value={r.user._id} />
                      <button className="text-xs text-carbon/45 hover:text-red-700">Borrar</button>
                    </form>
                  )}
                </div>
                {r.comment && <p className="mt-2.5 whitespace-pre-line text-carbon/80">{r.comment}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {recipe.products.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl text-madera-oscura">Consigue los ingredientes</h2>
          <p className="mt-1 text-sm text-carbon/60">Productos de la tienda que usamos en esta receta.</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recipe.products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </article>
  );
}
