"use client";

import { useState } from "react";

/** Botón de borrar con confirmación en dos clics (sin alert/confirm del navegador). */
export default function DeleteButton({ id, action }: { id: string; action: (formData: FormData) => Promise<void> }) {
  const [armed, setArmed] = useState(false);
  return (
    <form action={action} onMouseLeave={() => setArmed(false)}>
      <input type="hidden" name="id" value={id} />
      {armed ? (
        <button className="text-sm font-semibold text-red-700 hover:underline">¿Seguro? Borrar</button>
      ) : (
        <button type="button" onClick={() => setArmed(true)} className="text-sm text-carbon/50 hover:text-red-700">
          Borrar
        </button>
      )}
    </form>
  );
}
