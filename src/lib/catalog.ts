import type { OrderStatus, PaymentStatus, BookingStatus } from "@/db/schema";

export const categories = [
  { value: "camisetas", label: "Camisetas" },
  { value: "canecas", label: "Canecas" },
  { value: "bones", label: "Bonés" },
  { value: "acessorios", label: "Acessórios" },
] as const;

export type ProductCategory = (typeof categories)[number]["value"];

export function categoryLabel(value: string) {
  return categories.find((c) => c.value === value)?.label ?? value;
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pendente",
  in_process: "Em análise",
  approved: "Aprovado",
  rejected: "Recusado",
  cancelled: "Cancelado",
  refunded: "Estornado",
};

export const bookingStatusLabels: Record<BookingStatus, string> = {
  new: "Novo",
  contacted: "Em contato",
  confirmed: "Confirmado",
  declined: "Recusado",
};

export const paymentMethodLabels: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  ticket: "Boleto",
  bank_transfer: "Transferência / Pix",
  account_money: "Saldo Mercado Pago",
  manual: "Manual",
};
