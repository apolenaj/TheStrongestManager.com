import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getCourseBySlug, listLessonIds } from "@/domain/academy";
import {
  completeLesson,
  enrollInCourse,
  submitQuizAttempt,
} from "@/services/academy/academy-service";
import {
  publicVerifyPath,
  verifyCertificateByCode,
} from "@/services/certificate-verification";

describe("certificate verification service", () => {
  const email = `cert-verify-${Date.now()}@example.com`;
  let userId = "";
  let code = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        name: "Verify Tester",
        passwordHash: await hashPassword("test-password-123"),
      },
    });
    userId = user.id;

    const course = getCourseBySlug("programming-fundamentals");
    if (!course) throw new Error("missing course");
    await enrollInCourse({ userId, courseSlug: course.slug });
    for (const lessonId of listLessonIds(course)) {
      await completeLesson({ userId, courseSlug: course.slug, lessonId });
    }
    for (const courseModule of course.modules) {
      if (!courseModule.quiz) continue;
      await submitQuizAttempt({
        userId,
        courseSlug: course.slug,
        quizId: courseModule.quiz.id,
        answers: Object.fromEntries(
          courseModule.quiz.questions.map((q) => [q.id, q.correctChoiceId]),
        ),
      });
    }
    const cert = await prisma.academyCompletionCertificate.findFirst({
      where: { enrollment: { userId } },
    });
    code = cert?.code ?? "";
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });

  it("returns unique ID, name, course, date, status — never accredited", async () => {
    expect(code).toMatch(/^AOC-/);
    const result = await verifyCertificateByCode(code);
    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.record.uniqueId).toBe(code);
    expect(result.record.name).toBe("Verify Tester");
    expect(result.record.course).toMatch(/Programming Fundamentals/i);
    expect(result.record.issuedAt).toBeTruthy();
    expect(result.record.status).toBe("valid");
    expect(result.record.isAccredited).toBe(false);
    expect(result.record.accreditationNote).toMatch(/Not an accredited/i);
    expect(publicVerifyPath(code)).toBe(
      `/verify/certificate/${encodeURIComponent(code)}`,
    );
  });

  it("returns not_found for unknown codes", async () => {
    const result = await verifyCertificateByCode("AOC-DOESNOTEXIST99");
    expect(result.found).toBe(false);
    if (result.found) return;
    expect(result.status).toBe("not_found");
    expect(result.isAccredited).toBe(false);
  });
});
