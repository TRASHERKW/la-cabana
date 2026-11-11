import { getProducts } from "@/lib/queries";
import { PRODUCT_CATEGORIES } from "@/lib/utils";
import { ProductCard, EmptyState } from "@/components/Cards";
import Filters from "@/components/Filters";
import PageHero from "@/components/PageHero";

export const metadata = { title: "Tienda" };
export const dynamic = "force-dynamic";

export default async function TiendaPage({ searchParams }: { searchParams: Promise<{ q?: string; categoria?: string }> }) {
  const { q, categoria } = await searchParams;
  const products = await getProducts({ q, categoria });

  return (
    <>
    <PageHero image="/img/recetas-hero.jpg" title="Tienda" subtitle="Pimientas y especias seleccionadas para darle sabor a tu cocina sana." />
    <div className="container-lc py-10">
      <div>
        <Filters basePath="/tienda" categories={PRODUCT_CATEGORIES} current={categoria} q={q} placeholder="Buscar producto…" />
      </div>
      <div className="mt-10">
        {products.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <EmptyState title="No encontramos productos">Prueba con otra búsqueda o categoría.</EmptyState>
        )}
      </div>
    </div>
    </>
  );
}
