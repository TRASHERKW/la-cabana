import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { ImageFile } from "@/models/Image";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return new Response("No encontrada", { status: 404 });
  await connectDB();
  const img = await ImageFile.findById(id); // sin lean: así data llega como Buffer
  if (!img) return new Response("No encontrada", { status: 404 });
  return new Response(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.contentType,
      // Las imágenes nunca cambian (cada subida tiene un id nuevo)
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
