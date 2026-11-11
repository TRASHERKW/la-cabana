"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/actions/auth";

type Props = {
  mode: "login" | "registro";
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  next?: string;
};

export default function AuthForm({ mode, action, next }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isLogin = mode === "login";

  return (
    <div className="container-lc grid min-h-[70vh] place-items-center py-16">
      <div className="card w-full max-w-md p-8 animate-rise">
        <h1 className="text-3xl font-semibold text-madera-oscura">{isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}</h1>
        <p className="mt-2 text-sm text-carbon/60">
          {isLogin ? "Entra para hacer pedidos y ver tu historial." : "Regístrate para comprar en la tienda de La Cabaña."}
        </p>

        <form action={formAction} className="mt-8 space-y-4">
          {next && <input type="hidden" name="next" value={next} />}
          {!isLogin && (
            <div>
              <label className="label" htmlFor="name">Nombre</label>
              <input id="name" name="name" required className="input" autoComplete="name" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Correo</label>
            <input id="email" name="email" type="email" required className="input" autoComplete="email" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label" htmlFor="password">Contraseña</label>
              {isLogin && (
                <Link href="/recuperar" className="mb-1.5 text-xs font-semibold text-brasa hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={isLogin ? 1 : 8}
              className="input"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {state?.error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>}

          <button disabled={pending} className="btn-primary w-full !py-3">
            {pending ? "Un momento…" : isLogin ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-carbon/60">
          {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <Link
            href={`${isLogin ? "/registro" : "/login"}${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-brasa hover:underline"
          >
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </Link>
        </p>
      </div>
    </div>
  );
}
