import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/design-system/utils/cn";

/**
 * Visual stand-in for professional photography.
 * Pass `src` to render next/image with lazy loading; otherwise show CSS placeholder.
 */
export function MediaPlaceholder({
  label = "Gym photography placeholder",
  className,
  iconClassName,
  src,
  priority = false,
}: {
  label?: string;
  className?: string;
  iconClassName?: string;
  /** Optional production asset path under /public */
  src?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-[var(--color-surface)]", className)}>
        <Image
          src={src}
          alt={label}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-[var(--color-surface)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(183,255,42,0.07), transparent 42%), radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.04), transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative z-[1] flex flex-col items-center gap-3 text-[var(--color-muted)]">
        <Camera
          className={cn("h-8 w-8 stroke-[1.25]", iconClassName)}
          aria-hidden
        />
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.22em]">
          Photo coming soon
        </span>
      </div>
    </div>
  );
}
