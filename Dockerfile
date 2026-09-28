# Imagem de produção do site Vocal Hope (Next.js standalone).
# Usada pelo EasyPanel: App → Source: GitHub → Build: Dockerfile.

FROM node:22-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/drizzle ./drizzle

# Fotos enviadas pelo painel (e o banco embutido, se DATABASE_URL não for usado).
# Monte um volume persistente neste caminho.
RUN mkdir -p /app/.data && chown nextjs:nodejs /app/.data
VOLUME ["/app/.data"]

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
