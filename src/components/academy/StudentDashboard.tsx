import {
  Alert,
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import type {
  AcademyCourseCard,
  AcademyPathCard,
  StudentEnrollmentView,
} from "@/services/academy/academy-service";
import type { PathKnowledgeProgress } from "@/domain/academy";
import { publicVerifyPath } from "@/domain/certificate-verification";

export function StudentDashboard({
  honesty,
  honesty2,
  catalog,
  enrollments,
  academy20Enabled = false,
  paths = [],
  pathProgress = [],
}: {
  honesty: readonly string[];
  honesty2?: readonly string[];
  catalog: AcademyCourseCard[];
  enrollments: StudentEnrollmentView[];
  academy20Enabled?: boolean;
  paths?: AcademyPathCard[];
  pathProgress?: PathKnowledgeProgress[];
}) {
  const progressByPath = new Map(pathProgress.map((p) => [p.pathSlug, p]));

  return (
    <div className="space-y-10">
      <Alert tone="info" title="Your Academy progress">
        {honesty[0]} Certificates of Completion are learning records — not
        accredited credentials.
      </Alert>
      {academy20Enabled && honesty2?.[0] ? (
        <Alert tone="info" title="Learning paths & knowledge">
          {honesty2[0]} Path percent averages real course knowledge progress —
          lessons, quiz passes, and self-attested assignments.
        </Alert>
      ) : null}

      {academy20Enabled && paths.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
            Learning paths
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {paths.map((path) => {
              const progress = progressByPath.get(path.slug);
              return (
                <li key={path.slug}>
                  <Card>
                    <CardHeader>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="accent">{path.audience}</Badge>
                        <Badge variant="neutral">
                          ~{path.estimatedHours}h · {path.courseSlugs.length}{" "}
                          courses
                        </Badge>
                        {progress ? (
                          <Badge variant="info">
                            {progress.knowledgePercent}% knowledge ·{" "}
                            {progress.coursesCompleted}/{progress.coursesTotal}{" "}
                            done
                          </Badge>
                        ) : null}
                      </div>
                      <CardTitle>{path.title}</CardTitle>
                      <CardDescription>{path.summary}</CardDescription>
                    </CardHeader>
                    <ol className="space-y-1 px-1 pb-3 text-sm text-[var(--color-muted)]">
                      {path.courseSlugs.map((slug, i) => {
                        const course = catalog.find((c) => c.slug === slug);
                        const cp = progress?.courseProgress.find(
                          (c) => c.courseSlug === slug,
                        );
                        return (
                          <li key={slug} className="flex flex-wrap items-center gap-2">
                            <span>
                              {i + 1}. {course?.title ?? slug}
                            </span>
                            {cp ? (
                              <Badge
                                variant={
                                  cp.courseCompleted ? "success" : "neutral"
                                }
                              >
                                {cp.knowledgePercent}%
                              </Badge>
                            ) : null}
                            <ButtonLink
                              href={`/app/academy/${slug}`}
                              variant="secondary"
                              size="sm"
                            >
                              Open
                            </ButtonLink>
                          </li>
                        );
                      })}
                    </ol>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          In progress & completed
        </h2>
        {enrollments.length === 0 ? (
          <EmptyState
            title="No enrollments yet"
            description="Browse the catalog below and enroll in a course to track lessons, quizzes, and completion."
          />
        ) : (
          <ul className="grid gap-4">
            {enrollments.map((row) => (
              <li key={row.courseSlug}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          row.status === "completed" ? "success" : "accent"
                        }
                      >
                        {row.status}
                      </Badge>
                      <Badge variant="neutral">
                        {row.progressPercent}% · {row.lessonsCompleted}/
                        {row.lessonsTotal} lessons
                      </Badge>
                      {academy20Enabled ? (
                        <Badge variant="info">
                          {row.knowledgePercent}% knowledge
                        </Badge>
                      ) : null}
                    </div>
                    <CardTitle>{row.title}</CardTitle>
                    <CardDescription>
                      Enrolled {new Date(row.enrolledAt).toLocaleDateString()}
                      {row.certificate
                        ? ` · ${row.certificate.title}`
                        : ""}
                    </CardDescription>
                  </CardHeader>
                  {row.certificate ? (
                    <div className="space-y-2 px-1 pb-1">
                      <p className="text-xs text-[var(--color-muted)]">
                        Certificate of Completion code{" "}
                        <span className="font-mono">{row.certificate.code}</span>
                      </p>
                      {featureFlags.certificateVerification ? (
                        <ButtonLink
                          href={publicVerifyPath(row.certificate.code)}
                          variant="secondary"
                          size="sm"
                        >
                          Public verify
                        </ButtonLink>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="px-1 pb-1 pt-2">
                    <ButtonLink
                      href={`/app/academy/${row.courseSlug}`}
                      variant="secondary"
                      size="sm"
                    >
                      Continue
                    </ButtonLink>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Catalog
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {catalog.map((course) => (
            <li key={course.slug}>
              <Card>
                <CardHeader>
                  {academy20Enabled &&
                  course.prerequisiteCourseSlugs.length > 0 ? (
                    <Badge variant="neutral">
                      Prereq: {course.prerequisiteCourseSlugs.join(", ")}
                    </Badge>
                  ) : null}
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.summary}</CardDescription>
                </CardHeader>
                <div className="px-1 pb-1">
                  <ButtonLink
                    href={`/app/academy/${course.slug}`}
                    variant="secondary"
                    size="sm"
                  >
                    Open
                  </ButtonLink>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
