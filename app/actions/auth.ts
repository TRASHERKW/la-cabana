"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { clearSessionCookie, getSession, setSessionCookie } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { resetEmail, sendMail } from "@/lib/mail";

export type FormState = { error?: string } | undefined;

const registerSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre"),
  email: z.string().trim().toLowerCase().email("Correo no válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo no válido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});

function safeNext(next: FormDataEntryValue | null) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/";
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDB();
  const { name, email, password } = parsed.data;
  if (await User.exists({ email })) return { error: "Ya existe una cuenta con ese correo" };

  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  await setSessionCookie({ id: user._id.toString(), name: user.name, email: user.email, role: user.role });
  redirect(safeNext(formData.get("next")));
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
    return { error: "Correo o contraseña incorrectos" };
  }

  await setSessionCookie({ id: user._id.toString(), name: user.name, email: user.email, role: user.role });
  const next = safeNext(formData.get("next"));
  redirect(next === "/" && user.role === "admin" ? "/admin" : next);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export type ProfileState = { error?: string; ok?: string } | undefined;

const profileSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(60),
  avatar: z
    .string()
    .trim()
    .default("")
    .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\/\S+$/i.test(v), "La foto debe ser una URL válida"),
  currentPassword: z.string().default(""),
  newPassword: z.string().default(""),
});

/** Cambia nombre, foto de perfil y (opcional) contraseña. */
export async function updateProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await getSession();
  if (!session) redirect("/login");
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, avatar, currentPassword, newPassword } = parsed.data;

  await connectDB();
  const user = await User.findById(session.id);
  if (!user) redirect("/login");

  if (newPassword) {
    if (newPassword.length < 8) return { error: "La nueva contraseña debe tener al menos 8 caracteres" };
    if (!(await bcrypt.compare(currentPassword, user.password))) return { error: "Tu contraseña actual no es correcta" };
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
  }
  user.name = name;
  user.avatar = avatar;
  await user.save();

  // Renovamos la sesión para que el nuevo nombre salga en el menú
  await setSessionCookie({ id: user._id.toString(), name: user.name, email: user.email, role: user.role });
  revalidatePath("/", "layout");
  return { ok: newPassword ? "Perfil y contraseña actualizados" : "Perfil actualizado" };
}

/* ---------- Recuperar contraseña ---------- */

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hora
const resetHits = new Map<string, number[]>();
const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

export type ResetState = { error?: string; ok?: string } | undefined;

async function appUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Paso 1: el usuario escribe su correo y le mandamos un enlace. */
export async function requestPasswordResetAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const parsed = z.string().trim().toLowerCase().email("Correo no válido").safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const email = parsed.data;

  // Máximo 3 solicitudes cada 15 minutos por correo
  const now = Date.now();
  const recent = (resetHits.get(email) ?? []).filter((t) => now - t < 15 * 60 * 1000);
  if (recent.length >= 3) return { error: "Ya pediste varios enlaces. Revisa tu correo o espera unos minutos." };
  resetHits.set(email, [...recent, now]);

  // Siempre respondemos lo mismo, exista o no la cuenta (así nadie puede adivinar correos registrados)
  const done = { ok: "Si hay una cuenta con ese correo, te enviamos un enlace para cambiar tu contraseña. Revisa también tu carpeta de spam." };

  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return done;

  const token = randomBytes(32).toString("hex");
  user.resetTokenHash = hashToken(token);
  user.resetTokenExpires = new Date(now + RESET_TTL_MS);
  await user.save();

  const link = `${await appUrl()}/restablecer?token=${token}`;
  try {
    const { text, html } = resetEmail(user.name, link);
    await sendMail({ to: user.email, subject: "Cambia tu contraseña de La Cabaña", text, html });
  } catch (e) {
    console.error(e);
    return { error: "No pudimos enviar el correo. Intenta de nuevo en un rato." };
  }
  return done;
}

/** Paso 2: con el enlace del correo, el usuario pone su nueva contraseña. */
export async function resetPasswordAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!/^[a-f0-9]{64}$/.test(token)) return { error: "El enlace no es válido. Pide uno nuevo." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres" };
  if (password !== confirm) return { error: "Las contraseñas no coinciden" };

  await connectDB();
  const user = await User.findOne({ resetTokenHash: hashToken(token), resetTokenExpires: { $gt: new Date() } });
  if (!user) return { error: "El enlace ya venció o ya se usó. Pide uno nuevo." };

  user.password = await bcrypt.hash(password, 10);
  user.resetTokenHash = null;
  user.resetTokenExpires = null;
  await user.save();

  await setSessionCookie({ id: user._id.toString(), name: user.name, email: user.email, role: user.role });
  redirect("/cuenta?clave=1");
}
