import { requireUser } from "@/lib/auth";
import PostForm from "@/components/PostForm";

export const metadata = { title: "Crear consejo" };

export default async function NuevoConsejo() {
  await requireUser();
  return (
    <div className="container-lc py-12">
      <h1 className="text-4xl text-madera-oscura">Crear consejo</h1>
      <p className="mb-8 mt-2 text-carbon/60">Comparte lo que sabes sobre comer rico y sano.</p>
      <PostForm />
    </div>
  );
}
