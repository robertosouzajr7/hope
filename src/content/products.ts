// Produtos da loja. Preços em centavos (ex.: 8990 = R$ 89,90).
// Coloque as fotos em /public/images/loja e preencha `image`.
// TODO(vocal-hope): revisar produtos, preços e fotos.

export type ProductCategory = "camisetas" | "canecas" | "bones" | "acessorios";

export type Product = {
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  image: string | null;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
};

export const categories: { value: ProductCategory; label: string }[] = [
  { value: "camisetas", label: "Camisetas" },
  { value: "canecas", label: "Canecas" },
  { value: "bones", label: "Bonés" },
  { value: "acessorios", label: "Acessórios" },
];

export const products: Product[] = [
  {
    slug: "camiseta-o-seu-amor-nao-falha",
    name: "Camiseta O Seu Amor Não Falha",
    category: "camisetas",
    price: 8990,
    description:
      "Camiseta oficial do single, com arte inspirada na estética dos anos 80. Algodão penteado 30.1, toque macio e caimento confortável.",
    image: null,
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Creme"],
    featured: true,
  },
  {
    slug: "camiseta-logo-vocal-hope",
    name: "Camiseta Logo Vocal Hope",
    category: "camisetas",
    price: 7990,
    description:
      "O essencial: logo Vocal Hope bordado no peito. Algodão penteado, modelagem unissex.",
    image: null,
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Branco", "Bege"],
    featured: true,
  },
  {
    slug: "caneca-hope",
    name: "Caneca Hope",
    category: "canecas",
    price: 4990,
    description:
      "Caneca de cerâmica 325 ml com acabamento fosco e a frase “Esperança em cada canção”.",
    image: null,
    colors: ["Preto", "Creme"],
    featured: true,
  },
  {
    slug: "bone-vocal-hope",
    name: "Boné Vocal Hope",
    category: "bones",
    price: 6990,
    description:
      "Boné dad hat em sarja com logo bordado e ajuste em fivela metálica.",
    image: null,
    colors: ["Preto", "Marrom", "Bege"],
    featured: true,
  },
  {
    slug: "ecobag-vocal-hope",
    name: "Ecobag Vocal Hope",
    category: "acessorios",
    price: 3990,
    description: "Ecobag em algodão cru com estampa do grupo. Ideal para o dia a dia.",
    image: null,
  },
  {
    slug: "garrafa-termica-hope",
    name: "Garrafa Térmica Hope",
    category: "acessorios",
    price: 7490,
    description: "Garrafa térmica em inox 500 ml, mantém a temperatura por até 12 horas.",
    image: null,
    colors: ["Preto", "Creme"],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
