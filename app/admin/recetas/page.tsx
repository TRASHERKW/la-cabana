import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Recipe, type RecipeWithAuthor } from "@/models/Recipe";
import { serialize } from "@/lib/utils";
import { deleteRecipeAction } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";
import Cover from "@/components/Cover";

export const dynamic = "force-dynamic";

export default async function AdminRecetas() {
  await connectDB();
  const recipes = serialize<RecipeWithAuthor[]>(await Recipe.find({}, "-ratings").sort({ createdAt: -1 }).populate("author", "name").lean());

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-madera-oscura">Recetas</h1>
        <Link href="/admin/recetas/nueva" className="btn-primary">+ Nueva receta</Link>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-arena text-left text-xs uppercase tracking-wider text-carbon/50">
            <tr>
              <th className="p-4">Receta</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Autor</th>
              <th className="p-4">★</th>
              <th className="p-4">Estado</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-arena">
            {recipes.map((r) => (
              <tr key={r._id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg"><Cover src={r.image} alt={r.title} /></div>
                    <span className="font-medium">{r.title}</span>
                  </div>
                </td>
                <td className="p-4 text-carbon/70">{r.category}</td>
                <td className="p-4 text-carbon/70">{r.author?.name ?? "La Cabaña"}{r.fromAI && " ✨"}</td>
                <td className="p-4 text-carbon/70">{r.ratingCount ? `${r.ratingAvg.toFixed(1)} (${r.ratingCount})` : "—"}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.published ? "bg-emerald-100 text-emerald-800" : "bg-arena text-carbon/60"}`}>
                    {r.published ? "Publicada" : "Borrador"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-4">
                    {r.published && <Link href={`/recetas/${r.slug}`} className="text-sm text-carbon/60 hover:underline">Ver</Link>}
                    <Link href={`/admin/recetas/${r._id}`} className="text-sm font-medium text-brasa hover:underline">Editar</Link>
                    <DeleteButton id={r._id} action={deleteRecipeAction} />
                  </div>
                </td>
              </tr>
            ))}
            {recipes.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-carbon/50">Todavía no hay recetas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
