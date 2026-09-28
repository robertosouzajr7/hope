import { Sparkle } from "lucide-react";

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden py-6 ${className}`} aria-hidden>
      <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10 pr-10 font-display text-4xl md:text-6xl">
            <span className={i % 2 ? "text-outline" : "italic"}>{item}</span>
            <Sparkle className="size-6 shrink-0 text-latte" strokeWidth={1.4} />
          </span>
        ))}
      </div>
    </div>
  );
}
