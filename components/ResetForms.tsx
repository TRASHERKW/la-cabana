"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction, resetPasswordAction } from "@/app/actions/auth";

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container-lc grid min-h-[70vh] place-items-center py-16">
      <div className="card w-full max-w-md p-8 animate-rise">
        <h1 className="text-3xl text-madera-oscura">{title}</h1>
        <p className="mt-2 text-sm text-carbon/60">{subtitle}</p>
        {children}
        <p className="mt-6 text-center text-sm text-carbon/60">
          ¿Te acordaste? <Link href="/login" className="font-semibold text-brasa hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

export function RequestResetForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, undefined);
  return (
    <Shell title="¿Olvidaste tu contraseña?" subtitle="Escribe tu correo y te mandamos un enlace para crear una nueva.">
      {state?.ok ? (
        <p className="mt-8 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">📬 {state.ok}</p>
      ) : (
        <form action={action} className="mt-8 space-y-4">
          <div>
            <label className="label" htmlFor="email">Correo</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="input" />
          </div>
          {state?.error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>}
          <button disabled={pending} className="btn-primary w-full !py-3">{pending ? "Enviando…" : "Enviar enlace"}</button>
        </form>
      )}
    </Shell>
  );
}

export function NewPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);
  return (
    <Shell title="Crea tu nueva contraseña" subtitle="Elige una que no uses en otros sitios.">
      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="label" htmlFor="password">Nueva contraseña</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Repítela</label>
          <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input" />
        </div>
        {state?.error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {state.error} {state.error.includes("nuevo") && <Link href="/recuperar" className="font-semibold underline">Pedir otro</Link>}
          </p>
        )}
        <button disabled={pending} className="btn-primary w-full !py-3">{pending ? "Guardando…" : "Cambiar contraseña"}</button>
      </form>
    </Shell>
  );
}
