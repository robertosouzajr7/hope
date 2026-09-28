# Vocal Hope — site oficial

Portfólio, cartão de visitas e loja do **Vocal Hope**, grupo vocal de gospel contemporâneo de Salvador (BA), fundado em 2015.

Feito com Next.js 16 (App Router), Tailwind CSS 4, Motion (animações) e Lenis (rolagem suave).

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # opcional
npm run dev                  # http://localhost:3000
```

## Páginas

| Rota | Conteúdo |
| --- | --- |
| `/` | Hero, história, single *O Seu Amor Não Falha*, pilares, galeria, agenda, destaques da loja e formulário de agenda |
| `/agenda` | Todas as apresentações (próximas e passadas) |
| `/loja` | Catálogo com filtro por categoria |
| `/loja/[slug]` | Página do produto com tamanho/cor e "Adicionar à sacola" |

## Onde editar o conteúdo

Todo o conteúdo fica em `src/content/`, sem precisar mexer nos componentes:

- **`site.ts`**: nome, textos, e-mail, WhatsApp, redes sociais, influências, fotos do grupo e IDs do YouTube/Spotify do single (preenchidos, os players aparecem no site).
- **`events.ts`**: agenda de shows. Eventos passados saem sozinhos da lista de próximos (a página se atualiza de hora em hora).
- **`products.ts`**: produtos da loja (preço em centavos, tamanhos, cores, foto).

### Fotos

Coloque as imagens em `public/images/` (ex.: `public/images/hero.jpg`, `public/images/loja/caneca.jpg`) e aponte o `src`/`image` correspondente para `/images/...`. Enquanto uma foto não é definida, o site mostra um placeholder na paleta do grupo.

## Loja

A sacola fica salva no navegador. O pedido é finalizado pelo **WhatsApp**: o botão "Finalizar pedido" abre uma conversa com os itens, tamanhos, cores e o total já preenchidos. Frete e pagamento (Pix/cartão) são combinados na conversa. Dá para integrar Mercado Pago ou Stripe depois.

## Formulário de agenda

O formulário usa uma Server Action (`src/app/actions/contact.ts`) com validação e proteção anti-spam (honeypot).

- Com `RESEND_API_KEY` e `CONTACT_EMAIL_TO` configurados, o pedido chega por e-mail via [Resend](https://resend.com).
- Sem essas variáveis, o visitante é direcionado ao WhatsApp com a mensagem já preenchida.

## Variáveis de ambiente

Veja `.env.example`.

## Deploy

Recomendado: [Vercel](https://vercel.com). Importe o repositório, configure as variáveis de ambiente e publique.
