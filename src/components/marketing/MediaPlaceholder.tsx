import { Camera } from "lucide-react";
import { cn } from "@/design-system/utils/cn";

/**
 * Visual stand-in for professional gym photography.
 * Replace with next/image assets when production shoots are ready.
 */
export function MediaPlaceholder({
  label = "Gym photography placeholder",
  className,
  iconClassName,
}: {
  label?: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-[#16161a]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(232,197,71,0.08), transparent 42%), radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.04), transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative z-[1] flex flex-col items-center gap-3 text-[var(--color-subtle)]">
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
