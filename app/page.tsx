/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getPosts, getProducts, getRecipes } from "@/lib/queries";
import { CATEGORY_INFO, RECIPE_CATEGORIES } from "@/lib/utils";
import { ProductCard, RecipeCard, PostCard, EmptyState } from "@/components/Cards";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [recipes, best, products, posts] = await Promise.all([
    getRecipes({ limit: 3 }),
    getRecipes({ limit: 3, sort: "mejores" }),
    getProducts({ limit: 4 }),
    getPosts({ limit: 3 }),
  ]);

  return (
    <>
      {/* Hero con la foto original */}
      <section className="relative isolate overflow-hidden">
        <img src="/img/hero.jpg" alt="Comida saludable" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-madera-oscura/85 via-madera-oscura/55 to-transparent" />
        <div className="container-lc py-24 md:py-36">
          <div className="max-w-xl animate-rise">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-paja/90">Recetario colaborativo</p>
            <h1 className="mt-4 text-5xl leading-[1.05] text-white md:text-6xl">
              Dile sí al antojo, <span className="text-paja">de la manera sana.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Recetas saludables compartidas por la comunidad, consejos para comer mejor y una IA que te arma una receta con lo que tengas en casa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/recetas" className="btn-primary !px-7 !py-3">Ver recetas</Link>
              <Link href="/recetas/nueva" className="btn !border !border-white/40 !px-7 !py-3 text-white hover:bg-white/10">Comparte la tuya</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="container-lc pt-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {RECIPE_CATEGORIES.map((c) => (
            <Link key={c} href={`/recetas?categoria=${encodeURIComponent(c)}`} className="group relative isolate aspect-[4/5] overflow-hidden rounded-2xl md:aspect-[3/4]">
              <img src={CATEGORY_INFO[c].image} alt={c} className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-madera-oscura/90 via-madera-oscura/20 to-transparent" />
              <div className="flex h-full flex-col justify-end p-4 md:p-5">
                <h2 className="text-2xl text-white md:text-3xl">{c}</h2>
                <p className="mt-1 text-xs text-white/75 md:text-sm">{CATEGORY_INFO[c].text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recetas */}
      <section className="container-lc pt-20">
        <SectionHeader title="Recién salidas de la cocina" href="/recetas" cta="Todas las recetas" />
        <Grid items={recipes} empty="Aún no hay recetas" render={(r) => <RecipeCard key={r._id} recipe={r} />} />
      </section>

      {/* IA banner */}
      <section className="container-lc pt-20">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-madera p-8 text-crema md:grid-cols-[1.3fr_1fr] md:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-paja/80">✨ Nuevo</p>
            <h2 className="mt-2 text-4xl text-white">Crea tu receta con Inteligencia Artificial</h2>
            <p className="mt-3 text-crema/75">Dile qué tienes en el refri o qué se te antoja, y la IA te arma una receta saludable que puedes guardar en tu recetario.</p>
            <Link href="/ia" className="btn mt-6 bg-paja text-madera-oscura hover:bg-white">Probar ahora</Link>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 font-mono text-sm leading-relaxed text-crema/85">
            <p className="text-paja">&gt; algo con pollo y espinacas, ligero para la cena</p>
            <p className="mt-3">🍽 Pechuga rellena de espinacas</p>
            <p className="text-crema/60">⏱ 30 min · 2 porciones · Fácil</p>
          </div>
        </div>
      </section>

      {/* Mejor calificadas */}
      {best.some((r) => r.ratingCount > 0) && (
        <section className="container-lc pt-20">
          <SectionHeader title="Las mejor calificadas" href="/recetas?orden=mejores" cta="Ver ranking" />
          <Grid items={best} empty="" render={(r) => <RecipeCard key={r._id} recipe={r} />} />
        </section>
      )}

      {/* Blog */}
      <section className="container-lc pt-20">
        <SectionHeader title="Blog de consejos" href="/blog" cta="Ir al blog" />
        <Grid items={posts} empty="Todavía no hay consejos" render={(p) => <PostCard key={p._id} post={p} />} />
      </section>

      {/* Tienda */}
      <section className="container-lc pt-20">
        <SectionHeader title="De nuestra tienda" href="/tienda" cta="Ver toda la tienda" />
        {products.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <div className="mt-8"><EmptyState title="La tienda está vacía">Agrega productos desde el panel de admin.</EmptyState></div>
        )}
      </section>
    </>
  );
}

function Grid<T>({ items, empty, render }: { items: T[]; empty: string; render: (item: T) => React.ReactNode }) {
  if (!items.length) return <div className="mt-8"><EmptyState title={empty} /></div>;
  return <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map(render)}</div>;
}

function SectionHeader({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-3xl text-madera-oscura md:text-4xl">{title}</h2>
      <Link href={href} className="shrink-0 text-sm font-semibold text-brasa hover:underline">{cta} →</Link>
    </div>
  );
}
