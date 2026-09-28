import { AdminForm } from "@/components/admin/form";
import { Checkbox, Field, PageHeader } from "@/components/admin/ui";
import { centsToInput } from "@/lib/money";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { getShopSettings } from "@/lib/queries";
import { saveShopSettings } from "../settings-actions";

export const metadata = { title: "Configurações da loja" };

export default async function ShopSettingsPage() {
  const shop = await getShopSettings();

  return (
    <>
      <PageHeader title="Configurações da loja" description="Entrega, frete e avisos da loja virtual." />
      <AdminForm action={saveShopSettings}>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="admin-card space-y-4">
            <h2 className="font-display text-xl">Entrega</h2>
            <Checkbox name="shippingEnabled" label="Enviar pelos Correios / transportadora" defaultChecked={shop.shippingEnabled} />
            <Field label="Frete fixo (R$)" hint="Use 0 para frete grátis.">
              <input name="shippingFee" inputMode="decimal" defaultValue={centsToInput(shop.shippingFee)} className="admin-input" />
            </Field>
            <Checkbox name="pickupEnabled" label="Permitir retirada em Salvador" defaultChecked={shop.pickupEnabled} />
            <Field label="Informações de retirada">
              <textarea name="pickupInfo" rows={2} defaultValue={shop.pickupInfo} className="admin-input" />
            </Field>
          </section>
          <section className="admin-card space-y-4">
            <h2 className="font-display text-xl">Aviso na loja</h2>
            <Field label="Mensagem no topo da loja" hint="Ex.: promoções, prazo de produção. Deixe vazio para esconder.">
              <textarea name="notice" rows={3} defaultValue={shop.notice} className="admin-input" />
            </Field>
            <div className="rounded-xl bg-cream/70 p-4 text-sm">
              <p className="font-medium">Pagamento online</p>
              <p className="mt-1 text-ink/65">
                {isMercadoPagoConfigured()
                  ? "Mercado Pago conectado: clientes pagam com Pix, cartão ou boleto e o status é atualizado automaticamente."
                  : "Mercado Pago ainda não conectado. Configure MERCADOPAGO_ACCESS_TOKEN no servidor para receber pagamentos online. Até lá, o cliente combina o pagamento pelo WhatsApp."}
              </p>
            </div>
          </section>
        </div>
      </AdminForm>
    </>
  );
}
