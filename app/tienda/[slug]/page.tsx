import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries";
import { formatMXN } from "@/lib/utils";
import Cover from "@/components/Cover";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  return { title: product?.name ?? "Producto" };
}

export default async function ProductoPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  return (
    <div className="container-lc py-12">
      <Link href="/tienda" className="text-sm text-carbon/60 hover:text-brasa">← Volver a la tienda</Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-3xl">
          <Cover src={product.image} alt={product.name} />
        </div>
        <div className="self-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-bosque">{product.category}</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight text-madera-oscura md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-3xl font-semibold text-madera">{formatMXN(product.price)}</p>
          {product.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-carbon/70">{product.description}</p>}
          <p className={`mt-6 text-sm font-medium ${product.stock > 0 ? "text-bosque" : "text-red-700"}`}>
            {product.stock > 0 ? `${product.stock} disponibles` : "Agotado por ahora"}
          </p>
          <div className="mt-4">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
