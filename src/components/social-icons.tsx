type IconProps = { className?: string };

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z" />
    </svg>
  );
}

export function SpotifyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm5 15.9a.7.7 0 0 1-.9.2c-2.6-1.6-5.8-1.9-9.6-1a.7.7 0 1 1-.3-1.3c4.2-1 7.7-.6 10.6 1.2.3.2.4.6.2.9Zm1.3-3a.9.9 0 0 1-1.2.3c-2.9-1.8-7.4-2.3-10.9-1.3a.9.9 0 0 1-.5-1.7c4-1.2 9-.6 12.3 1.5.4.3.6.8.3 1.2Zm.1-3.1C14.9 8.7 9 8.5 5.6 9.5a1 1 0 1 1-.6-2c3.9-1.2 10.4-1 14.5 1.5a1 1 0 0 1-1.1 1.8Z" />
    </svg>
  );
}

export type Socials = { instagram: string; youtube: string; spotify: string };

export function SocialLinks({ socials, className = "" }: { socials: Socials; className?: string }) {
  const links = [
    { href: socials.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: socials.youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: socials.spotify, label: "Spotify", Icon: SpotifyIcon },
  ].filter((l) => l.href);

  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="flex size-11 items-center justify-center rounded-full border border-current/20 transition-colors duration-300 hover:border-latte hover:bg-latte hover:text-ink"
          >
            <Icon className="size-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}
