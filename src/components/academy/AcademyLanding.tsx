import {
  Alert,
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { ACADEMY_2_HONESTY, ACADEMY_HONESTY } from "@/domain/academy";
import type {
  AcademyCourseCard,
  AcademyPathCard,
} from "@/services/academy/academy-service";

export function AcademyLanding({
  courses,
  basePath,
  academy20Enabled = false,
  paths = [],
}: {
  courses: AcademyCourseCard[];
  basePath: "/academy" | "/app/academy";
  academy20Enabled?: boolean;
  paths?: AcademyPathCard[];
}) {
  return (
    <div className="space-y-8">
      <Alert tone="info" title="Certificate of Completion">
        {ACADEMY_HONESTY[0]} {ACADEMY_HONESTY[1]}
      </Alert>
      {academy20Enabled ? (
        <Alert tone="info" title="Academy 2.0 learning paths">
          {ACADEMY_2_HONESTY[0]} {ACADEMY_2_HONESTY[1]}
        </Alert>
      ) : null}

      {academy20Enabled && paths.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
            Learning paths
          </h2>
          <ul className="grid gap-5 md:grid-cols-2">
            {paths.map((path) => (
              <li key={path.slug}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="accent">{path.audience}</Badge>
                      <Badge variant="neutral">
                        ~{path.estimatedHours}h · {path.courseSlugs.length}{" "}
                        courses
                      </Badge>
                    </div>
                    <CardTitle>{path.title}</CardTitle>
                    <CardDescription>{path.summary}</CardDescription>
                  </CardHeader>
                  <ol className="space-y-1 px-1 pb-3 text-sm text-[var(--color-muted)]">
                    {path.courseSlugs.map((slug, i) => {
                      const course = courses.find((c) => c.slug === slug);
                      return (
                        <li key={slug}>
                          {i + 1}. {course?.title ?? slug}
                        </li>
                      );
                    })}
                  </ol>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Courses
        </h2>
        <ul className="grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <li key={course.slug}>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="accent">{course.audience}</Badge>
                    <Badge variant="neutral">
                      ~{course.estimatedHours}h · {course.moduleCount} modules
                    </Badge>
                    {academy20Enabled &&
                    course.prerequisiteCourseSlugs.length > 0 ? (
                      <Badge variant="info">Has prerequisites</Badge>
                    ) : null}
                  </div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.summary}</CardDescription>
                </CardHeader>
                <p className="px-1 pb-1 text-xs text-[var(--color-muted)]">
                  {course.lessonCount} lessons
                  {course.quizCount > 0
                    ? ` · ${course.quizCount} quiz${course.quizCount === 1 ? "" : "zes"}`
                    : ""}
                </p>
                <div className="px-1 pb-1 pt-2">
                  <ButtonLink
                    href={`${basePath}/${course.slug}`}
                    variant="secondary"
                    size="sm"
                  >
                    View course
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
