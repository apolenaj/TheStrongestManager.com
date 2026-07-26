type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: PageIntroProps) {
  return (
    <section className="mx-auto max-w-3xl">
      {eyebrow ? <p className="ui-eyebrow">{eyebrow}</p> : null}
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] text-[var(--color-foreground)] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
        {description}
      </p>
      {children ? <div className="mt-8 sm:mt-10">{children}</div> : null}
    </section>
  );
}
