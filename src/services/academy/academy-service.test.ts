import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getCourseBySlug, listLessonIds } from "@/domain/academy";
import {
  completeAssignment,
  completeLesson,
  enrollInCourse,
  getStudentDashboard,
  submitQuizAttempt,
} from "@/services/academy/academy-service";

describe("academy progress & certificate of completion", () => {
  const email = `academy-${Date.now()}@example.com`;
  let userId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });

  it("blocks enrollment when prerequisites are incomplete", async () => {
    const blocked = await enrollInCourse({
      userId,
      courseSlug: "powerlifting-programming",
    });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error).toMatch(/prerequisite/i);
    }
  });

  it("enrolls, completes lessons/quizzes, and issues Certificate of Completion only", async () => {
    const course = getCourseBySlug("programming-fundamentals");
    expect(course).not.toBeNull();
    if (!course) return;

    const enroll = await enrollInCourse({
      userId,
      courseSlug: course.slug,
    });
    expect(enroll.ok).toBe(true);

    const assignmentId = course.modules
      .flatMap((m) => m.lessons)
      .flatMap((l) => l.practicalAssignments ?? [])[0]?.id;
    if (assignmentId) {
      const practiced = await completeAssignment({
        userId,
        courseSlug: course.slug,
        assignmentId,
      });
      expect(practiced.ok).toBe(true);
    }

    for (const lessonId of listLessonIds(course)) {
      const done = await completeLesson({
        userId,
        courseSlug: course.slug,
        lessonId,
      });
      expect(done.ok).toBe(true);
    }

    for (const courseModule of course.modules) {
      if (!courseModule.quiz) continue;
      const answers = Object.fromEntries(
        courseModule.quiz.questions.map((q) => [q.id, q.correctChoiceId]),
      );
      const quiz = await submitQuizAttempt({
        userId,
        courseSlug: course.slug,
        quizId: courseModule.quiz.id,
        answers,
      });
      expect(quiz.ok).toBe(true);
      if (!quiz.ok) return;
      expect(quiz.passed).toBe(true);
    }

    const dash = await getStudentDashboard(userId);
    const row = dash.enrollments.find(
      (e) => e.courseSlug === "programming-fundamentals",
    );
    expect(row?.status).toBe("completed");
    expect(row?.certificate).not.toBeNull();
    expect(row?.certificate?.kind).toBe("certificate_of_completion");
    expect(row?.certificate?.title).toMatch(/^Certificate of Completion/);
    expect(row?.certificate?.title).not.toMatch(/accredited/i);
    expect(row?.knowledgePercent).toBeGreaterThan(0);
    expect(dash.pathProgress.some((p) => p.pathSlug === "coach-curriculum")).toBe(
      true,
    );

    const unlocked = await enrollInCourse({
      userId,
      courseSlug: "powerlifting-programming",
    });
    expect(unlocked.ok).toBe(true);
  });
});
