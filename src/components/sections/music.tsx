import type { SiteSettings } from "@/lib/settings-schema";
import { Reveal, RevealText } from "../reveal";
import { SpotifyIcon, YoutubeIcon } from "../social-icons";
import { Vinyl } from "./vinyl";

export function Music({ site }: { site: SiteSettings }) {
  const single = {
    title: site.singleTitle,
    year: site.singleYear,
    description: site.singleDescription,
    youtubeId: site.singleYoutubeId,
    spotifyTrackId: site.singleSpotifyTrackId,
  };

  return (
    <section id="musica" className="relative overflow-hidden bg-ink py-28 md:py-40">
      {/* Retro 80s horizon grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-30 [mask-image:linear-gradient(to_top,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #c9ae8c33 1px, transparent 1px), linear-gradient(to bottom, #c9ae8c33 1px, transparent 1px)",
          backgroundSize: "64px 48px",
          transform: "perspective(600px) rotateX(60deg)",
          transformOrigin: "bottom",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 size-[60vw] -translate-x-1/2 rounded-full bg-cocoa/25 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 md:grid-cols-2 md:px-10">
        <div>
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-latte">
              Single · {single.year}
            </p>
          </Reveal>
          <RevealText
            text={single.title}
            className="font-display text-6xl italic leading-[0.95] text-cream md:text-8xl"
          />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-cream/70">{single.description}</p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10 flex flex-wrap gap-3">
            <a
              href={single.spotifyTrackId ? `https://open.spotify.com/track/${single.spotifyTrackId}` : site.spotify}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-cream px-6 py-4 text-sm font-semibold text-ink transition-colors hover:bg-latte"
            >
              <SpotifyIcon className="size-5" /> Ouvir no Spotify
            </a>
            <a
              href={single.youtubeId ? `https://www.youtube.com/watch?v=${single.youtubeId}` : site.youtube}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-cream/30 px-6 py-4 text-sm font-semibold text-cream transition-colors hover:border-cream hover:bg-cream/10"
            >
              <YoutubeIcon className="size-5" /> Assistir no YouTube
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={80}>
          <Vinyl title={single.title} name={site.name} />
        </Reveal>
      </div>

      {(single.youtubeId || single.spotifyTrackId) && (
        <div className="relative mx-auto mt-24 grid max-w-7xl gap-6 px-5 md:grid-cols-[1.6fr_1fr] md:px-10">
          {single.youtubeId && (
            <Reveal className="aspect-video overflow-hidden rounded-2xl bg-charcoal">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${single.youtubeId}`}
                title={`${single.title} — clipe`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="h-full w-full"
              />
            </Reveal>
          )}
          {single.spotifyTrackId && (
            <Reveal delay={0.1} className="min-h-[352px] overflow-hidden rounded-2xl">
              <iframe
                src={`https://open.spotify.com/embed/track/${single.spotifyTrackId}?theme=0`}
                title={`${single.title} no Spotify`}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="h-full min-h-[352px] w-full"
              />
            </Reveal>
          )}
        </div>
      )}
    </section>
  );
}
