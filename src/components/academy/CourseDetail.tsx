"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  EmptyState,
} from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import {
  completeAssignmentAction,
  completeLessonAction,
  enrollInCourseAction,
  submitQuizAction,
} from "@/services/academy/actions";
import type { CourseLearningView } from "@/services/academy/academy-service";
import { publicVerifyPath } from "@/domain/certificate-verification";

export function CourseDetail({
  view,
  basePath,
  signedIn,
  academy20Enabled = false,
}: {
  view: CourseLearningView;
  basePath: "/academy" | "/app/academy";
  signedIn: boolean;
  academy20Enabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [quizMessage, setQuizMessage] = useState<string | null>(null);
  const { course, enrollment, prerequisites, prerequisitesMet } = view;
  const completed = new Set(enrollment?.completedLessonIds ?? []);
  const completedAssignments = new Set(
    enrollment?.completedAssignmentIds ?? [],
  );
  const passedQuizzes = new Set(enrollment?.passedQuizIds ?? []);

  function run(
    action: () => Promise<{ ok: true } | { ok: false; error: string }>,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <Alert tone="warning" title="Not an accredited certification">
        {view.honesty[0]}
      </Alert>
      {academy20Enabled ? (
        <Alert tone="info" title="Academy 2.0">
          {view.honesty2[0]} Knowledge progress combines lessons, real quiz
          passes, and self-attested assignments — never a fake mastery score.
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Badge variant="accent">{course.audience}</Badge>
        {course.topics.map((t) => (
          <Badge key={t} variant="neutral">
            {t}
          </Badge>
        ))}
        <Badge variant="info">~{course.estimatedHours} hours</Badge>
      </div>

      <p className="max-w-2xl text-base text-[var(--color-muted)]">
        {course.summary}
      </p>

      {academy20Enabled && prerequisites.length > 0 ? (
        <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-medium text-[var(--color-foreground)]">
            Prerequisites
          </h2>
          <ul className="space-y-1 text-sm text-[var(--color-muted)]">
            {prerequisites.map((p) => (
              <li key={p.courseSlug} className="flex flex-wrap items-center gap-2">
                <span>{p.title}</span>
                <Badge variant={p.completed ? "success" : "neutral"}>
                  {p.completed ? "Completed" : "Required"}
                </Badge>
                <ButtonLink
                  href={`${basePath}/${p.courseSlug}`}
                  variant="secondary"
                  size="sm"
                >
                  Open
                </ButtonLink>
              </li>
            ))}
          </ul>
          {!prerequisitesMet ? (
            <p className="text-xs text-[var(--color-muted)]">
              Finish prerequisite Certificates of Completion before enrolling.
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <Alert tone="danger" title="Could not update">
          {error}
        </Alert>
      ) : null}
      {quizMessage ? (
        <Alert tone="info" title="Quiz result">
          {quizMessage}
        </Alert>
      ) : null}

      {!signedIn ? (
        <EmptyState
          title="Sign in to track progress"
          description="You can read the outline here. Enroll from the app Academy to mark lessons complete, take quizzes, and earn a Certificate of Completion."
          action={
            <ButtonLink href="/login" variant="primary">
              Log in
            </ButtonLink>
          }
        />
      ) : !enrollment ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => enrollInCourseAction(fd));
          }}
        >
          <input type="hidden" name="courseSlug" value={course.slug} />
          <Button
            type="submit"
            disabled={pending || (academy20Enabled && !prerequisitesMet)}
          >
            Enroll in course
          </Button>
        </form>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-muted)]">
            Lessons {enrollment.progressPercent}%
            {academy20Enabled
              ? ` · knowledge ${enrollment.knowledgePercent}%`
              : ""}{" "}
            · status {enrollment.status}
          </p>
          {enrollment.certificate ? (
            <Alert tone="success" title="Certificate of Completion">
              {enrollment.certificate.title}. Code{" "}
              <span className="font-mono">{enrollment.certificate.code}</span> —
              not an accredited professional certification.
              {featureFlags.certificateVerification ? (
                <span className="mt-2 block">
                  <ButtonLink
                    href={publicVerifyPath(enrollment.certificate.code)}
                    variant="secondary"
                    size="sm"
                  >
                    Public verify link
                  </ButtonLink>
                </span>
              ) : null}
            </Alert>
          ) : null}
        </div>
      )}

      <div className="space-y-8">
        {course.modules.map((module) => (
          <section
            key={module.id}
            className="space-y-4 border-t border-[var(--color-border)] pt-6"
          >
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
                {module.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {module.summary}
              </p>
            </div>

            <ul className="space-y-4">
              {module.lessons.map((lesson) => {
                const done = completed.has(lesson.id);
                return (
                  <li
                    key={lesson.id}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-[var(--color-foreground)]">
                        {lesson.title}
                      </h3>
                      {done ? <Badge variant="success">Completed</Badge> : null}
                      <span className="text-xs text-[var(--color-muted)]">
                        ~{lesson.estimatedMinutes} min
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      {lesson.summary}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-foreground)]">
                      {lesson.body}
                    </p>

                    {academy20Enabled &&
                    lesson.techniqueExamples &&
                    lesson.techniqueExamples.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                          Technique examples
                        </p>
                        <ul className="space-y-1">
                          {lesson.techniqueExamples.map((ex) => (
                            <li key={ex.exerciseSlug + ex.label}>
                              <ButtonLink
                                href={`/exercises/${ex.exerciseSlug}`}
                                variant="secondary"
                                size="sm"
                              >
                                {ex.label}
                              </ButtonLink>
                              <p className="mt-1 text-xs text-[var(--color-muted)]">
                                {ex.note}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {academy20Enabled &&
                    lesson.practicalAssignments &&
                    lesson.practicalAssignments.length > 0 ? (
                      <div className="mt-4 space-y-3 border-t border-[var(--color-border)] pt-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                          Practical assignments
                        </p>
                        {lesson.practicalAssignments.map((assignment) => {
                          const assignmentDone = completedAssignments.has(
                            assignment.id,
                          );
                          return (
                            <div
                              key={assignment.id}
                              className="rounded-[var(--radius-sm)] bg-[var(--color-surface-elevated)] p-3"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-[var(--color-foreground)]">
                                  {assignment.title}
                                </p>
                                {assignmentDone ? (
                                  <Badge variant="success">Done</Badge>
                                ) : (
                                  <Badge variant="neutral">Self-attested</Badge>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-[var(--color-muted)]">
                                {assignment.instructions}
                              </p>
                              {assignment.evidenceKind ===
                              "technique_upload_suggested" ? (
                                <div className="mt-2">
                                  <ButtonLink
                                    href="/app/technique"
                                    variant="secondary"
                                    size="sm"
                                  >
                                    Open technique
                                  </ButtonLink>
                                </div>
                              ) : null}
                              {assignment.evidenceKind ===
                              "log_session_suggested" ? (
                                <div className="mt-2">
                                  <ButtonLink
                                    href="/app/today"
                                    variant="secondary"
                                    size="sm"
                                  >
                                    Open today
                                  </ButtonLink>
                                </div>
                              ) : null}
                              {enrollment && !assignmentDone ? (
                                <form
                                  className="mt-2"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.currentTarget);
                                    run(() => completeAssignmentAction(fd));
                                  }}
                                >
                                  <input
                                    type="hidden"
                                    name="courseSlug"
                                    value={course.slug}
                                  />
                                  <input
                                    type="hidden"
                                    name="assignmentId"
                                    value={assignment.id}
                                  />
                                  <Button
                                    type="submit"
                                    size="sm"
                                    variant="secondary"
                                    disabled={pending}
                                  >
                                    Mark practiced
                                  </Button>
                                </form>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {enrollment && !done ? (
                      <form
                        className="mt-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          run(() => completeLessonAction(fd));
                        }}
                      >
                        <input
                          type="hidden"
                          name="courseSlug"
                          value={course.slug}
                        />
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="secondary"
                          disabled={pending}
                        >
                          Mark complete
                        </Button>
                      </form>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            {module.quiz ? (
              <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] p-4">
                <div className="flex flex-wrap gap-2">
                  <h3 className="font-medium text-[var(--color-foreground)]">
                    Quiz · {module.quiz.title}
                  </h3>
                  {passedQuizzes.has(module.quiz.id) ? (
                    <Badge variant="success">Passed</Badge>
                  ) : (
                    <Badge variant="neutral">
                      Pass {module.quiz.passPercent}%
                    </Badge>
                  )}
                </div>
                {enrollment ? (
                  <form
                    className="mt-4 space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      setQuizMessage(null);
                      setError(null);
                      startTransition(async () => {
                        const result = await submitQuizAction(fd);
                        if (!result.ok) {
                          setError(result.error);
                          return;
                        }
                        setQuizMessage(
                          result.passed
                            ? `Passed with ${result.scorePercent}%.`
                            : `Scored ${result.scorePercent}% — need ${module.quiz!.passPercent}% to pass.`,
                        );
                        router.refresh();
                      });
                    }}
                  >
                    <input type="hidden" name="courseSlug" value={course.slug} />
                    <input
                      type="hidden"
                      name="quizId"
                      value={module.quiz.id}
                    />
                    {module.quiz.questions.map((question) => (
                      <fieldset key={question.id} className="space-y-2">
                        <legend className="text-sm font-medium text-[var(--color-foreground)]">
                          {question.prompt}
                        </legend>
                        {question.choices.map((choice) => (
                          <label
                            key={choice.id}
                            className="flex items-start gap-2 text-sm text-[var(--color-muted)]"
                          >
                            <input
                              type="radio"
                              name={`answer_${question.id}`}
                              value={choice.id}
                              required
                              className="mt-1"
                            />
                            {choice.label}
                          </label>
                        ))}
                      </fieldset>
                    ))}
                    <Button type="submit" size="sm" disabled={pending}>
                      Submit quiz
                    </Button>
                  </form>
                ) : (
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Enroll to take this quiz.
                  </p>
                )}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <ButtonLink href={basePath} variant="secondary">
        Back to Academy
      </ButtonLink>
    </div>
  );
}
