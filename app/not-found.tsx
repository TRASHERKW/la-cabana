import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-lc grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="font-display text-7xl text-brasa">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-madera-oscura">Esta página se nos quemó</h1>
        <p className="mt-2 text-carbon/60">No encontramos lo que buscabas.</p>
        <Link href="/" className="btn-primary mt-6">Volver al inicio</Link>
      </div>
    </div>
  );
}
