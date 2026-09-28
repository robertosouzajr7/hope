import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-8 bg-ink px-5 text-center">
      <p className="font-display text-[30vw] italic leading-none text-cream/10 md:text-[16rem]">404</p>
      <h1 className="-mt-16 font-display text-4xl text-cream md:-mt-24 md:text-5xl">
        Essa nota saiu do tom.
      </h1>
      <p className="max-w-sm text-cream/60">A página que você procura não existe ou foi movida.</p>
      <Link
        href="/"
        className="rounded-full bg-cream px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-latte"
      >
        Voltar ao início
      </Link>
    </section>
  );
}
