// Fills an empty database with the initial content and the first admin user.
// Safe to run repeatedly: each part only runs when its table is empty.
import { count } from "drizzle-orm";
import { defaultShopSettings, defaultSiteSettings } from "../lib/settings-schema";
import { hashPassword } from "../lib/password";
import type { Database } from "./index";
import { events, products, settings, users } from "./schema";

const demoProducts: (typeof products.$inferInsert)[] = [
  {
    slug: "camiseta-o-seu-amor-nao-falha",
    name: "Camiseta O Seu Amor Não Falha",
    category: "camisetas",
    price: 8990,
    description:
      "Camiseta oficial do single, com arte inspirada na estética dos anos 80. Algodão penteado 30.1, toque macio e caimento confortável.",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Creme"],
    stock: 40,
    featured: true,
    position: 1,
  },
  {
    slug: "camiseta-logo-vocal-hope",
    name: "Camiseta Logo Vocal Hope",
    category: "camisetas",
    price: 7990,
    description: "O essencial: logo Vocal Hope bordado no peito. Algodão penteado, modelagem unissex.",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Branco", "Bege"],
    stock: 40,
    featured: true,
    position: 2,
  },
  {
    slug: "caneca-hope",
    name: "Caneca Hope",
    category: "canecas",
    price: 4990,
    description: "Caneca de cerâmica 325 ml com acabamento fosco e a frase “Esperança em cada canção”.",
    colors: ["Preto", "Creme"],
    stock: 25,
    featured: true,
    position: 3,
  },
  {
    slug: "bone-vocal-hope",
    name: "Boné Vocal Hope",
    category: "bones",
    price: 6990,
    description: "Boné dad hat em sarja com logo bordado e ajuste em fivela metálica.",
    colors: ["Preto", "Marrom", "Bege"],
    stock: 20,
    featured: true,
    position: 4,
  },
  {
    slug: "ecobag-vocal-hope",
    name: "Ecobag Vocal Hope",
    category: "acessorios",
    price: 3990,
    description: "Ecobag em algodão cru com estampa do grupo. Ideal para o dia a dia.",
    stock: 30,
    position: 5,
  },
  {
    slug: "garrafa-termica-hope",
    name: "Garrafa Térmica Hope",
    category: "acessorios",
    price: 7490,
    description: "Garrafa térmica em inox 500 ml, mantém a temperatura por até 12 horas.",
    colors: ["Preto", "Creme"],
    stock: null,
    position: 6,
  },
];

const demoEvents: (typeof events.$inferInsert)[] = [
  { date: "2026-10-17", time: "19h30", title: "Culto Jovem Especial", venue: "IASD Central de Salvador", city: "Salvador, BA" },
  { date: "2026-11-07", time: "18h00", title: "Noite de Louvor", venue: "IASD Pituba", city: "Salvador, BA" },
  { date: "2026-11-28", time: "20h00", title: "Encontro de Grupos Vocais", venue: "Teatro a confirmar", city: "Feira de Santana, BA" },
  { date: "2026-12-19", time: "19h00", title: "Cantata de Natal", venue: "IASD Brotas", city: "Salvador, BA" },
];

async function isEmpty(db: Database, table: typeof products | typeof events | typeof settings | typeof users) {
  const [row] = await db.select({ n: count() }).from(table);
  return row.n === 0;
}

export async function seed(db: Database, { log = false } = {}) {
  const say = (msg: string) => log && console.log(msg);

  if (await isEmpty(db, settings)) {
    await db.insert(settings).values([
      { key: "site", value: defaultSiteSettings },
      { key: "shop", value: defaultShopSettings },
    ]);
    say("✓ Configurações iniciais criadas");
  }
  if (await isEmpty(db, products)) {
    await db.insert(products).values(demoProducts);
    say("✓ Produtos de exemplo criados");
  }
  if (await isEmpty(db, events)) {
    await db.insert(events).values(demoEvents);
    say("✓ Eventos de exemplo criados");
  }

  if (await isEmpty(db, users)) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const isLocal = !process.env.DATABASE_URL;
    if (email && password) {
      await db.insert(users).values({ name: "Administrador", email: email.toLowerCase(), passwordHash: await hashPassword(password) });
      say(`✓ Usuário administrador criado: ${email}`);
    } else if (isLocal) {
      await db.insert(users).values({
        name: "Administrador",
        email: "admin@vocalhope.local",
        passwordHash: await hashPassword("vocalhope"),
      });
      console.log("[vocal-hope] Admin local criado: admin@vocalhope.local / vocalhope");
    } else {
      console.warn("[vocal-hope] Nenhum usuário admin. Defina ADMIN_EMAIL e ADMIN_PASSWORD e rode npm run db:migrate.");
    }
  }
}
