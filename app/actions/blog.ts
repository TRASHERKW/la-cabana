"use server";

import { z } from "zod";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getSession, requireUser } from "@/lib/auth";
import { imageField } from "@/lib/validation";
import { uniqueSlug } from "@/lib/recipe-helpers";
import { Post } from "@/models/Post";

export type BlogFormState = { error?: string } | undefined;

const postSchema = z.object({
  title: z.string().trim().min(4, "El título es muy corto").max(140),
  content: z.string().trim().min(20, "Escribe un poco más (mínimo 20 caracteres)").max(8000),
  image: imageField,
});

export async function savePostAction(_prev: BlogFormState, formData: FormData): Promise<BlogFormState> {
  const session = await requireUser();
  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDB();
  const id = String(formData.get("id") ?? "");
  let slug: string;

  if (id) {
    if (!Types.ObjectId.isValid(id)) return { error: "ID inválido" };
    const post = await Post.findById(id);
    if (!post) return { error: "El consejo ya no existe" };
    if (post.author.toString() !== session.id && session.role !== "admin") return { error: "Solo puedes editar tus consejos" };
    slug = await uniqueSlug(Post, parsed.data.title, id);
    await Post.updateOne({ _id: id }, { ...parsed.data, slug });
  } else {
    slug = await uniqueSlug(Post, parsed.data.title);
    await Post.create({ ...parsed.data, slug, author: session.id });
  }
  revalidatePath("/blog");
  redirect(`/blog/${slug}`);
}

export async function deleteMyPostAction(formData: FormData) {
  const session = await requireUser();
  const id = String(formData.get("id"));
  if (!Types.ObjectId.isValid(id)) return;
  await connectDB();
  await Post.deleteOne(session.role === "admin" ? { _id: id } : { _id: id, author: session.id });
  revalidatePath("/blog");
  redirect("/blog");
}

export type CommentState = { error?: string; ok?: boolean } | undefined;

/** Deja una opinión en un consejo del blog. */
export async function addCommentAction(_prev: CommentState, formData: FormData): Promise<CommentState> {
  const session = await getSession();
  if (!session) return { error: "Inicia sesión para opinar" };
  const postId = String(formData.get("postId"));
  const text = String(formData.get("text") ?? "").trim();
  if (!Types.ObjectId.isValid(postId)) return { error: "Consejo inválido" };
  if (text.length < 2) return { error: "Escribe tu opinión" };
  if (text.length > 1000) return { error: "Máximo 1000 caracteres" };

  await connectDB();
  const post = await Post.findByIdAndUpdate(postId, { $push: { comments: { user: session.id, name: session.name, text } } });
  if (!post) return { error: "El consejo ya no existe" };
  revalidatePath(`/blog/${post.slug}`);
  return { ok: true };
}

export async function deleteCommentAction(formData: FormData) {
  const session = await requireUser();
  const postId = String(formData.get("postId"));
  const commentId = String(formData.get("id"));
  if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(commentId)) return;
  await connectDB();
  // El autor del comentario o el admin pueden borrarlo
  const match = session.role === "admin" ? { _id: commentId } : { _id: commentId, user: session.id };
  const post = await Post.findByIdAndUpdate(postId, { $pull: { comments: match } });
  if (post) revalidatePath(`/blog/${post.slug}`);
}
