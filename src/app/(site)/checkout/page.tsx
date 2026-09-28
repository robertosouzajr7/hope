import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { getShopSettings } from "@/lib/queries";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const shop = await getShopSettings();

  return (
    <div className="min-h-svh bg-cream text-ink">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <h1 className="font-display text-5xl md:text-6xl">Finalizar compra</h1>
        <CheckoutForm shop={shop} onlinePayment={isMercadoPagoConfigured()} />
      </div>
    </div>
  );
}
