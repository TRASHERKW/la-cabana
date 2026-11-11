import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const RatingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    // Reseña opcional que acompaña a las estrellas
    comment: { type: String, default: "", maxlength: 1000 },
  },
  { _id: false, timestamps: true }
);

const RecipeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String, default: "" },
    category: { type: String, default: "Almuerzos" },
    image: { type: String, default: "" },
    prepMinutes: { type: Number, default: 30, min: 0 },
    servings: { type: Number, default: 4, min: 1 },
    difficulty: { type: String, enum: ["Fácil", "Media", "Difícil"], default: "Fácil" },
    ingredients: { type: [String], default: [] },
    steps: { type: [String], default: [] },
    // Productos de la tienda que se usan en la receta
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    // Quién la subió (vacío = receta oficial de La Cabaña)
    author: { type: Schema.Types.ObjectId, ref: "User", default: null },
    fromAI: { type: Boolean, default: false },
    ratings: { type: [RatingSchema], default: [] },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RecipeSchema.index({ category: 1, createdAt: -1 });

export type RecipeDoc = InferSchemaType<typeof RecipeSchema>;
export const Recipe: Model<RecipeDoc> = models.Recipe || model<RecipeDoc>("Recipe", RecipeSchema);

export type RecipeDTO = Omit<RecipeDoc, "products" | "author" | "ratings"> & {
  _id: string;
  products: string[];
  author: string | null;
  ratings: { user: string; stars: number; comment?: string; createdAt?: string; updatedAt?: string }[];
  createdAt: string;
  updatedAt: string;
};

/** Receta con autor poblado (nombre y foto). */
export type RecipeWithAuthor = Omit<RecipeDTO, "author"> & {
  author: { _id: string; name: string; avatar?: string } | null;
};

/** Reseña con el usuario poblado (para el detalle de la receta). */
export type ReviewDTO = {
  user: { _id: string; name: string; avatar?: string } | null;
  stars: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
};
