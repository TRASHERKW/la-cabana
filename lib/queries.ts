import { isValidObjectId } from "mongoose";
import { connectDB } from "./db";
import { escapeRegex, serialize } from "./utils";
import { Product, type ProductDTO } from "@/models/Product";
import { Recipe, type RecipeWithAuthor, type ReviewDTO } from "@/models/Recipe";
import { Post, type PostDTO } from "@/models/Post";
import { User } from "@/models/User";

type ListOpts = { q?: string; categoria?: string; limit?: number; sort?: "recientes" | "mejores" };

const AUTHOR_FIELDS = "name avatar";

export async function getProducts({ q, categoria, limit }: ListOpts = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };
  if (categoria) filter.category = categoria;
  const query = Product.find(filter).sort({ featured: -1, createdAt: -1 });
  if (limit) query.limit(limit);
  return serialize<ProductDTO[]>(await query.lean());
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  const doc = await Product.findOne({ slug }).lean();
  return doc ? serialize<ProductDTO>(doc) : null;
}

export async function getRecipes({ q, categoria, limit, sort = "recientes" }: ListOpts = {}) {
  await connectDB();
  const filter: Record<string, unknown> = { published: true };
  if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };
  if (categoria) filter.category = categoria;
  const order: Record<string, 1 | -1> = sort === "mejores" ? { ratingAvg: -1, ratingCount: -1 } : { createdAt: -1 };
  const query = Recipe.find(filter, "-ratings").sort(order).populate("author", AUTHOR_FIELDS);
  if (limit) query.limit(limit);
  return serialize<RecipeWithAuthor[]>(await query.lean());
}

export async function getRecipeBySlug(slug: string) {
  await connectDB();
  const doc = await Recipe.findOne({ slug })
    .populate("products")
    .populate("author", AUTHOR_FIELDS)
    .populate("ratings.user", AUTHOR_FIELDS)
    .lean();
  if (!doc) return null;
  return serialize<Omit<RecipeWithAuthor, "products" | "ratings"> & { products: ProductDTO[]; ratings: ReviewDTO[] }>(doc);
}

export async function getRecipesByAuthor(userId: string) {
  if (!isValidObjectId(userId)) return [];
  await connectDB();
  const docs = await Recipe.find({ author: userId }, "-ratings").sort({ createdAt: -1 }).populate("author", AUTHOR_FIELDS).lean();
  return serialize<RecipeWithAuthor[]>(docs);
}

export async function getFavoriteRecipes(userId: string) {
  if (!isValidObjectId(userId)) return [];
  await connectDB();
  const user = await User.findById(userId, "favorites").lean();
  if (!user?.favorites?.length) return [];
  const docs = await Recipe.find({ _id: { $in: user.favorites }, published: true }, "-ratings").populate("author", AUTHOR_FIELDS).lean();
  return serialize<RecipeWithAuthor[]>(docs);
}

export async function getFavoriteIds(userId?: string) {
  if (!userId || !isValidObjectId(userId)) return [] as string[];
  await connectDB();
  const user = await User.findById(userId, "favorites").lean();
  return (user?.favorites ?? []).map((f) => f.toString());
}

export async function getPosts({ q, limit }: { q?: string; limit?: number } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };
  const query = Post.find(filter).sort({ createdAt: -1 }).populate("author", AUTHOR_FIELDS);
  if (limit) query.limit(limit);
  return serialize<PostDTO[]>(await query.lean());
}

export async function getPostBySlug(slug: string) {
  await connectDB();
  const doc = await Post.findOne({ slug }).populate("author", AUTHOR_FIELDS).lean();
  return doc ? serialize<PostDTO>(doc) : null;
}
