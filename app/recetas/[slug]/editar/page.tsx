import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getRecipeBySlug } from "@/lib/queries";
import RecipeForm from "@/components/admin/RecipeForm";

export const metadata = { title: "Editar receta" };
export const dynamic = "force-dynamic";

export default async function EditarRecetaUsuario({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requireUser();
  const recipe = await getRecipeBySlug((await params).slug);
  if (!recipe) notFound();
  if (recipe.author?._id !== session.id && session.role !== "admin") notFound();

  return (
    <div className="container-lc py-12">
      <h1 className="mb-8 text-4xl text-madera-oscura">Editar: {recipe.title}</h1>
      <RecipeForm
        recipe={{ ...recipe, products: recipe.products.map((p) => p._id) }}
        cancelHref={`/recetas/${recipe.slug}`}
      />
    </div>
  );
}
