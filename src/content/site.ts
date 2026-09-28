// Informações gerais do ministério. Edite aqui para atualizar o site inteiro.
// TODO(vocal-hope): confirmar links das redes sociais, e-mail e WhatsApp.

export const site = {
  name: "Vocal Hope",
  tagline: "Vozes em harmonia, esperança em cada canção.",
  description:
    "Vocal Hope é um grupo vocal de música cristã contemporânea de Salvador, Bahia. Desde 2015 levando arranjos vocais ousados, groove e mensagens de esperança.",
  foundedYear: 2015,
  city: "Salvador, Bahia",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "contato@vocalhope.com.br",
  // Apenas dígitos, com DDI + DDD. Usado no checkout da loja e no contato.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "5571999999999",
  socials: {
    instagram: "https://www.instagram.com/vocalhope",
    youtube: "https://www.youtube.com/@vocalhope",
    spotify: "https://open.spotify.com/search/vocal%20hope",
  },
};

export const nav = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/#musica", label: "Música" },
  { href: "/agenda", label: "Agenda" },
  { href: "/loja", label: "Loja" },
  { href: "/#contato", label: "Contato" },
];

export const single = {
  title: "O Seu Amor Não Falha",
  year: 2024,
  description:
    "Nosso primeiro projeto autoral. Um single com a estética pop dos anos 80 — sintetizadores, groove e muito swing — feito para conversar com a juventude sem perder a profundidade da mensagem.",
  // Cole aqui o ID do vídeo no YouTube (ex.: "dQw4w9WgXcQ") para exibir o player.
  youtubeId: "" as string,
  // Cole aqui o ID da faixa no Spotify para exibir o player.
  spotifyTrackId: "" as string,
};

export const pillars = [
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
];

export const influences = [
  "Vocal Livre",
  "Kirk Franklin",
  "Grupo Versos",
  "Novo Tom",
  "Raiz Coral",
];

// Fotos do grupo. Coloque os arquivos em /public/images e atualize os caminhos.
// Enquanto `src` for null, um placeholder elegante é exibido no lugar.
export const photos: { src: string | null; alt: string }[] = [
  { src: null, alt: "Vocal Hope em apresentação ao vivo" },
  { src: null, alt: "Integrantes do Vocal Hope nos bastidores" },
  { src: null, alt: "Ensaio do Vocal Hope" },
  { src: null, alt: "Vocal Hope em sessão de fotos" },
  { src: null, alt: "Público em apresentação do Vocal Hope" },
];

export const heroPhoto: { src: string | null; alt: string } = {
  src: null,
  alt: "Vocal Hope",
};
