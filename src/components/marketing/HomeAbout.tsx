import {
  Building2,
  CircuitBoard,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { MediaPlaceholder } from "@/components/marketing/MediaPlaceholder";
import { homeCopy } from "@/lib/content/home";

const HIGHLIGHTS = [
  {
    icon: Building2,
    title: "Retail & logistika",
    body: "Řízení masivních operací, kde rozhoduje přesnost, tempo a accountability.",
  },
  {
    icon: CircuitBoard,
    title: "IT & systémy",
    body: "Hluboké zázemí v technologiích — procesy se měří, ladí a škálují.",
  },
  {
    icon: ShieldCheck,
    title: "Psychologie managementu",
    body: "Tlak, lidé a rozhodnutí: disciplína, která drží i když je situace nepohodlná.",
  },
  {
    icon: Scale,
    title: "IPF powerlifting",
    body: "Soutěžní standardy bez kompromisů — stejná logika jako u výsledků v byznysu.",
  },
] as const;

export function HomeAbout() {
  const { about } = homeCopy;

  return (
    <section
      id="about"
      aria-labelledby="home-about-heading"
      className="relative scroll-mt-24 border-b border-white/10 bg-[#070708]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_50%,rgba(234,179,8,0.06),transparent_45%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-yellow-500">
            {about.eyebrow}
          </p>
          <h2
            id="home-about-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-white"
          >
            {about.title}
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <MediaPlaceholder
              label="Profilová fotografie — placeholder"
              className="aspect-[4/5] w-full border border-white/10 transition-all duration-300 hover:border-yellow-500/30"
              iconClassName="h-10 w-10"
            />
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-gray-400">
              Founder · The Strongest Manager
            </p>
          </div>

          <div className="flex flex-col justify-center border border-white/10 bg-[#0c0c0e] p-7 sm:p-10 lg:col-span-7">
            {about.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="mt-5 text-base leading-relaxed text-gray-300 first:mt-0 sm:text-[1.05rem] sm:leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
            <p className="mt-8 border-t border-white/10 pt-6 text-sm font-medium tracking-tight text-white">
              {about.closing}
            </p>
          </div>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className="group border border-white/10 bg-black/40 p-5 transition-all duration-300 hover:border-yellow-500/35 hover:bg-white/[0.03]"
              >
                <Icon
                  className="h-5 w-5 text-yellow-500 transition-transform duration-300 group-hover:scale-110"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {item.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
