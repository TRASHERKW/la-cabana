import { getSession } from "@/lib/auth";
import AIGenerator from "@/components/AIGenerator";

export const metadata = { title: "Receta con IA" };

export default async function IAPage() {
  const session = await getSession();
  return (
    <div className="container-lc py-12">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bosque">✨ Receta con IA</p>
        <h1 className="mt-2 text-4xl text-madera-oscura md:text-5xl">Crea tu receta con Inteligencia Artificial</h1>
        <p className="mt-3 text-carbon/65">Escribe qué tienes en casa o qué se te antoja. La IA te arma una receta saludable y, si te gusta, la publicas en tu recetario.</p>
      </div>
      <div className="mx-auto mt-10 max-w-3xl">
        <AIGenerator loggedIn={!!session} />
      </div>
    </div>
  );
}
