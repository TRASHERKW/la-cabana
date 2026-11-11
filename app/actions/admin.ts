"use server";

import { z } from "zod";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { imageField, lines } from "@/lib/validation";
import { recipeSchema, uniqueSlug } from "@/lib/recipe-helpers";
import { Product } from "@/models/Product";
import { Recipe } from "@/models/Recipe";
import { Order } from "@/models/Order";
import { Post } from "@/models/Post";
import { User } from "@/models/User";

export type AdminFormState = { error?: string } | undefined;

/* ---------- Productos ---------- */

const productSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  description: z.string().trim().default(""),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock: z.coerce.number().int("El stock debe ser entero").min(0, "El stock no puede ser negativo"),
  category: z.string().trim().min(1),
  image: imageField,
});

export async function saveProductAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDB();
  const id = String(formData.get("id") ?? "");
  const data = { ...parsed.data, featured: formData.get("featured") === "on" };

  if (id) {
    if (!Types.ObjectId.isValid(id)) return { error: "ID inválido" };
    await Product.findByIdAndUpdate(id, { ...data, slug: await uniqueSlug(Product, data.name, id) });
  } else {
    await Product.create({ ...data, slug: await uniqueSlug(Product, data.name) });
  }
  revalidatePath("/", "layout");
  redirect("/admin/productos");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  if (!Types.ObjectId.isValid(id)) return;
  await connectDB();
  await Product.findByIdAndDelete(id);
  await Recipe.updateMany({}, { $pull: { products: id } });
  revalidatePath("/", "layout");
}

/* ---------- Recetas ---------- */

export async function saveRecipeAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = recipeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ingredients = lines(formData.get("ingredients"));
  const steps = lines(formData.get("steps"));
  if (!ingredients.length) return { error: "Agrega al menos un ingrediente" };
  if (!steps.length) return { error: "Agrega al menos un paso" };

  const products = formData
    .getAll("products")
    .map(String)
    .filter((p) => Types.ObjectId.isValid(p));

  await connectDB();
  const id = String(formData.get("id") ?? "");
  const data = { ...parsed.data, ingredients, steps, products, published: formData.get("published") === "on" };

  if (id) {
    if (!Types.ObjectId.isValid(id)) return { error: "ID inválido" };
    await Recipe.findByIdAndUpdate(id, { ...data, slug: await uniqueSlug(Recipe, data.title, id) });
  } else {
    await Recipe.create({ ...data, slug: await uniqueSlug(Recipe, data.title) });
  }
  revalidatePath("/", "layout");
  redirect("/admin/recetas");
}

export async function deleteRecipeAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  if (!Types.ObjectId.isValid(id)) return;
  await connectDB();
  await Recipe.findByIdAndDelete(id);
  await User.updateMany({}, { $pull: { favorites: id } });
  revalidatePath("/", "layout");
}

/* ---------- Blog ---------- */

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  if (!Types.ObjectId.isValid(id)) return;
  await connectDB();
  await Post.findByIdAndDelete(id);
  revalidatePath("/", "layout");
}

/* ---------- Pedidos ---------- */

const statusSchema = z.enum(["pendiente", "preparando", "enviado", "entregado", "cancelado"]);

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = statusSchema.safeParse(formData.get("status"));
  if (!Types.ObjectId.isValid(id) || !status.success) return;

  await connectDB();
  const order = await Order.findById(id);
  if (!order || order.status === status.data) return;

  // Si se cancela, regresamos el stock; si se "descancela", lo volvemos a apartar
  if (status.data === "cancelado" && order.status !== "cancelado") {
    await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));
  } else if (order.status === "cancelado") {
    await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: -i.quantity } })));
  }

  order.status = status.data;
  await order.save();
  revalidatePath("/admin", "layout");
}
