import { getSession } from "@/lib/auth";
import CartView from "@/components/CartView";
import { mpEnabled } from "@/lib/mercadopago";

export const metadata = { title: "Carrito" };

export default async function CarritoPage() {
  const session = await getSession();
  return <CartView userName={session?.name ?? null} onlinePayment={mpEnabled()} />;
}
