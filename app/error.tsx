"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-lc grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="text-6xl">🔥</p>
        <h1 className="mt-4 text-3xl font-semibold text-madera-oscura">Algo salió mal</h1>
        <p className="mt-2 text-carbon/60">Revisa que MongoDB esté corriendo y que tu .env.local esté bien configurado.</p>
        <button onClick={reset} className="btn-primary mt-6">Intentar de nuevo</button>
      </div>
    </div>
  );
}
