import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// Opiniones (comentarios) dentro de cada consejo del blog
const CommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    text: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true }
);

export type PostDoc = InferSchemaType<typeof PostSchema>;
export const Post: Model<PostDoc> = models.Post || model<PostDoc>("Post", PostSchema);

export type PostDTO = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  author: { _id: string; name: string; avatar?: string } | null;
  comments: { _id: string; user: string; name: string; text: string; createdAt: string }[];
  createdAt: string;
};
