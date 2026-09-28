# Vocal Hope — site oficial, loja e painel

Portfólio, cartão de visitas e loja virtual do **Vocal Hope**, grupo vocal de gospel contemporâneo de Salvador (BA), fundado em 2015, com painel administrativo para a equipe.

Stack: Next.js 16 (App Router, Server Actions), Tailwind CSS 4, Motion, Lenis, Drizzle ORM + Postgres, Mercado Pago.

## Rodando localmente

```bash
npm install
npm run dev          # http://localhost:3000
```

Sem nenhuma configuração, o projeto cria um banco embutido (PGlite) em `.data/`, com produtos e eventos de exemplo e um usuário de teste:

- Painel: http://localhost:3000/admin
- Login: `admin@vocalhope.local` / `vocalhope`

Para começar do zero, apague a pasta `.data/`.

## O que tem

### Site público
| Rota | Conteúdo |
| --- | --- |
| `/` | Hero, história, música em destaque, pilares, galeria, agenda, loja e formulário de agenda |
| `/agenda` | Próximas apresentações e anteriores |
| `/loja`, `/loja/[slug]` | Catálogo com filtros e página de produto |
| `/checkout` | Dados do cliente, entrega (envio ou retirada) e pagamento |
| `/pedido/[código]` | Status do pedido para o cliente |

### Painel administrativo (`/admin`)
- **Visão geral**: vendas do mês, gráfico dos últimos 30 dias, pedidos pendentes, estoque baixo, próximos shows.
- **Vendas**: lista com filtros e busca, detalhe do pedido, mudança de status (pago, enviado, entregue, cancelado), código de rastreio, WhatsApp do cliente, registro de pagamento recebido por fora (Pix, dinheiro…).
- **Pagamentos**: transações do Mercado Pago e manuais, total recebido no mês e por forma de pagamento.
- **Produtos**: cadastro com fotos, preço, tamanhos, cores, estoque, destaque e visibilidade.
- **Configurações da loja**: frete fixo, retirada em Salvador, aviso no topo da loja.
- **Conteúdo do site**: textos, foto de capa e da seção "sobre", música em destaque (links do YouTube/Spotify), pilares, influências, contatos e redes sociais.
- **Agenda de shows**: eventos publicados no site.
- **Pedidos de agenda**: convites enviados pelo formulário do site, com status e resposta rápida pelo WhatsApp.
- **Galeria de fotos**: upload, legenda e ordem das fotos.
- **Usuários**: acessos da equipe e troca de senha.

### Estoque
O estoque baixa quando o pagamento é aprovado (Mercado Pago ou registro manual) e volta quando o pedido é cancelado ou estornado. Deixe o estoque vazio para produtos sob encomenda.

## Pagamentos (Mercado Pago)

1. Crie uma aplicação em https://www.mercadopago.com.br/developers/panel/app e copie o **Access Token** de produção para `MERCADOPAGO_ACCESS_TOKEN`.
2. Em **Webhooks**, cadastre `https://SEU-DOMINIO/api/webhooks/mercadopago` com o evento **Pagamentos** e copie a assinatura secreta para `MERCADOPAGO_WEBHOOK_SECRET`.

O cliente é levado ao Checkout Pro (Pix, cartão, boleto). O status do pedido é atualizado pelo webhook e também quando o cliente volta ao site. Use as credenciais de teste do Mercado Pago para simular compras.

Sem o token configurado, o pedido é registrado normalmente e o cliente combina o pagamento pelo WhatsApp. A equipe marca o pagamento como recebido no painel.

## Deploy (Vercel)

1. Crie um banco Postgres (ex.: Neon ou Supabase) e defina `DATABASE_URL`.
2. Crie um Blob Store na Vercel (Storage → Blob). O `BLOB_READ_WRITE_TOKEN` é adicionado automaticamente.
3. Defina `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e as variáveis do Mercado Pago.
4. Faça o deploy. O `npm run build` aplica as migrações, cria o conteúdo inicial e o primeiro administrador.

Depois do primeiro acesso, troque a senha em **Usuários** e remova `ADMIN_PASSWORD` das variáveis.

## Banco de dados

- Esquema: `src/db/schema.ts`
- Após alterar o esquema: `npm run db:generate` (gera a migração em `drizzle/`) e `npm run db:migrate`
- Explorar os dados: `npm run db:studio`

Todas as variáveis estão descritas em `.env.example`.
