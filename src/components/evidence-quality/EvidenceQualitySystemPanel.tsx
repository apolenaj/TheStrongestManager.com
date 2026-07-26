import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import {
  EVIDENCE_QUALITY_HONESTY,
  listEvidenceQualityCatalog,
  type EvidenceQualityFamily,
} from "@/domain/evidence-quality";
import { EvidenceQualityBadge } from "@/components/evidence-quality/EvidenceQualityBadge";
import { buildEvidenceQualityBadge } from "@/domain/evidence-quality";

export function EvidenceQualitySystemPanel() {
  const catalog = listEvidenceQualityCatalog();
  const research = catalog.filter((c) => c.family === "research_evidence");
  const practice = catalog.filter((c) => c.family === "expert_practice");

  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Evidence Quality System">
        {EVIDENCE_QUALITY_HONESTY[0]} {EVIDENCE_QUALITY_HONESTY[1]}
      </Alert>
      <Alert tone="warning" title="Citations">
        {EVIDENCE_QUALITY_HONESTY[2]} {EVIDENCE_QUALITY_HONESTY[3]}
      </Alert>

      <FamilySection
        family="research_evidence"
        title="Research evidence"
        description="Labels for claims backed (to varying degrees) by research. Strength does not mean universal proof."
        items={research}
      />
      <FamilySection
        family="expert_practice"
        title="Expert practice"
        description="Labels for coaching culture, historical methods, and heuristics — not peer-reviewed certainty."
        items={practice}
      />

      <p className="text-sm text-[var(--color-muted)]">
        See also{" "}
        <Link href="/research" className="text-[var(--color-accent)]">
          Research Library
        </Link>
        ,{" "}
        <Link href="/myths" className="text-[var(--color-accent)]">
          Myth vs Reality
        </Link>
        ,{" "}
        <Link href="/methods" className="text-[var(--color-accent)]">
          Training methods
        </Link>
        ,{" "}
        <Link href="/history/archive" className="text-[var(--color-accent)]">
          Historical archive
        </Link>
        , and exercise evidence sections when citations exist.
      </p>
    </div>
  );
}

function FamilySection({
  family,
  title,
  description,
  items,
}: {
  family: EvidenceQualityFamily;
  title: string;
  description: string;
  items: ReturnType<typeof listEvidenceQualityCatalog>;
}) {
  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          {title}
        </h2>
        <Badge variant="neutral">{family.replaceAll("_", " ")}</Badge>
      </div>
      <p className="text-sm text-[var(--color-muted)]">{description}</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.label}>
            <Card className="h-full">
              <CardHeader>
                <EvidenceQualityBadge
                  model={buildEvidenceQualityBadge({ label: item.label })}
                  showFamily={false}
                />
                <CardTitle className="sr-only">{item.display}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
