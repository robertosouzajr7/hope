// Conteúdo editável pelo painel. Os valores abaixo são o ponto de partida
// e também o fallback para qualquer campo ainda não salvo no banco.

export type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
  city: string;
  foundedYear: number;
  email: string;
  // Apenas dígitos, com DDI + DDD.
  whatsapp: string;
  instagram: string;
  youtube: string;
  spotify: string;
  heroImage: string | null;
  aboutImage: string | null;
  aboutTitle: string;
  aboutLead: string;
  aboutText: string;
  singleTitle: string;
  singleYear: number;
  singleDescription: string;
  singleYoutubeId: string;
  singleSpotifyTrackId: string;
  pillars: { title: string; text: string }[];
  influences: string[];
};

export type ShopSettings = {
  shippingEnabled: boolean;
  // Frete fixo em centavos.
  shippingFee: number;
  pickupEnabled: boolean;
  pickupInfo: string;
  notice: string;
};

export const defaultSiteSettings: SiteSettings = {
  name: "Vocal Hope",
  tagline: "Vozes em harmonia, esperança em cada canção.",
  description:
    "Vocal Hope é um grupo vocal de música cristã contemporânea de Salvador, Bahia. Desde 2015 levando arranjos vocais ousados, groove e mensagens de esperança.",
  city: "Salvador, Bahia",
  foundedYear: 2015,
  email: "contato@vocalhope.com.br",
  whatsapp: "5571999999999",
  instagram: "https://www.instagram.com/vocalhope",
  youtube: "https://www.youtube.com/@vocalhope",
  spotify: "https://open.spotify.com/search/vocal%20hope",
  heroImage: null,
  aboutImage: null,
  aboutTitle: "Uma década cantando esperança.",
  aboutLead:
    "O Vocal Hope nasceu em 2015 como um ministério musical da Igreja Adventista do Sétimo Dia e hoje tem sua casa em Salvador, Bahia.",
  aboutText:
    "Ao longo dos anos, o grupo passou por diferentes formações — e cada voz deixou sua marca. Hoje, vivemos uma nova fase: a busca por um trabalho mais autoral e profissional, sem perder a essência que nos trouxe até aqui.\n\nNosso som é gospel contemporâneo, com forte raiz na música cristã adventista e inspiração em grupos como Vocal Livre, Kirk Franklin, Grupo Versos, Novo Tom e Raiz Coral. Somos um grupo independente, construindo nossa própria história na música cristã — uma canção de cada vez.",
  singleTitle: "O Seu Amor Não Falha",
  singleYear: 2024,
  singleDescription:
    "Nosso primeiro projeto autoral. Um single com a estética pop dos anos 80 — sintetizadores, groove e muito swing — feito para conversar com a juventude sem perder a profundidade da mensagem.",
  singleYoutubeId: "",
  singleSpotifyTrackId: "",
  pillars: [
    {
      title: "Vozes em harmonia",
      text: "Arranjos vocais cuidadosamente construídos, onde cada voz tem seu lugar e todas apontam para a mesma mensagem.",
    },
    {
      title: "Arranjos ousados",
      text: "Referências do gospel contemporâneo, do pop e da black music, sem medo de explorar novos caminhos.",
    },
    {
      title: "Groove & swing",
      text: "Música que se move. Levadas envolventes que convidam o público a celebrar junto.",
    },
    {
      title: "Letras que inspiram",
      text: "Canções enraizadas na fé e na tradição da música cristã adventista, falando de esperança real.",
    },
  ],
  influences: ["Vocal Livre", "Kirk Franklin", "Grupo Versos", "Novo Tom", "Raiz Coral"],
};

export const defaultShopSettings: ShopSettings = {
  shippingEnabled: true,
  shippingFee: 2500,
  pickupEnabled: true,
  pickupInfo: "Retirada combinada em Salvador (IASD Central ou nos eventos do grupo).",
  notice: "",
};
