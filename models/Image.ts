import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// Fotos subidas por los usuarios. Se guardan en MongoDB para que funcione
// igual en tu compu que en un hosting como Vercel (que no guarda archivos).
const ImageSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export type ImageDoc = InferSchemaType<typeof ImageSchema>;
export const ImageFile: Model<ImageDoc> = models.Image || model<ImageDoc>("Image", ImageSchema);
