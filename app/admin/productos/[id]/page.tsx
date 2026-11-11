import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { Product, type ProductDTO } from "@/models/Product";
import { serialize } from "@/lib/utils";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditarProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const doc = await Product.findById(id).lean();
  if (!doc) notFound();
  const product = serialize<ProductDTO>(doc);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold text-madera-oscura">Editar: {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}
