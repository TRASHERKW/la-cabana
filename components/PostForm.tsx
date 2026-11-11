"use client";

import Link from "next/link";
import { useActionState } from "react";
import { savePostAction } from "@/app/actions/blog";
import ImageInput from "./ImageInput";

type Props = { post?: { _id: string; title: string; content: string; image: string; slug: string } };

export default function PostForm({ post }: Props) {
  const [state, action, pending] = useActionState(savePostAction, undefined);
  return (
    <form action={action} className="card max-w-3xl space-y-5 p-6">
      {post && <input type="hidden" name="id" value={post._id} />}
      <div>
        <label className="label" htmlFor="title">Título del consejo</label>
        <input id="title" name="title" required minLength={4} maxLength={140} defaultValue={post?.title} className="input" placeholder="Ej. Cómo cocinar sin tanto aceite" />
      </div>
      <ImageInput name="image" defaultValue={post?.image} label="Imagen (opcional)" />
      <div>
        <label className="label" htmlFor="content">Contenido</label>
        <textarea id="content" name="content" required minLength={20} rows={12} defaultValue={post?.content} className="input" placeholder="Comparte tu consejo. Usa saltos de línea para separar párrafos." />
      </div>
      {state?.error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>}
      <div className="flex gap-3">
        <button disabled={pending} className="btn-primary">{pending ? "Publicando…" : post ? "Guardar cambios" : "Publicar consejo"}</button>
        <Link href={post ? `/blog/${post.slug}` : "/blog"} className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
