import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ImageFile } from "@/models/Image";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Inicia sesión para subir fotos" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No llegó ninguna imagen" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Solo se permiten JPG, PNG o WebP" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "La imagen pesa más de 3 MB" }, { status: 400 });

  await connectDB();
  const img = await ImageFile.create({
    data: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
    owner: session.id,
  });
  return NextResponse.json({ url: `/api/images/${img._id}` });
}
