"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCommentAction } from "@/app/actions/blog";

export default function CommentForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(addCommentAction, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      <textarea name="text" required maxLength={1000} rows={3} placeholder="¿Qué opinas de este consejo?" className="input" />
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary">{pending ? "Enviando…" : "Publicar opinión"}</button>
    </form>
  );
}
