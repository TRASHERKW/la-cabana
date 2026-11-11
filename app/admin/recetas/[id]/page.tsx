import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { Recipe, type RecipeDTO } from "@/models/Recipe";
import { Product } from "@/models/Product";
import { serialize } from "@/lib/utils";
import RecipeForm from "@/components/admin/RecipeForm";

export const dynamic = "force-dynamic";

export default async function EditarReceta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const [doc, products] = await Promise.all([Recipe.findById(id).lean(), Product.find({}, "name").sort({ name: 1 }).lean()]);
  if (!doc) notFound();
  const recipe = serialize<RecipeDTO>(doc);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold text-madera-oscura">Editar: {recipe.title}</h1>
      <RecipeForm mode="admin" recipe={recipe} products={serialize(products)} />
    </div>
  );
}
