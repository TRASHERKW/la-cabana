"use client";

import { useActionState, useState } from "react";
import { updateProfileAction } from "@/app/actions/auth";
import ImageInput from "./ImageInput";

export default function ProfileForm({ name, email, avatar }: { name: string; email: string; avatar: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);
  const [showPass, setShowPass] = useState(false);

  return (
    <form action={action} className="card space-y-5 p-6">
      <ImageInput name="avatar" defaultValue={avatar} label="Foto de perfil" round />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Nombre</label>
          <input id="name" name="name" required minLength={2} defaultValue={name} className="input" />
        </div>
        <div>
          <label className="label">Correo</label>
          <input value={email} disabled className="input opacity-60" />
        </div>
      </div>

      {showPass ? (
        <div className="grid gap-4 rounded-xl bg-paja/50 p-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="currentPassword">Contraseña actual</label>
            <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="newPassword">Nueva contraseña</label>
            <input id="newPassword" name="newPassword" type="password" minLength={8} autoComplete="new-password" className="input" />
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowPass(true)} className="text-sm font-semibold text-brasa hover:underline">
          Cambiar contraseña
        </button>
      )}

      {state?.error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">{state.ok}</p>}
      <button disabled={pending} className="btn-primary">{pending ? "Guardando…" : "Guardar perfil"}</button>
    </form>
  );
}
