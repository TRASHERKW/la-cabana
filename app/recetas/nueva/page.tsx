import { requireUser } from "@/lib/auth";
import RecipeForm from "@/components/admin/RecipeForm";

export const metadata = { title: "Crear receta" };

export default async function NuevaRecetaUsuario() {
  await requireUser();
  return (
    <div className="container-lc py-12">
      <h1 className="text-4xl text-madera-oscura">Comparte tu receta</h1>
      <p className="mb-8 mt-2 text-carbon/60">Se publica al momento y la comunidad podrá guardarla y calificarla.</p>
      <RecipeForm />
    </div>
  );
}
