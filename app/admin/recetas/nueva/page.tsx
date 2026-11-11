import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { serialize } from "@/lib/utils";
import RecipeForm from "@/components/admin/RecipeForm";

export const dynamic = "force-dynamic";

export default async function NuevaReceta() {
  await connectDB();
  const products = serialize<{ _id: string; name: string }[]>(await Product.find({}, "name").sort({ name: 1 }).lean());
  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold text-madera-oscura">Nueva receta</h1>
      <RecipeForm mode="admin" products={products} />
    </div>
  );
}
