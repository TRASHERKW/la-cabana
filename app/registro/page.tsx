import AuthForm from "@/components/AuthForm";
import { registerAction } from "@/app/actions/auth";

export const metadata = { title: "Crear cuenta" };

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthForm mode="registro" action={registerAction} next={next} />;
}
