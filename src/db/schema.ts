import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// ── Equipe / autenticação ────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  ...timestamps,
});

export const sessions = pgTable("sessions", {
  // SHA-256 of the cookie token, so a leaked table can't be replayed.
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ── Loja ─────────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  // Preço em centavos.
  price: integer("price").notNull(),
  description: text("description").notNull().default(""),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  colors: jsonb("colors").$type<string[]>().notNull().default([]),
  // null = sem controle de estoque (sob encomenda).
  stock: integer("stock"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  position: integer("position").notNull().default(0),
  ...timestamps,
});

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";
export type DeliveryMethod = "pickup" | "shipping";
export type Address = {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
};

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    // Public, unguessable reference used in URLs and with Mercado Pago.
    code: text("code").notNull().unique(),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    customerName: text("customer_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    delivery: text("delivery").$type<DeliveryMethod>().notNull(),
    address: jsonb("address").$type<Address | null>(),
    notes: text("notes"),
    subtotal: integer("subtotal").notNull(),
    shippingFee: integer("shipping_fee").notNull().default(0),
    total: integer("total").notNull(),
    trackingCode: text("tracking_code"),
    // Set once the order's items have been deducted from stock.
    stockApplied: boolean("stock_applied").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("orders_status_idx").on(t.status), index("orders_created_idx").on(t.createdAt)],
);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size"),
  color: text("color"),
});

export type PaymentStatus =
  | "pending"
  | "in_process"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded";

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: text("provider").$type<"mercadopago" | "manual">().notNull(),
    // Mercado Pago payment id (null for manual payments / not yet paid).
    providerId: text("provider_id").unique(),
    preferenceId: text("preference_id"),
    checkoutUrl: text("checkout_url"),
    status: text("status").$type<PaymentStatus>().notNull().default("pending"),
    method: text("method"),
    amount: integer("amount").notNull(),
    note: text("note"),
    raw: jsonb("raw"),
    ...timestamps,
  },
  (t) => [index("payments_order_idx").on(t.orderId)],
);

// ── Site ─────────────────────────────────────────────────────────────────

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  // AAAA-MM-DD
  date: text("date").notNull(),
  time: text("time"),
  title: text("title").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  link: text("link"),
  published: boolean("published").notNull().default(true),
  ...timestamps,
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  position: integer("position").notNull().default(0),
  ...timestamps,
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  ...timestamps,
});

export type BookingStatus = "new" | "contacted" | "confirmed" | "declined";

export const bookingRequests = pgTable("booking_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  eventType: text("event_type").notNull(),
  date: text("date"),
  city: text("city").notNull(),
  message: text("message"),
  status: text("status").$type<BookingStatus>().notNull().default("new"),
  ...timestamps,
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type User = typeof users.$inferSelect;
