import { describe, expect, it } from "vitest";
import {
  ACADEMY_CERTIFICATE_KIND,
  ACADEMY_COURSES,
  ACADEMY_HONESTY,
  ACADEMY_2_HONESTY,
  completionCertificateTitle,
  computeCourseKnowledgeProgress,
  computePathKnowledgeProgress,
  getAcademyPathBySlug,
  getCourseBySlug,
  listAcademyPaths,
  listAssignmentIds,
  listPublishedCourses,
  scoreQuiz,
} from "@/domain/academy";

describe("academy catalog", () => {
  it("publishes the four planned topic courses", () => {
    const slugs = listPublishedCourses().map((c) => c.slug);
    expect(slugs).toEqual(
      expect.arrayContaining([
        "deadlift-specialist",
        "programming-fundamentals",
        "powerlifting-programming",
        "strength-coaching",
      ]),
    );
    expect(ACADEMY_COURSES.length).toBeGreaterThanOrEqual(4);
  });

  it("issues certificate-of-completion wording only", () => {
    expect(ACADEMY_CERTIFICATE_KIND).toBe("certificate_of_completion");
    expect(completionCertificateTitle("Deadlift Specialist")).toBe(
      "Certificate of Completion — Deadlift Specialist",
    );
    expect(ACADEMY_HONESTY.join(" ")).not.toMatch(/accredited certification offered/i);
    expect(ACADEMY_HONESTY.some((h) => /Certificate of Completion/i.test(h))).toBe(
      true,
    );
  });

  it("scores quizzes against catalog keys", () => {
    const course = getCourseBySlug("deadlift-specialist");
    expect(course).not.toBeNull();
    const quiz = course!.modules[0]!.quiz!;
    const wrong = Object.fromEntries(
      quiz.questions.map((q) => [q.id, q.choices.find((c) => c.id !== q.correctChoiceId)!.id]),
    );
    const fail = scoreQuiz(quiz, wrong);
    expect(fail.passed).toBe(false);

    const right = Object.fromEntries(
      quiz.questions.map((q) => [q.id, q.correctChoiceId]),
    );
    const pass = scoreQuiz(quiz, right);
    expect(pass.passed).toBe(true);
    expect(pass.scorePercent).toBe(100);
  });

  it("defines Academy 2.0 paths, prerequisites, and assignments", () => {
    expect(listAcademyPaths().length).toBeGreaterThanOrEqual(3);
    const coach = getAcademyPathBySlug("coach-curriculum");
    expect(coach?.courseSlugs[0]).toBe("strength-coaching");
    expect(ACADEMY_2_HONESTY.some((h) => /self-attested/i.test(h))).toBe(true);

    const pp = getCourseBySlug("powerlifting-programming");
    expect(pp?.prerequisiteCourseSlugs).toContain("programming-fundamentals");

    const dl = getCourseBySlug("deadlift-specialist");
    expect(listAssignmentIds(dl!).length).toBeGreaterThan(0);
    expect(
      dl!.modules.some((m) =>
        m.lessons.some((l) => (l.techniqueExamples?.length ?? 0) > 0),
      ),
    ).toBe(true);
  });

  it("computes knowledge progress from real units only", () => {
    const course = getCourseBySlug("programming-fundamentals")!;
    const progress = computeCourseKnowledgeProgress({
      course,
      completedLessonIds: [],
      passedQuizIds: [],
      completedAssignmentIds: [],
      courseCompleted: false,
    });
    expect(progress.knowledgePercent).toBe(0);

    const path = getAcademyPathBySlug("athlete-strength-foundations")!;
    const pathProgress = computePathKnowledgeProgress({
      path,
      courseProgress: [
        { ...progress, courseSlug: "programming-fundamentals" },
        {
          courseSlug: "deadlift-specialist",
          lessonsCompleted: 0,
          lessonsTotal: 4,
          quizzesPassed: 0,
          quizzesTotal: 2,
          assignmentsCompleted: 0,
          assignmentsTotal: 3,
          knowledgePercent: 0,
          courseCompleted: false,
        },
      ],
    });
    expect(pathProgress.knowledgePercent).toBe(0);
    expect(pathProgress.coursesTotal).toBe(2);
  });
});
