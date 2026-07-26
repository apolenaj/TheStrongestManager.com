/**
 * Academy curriculum types (Prompt 38 + Academy 2.0 Prompt 174).
 * Courses issue Certificate of Completion only — never fake accredited certifications.
 */

export const ACADEMY_CERTIFICATE_KIND = "certificate_of_completion" as const;
export type AcademyCertificateKind = typeof ACADEMY_CERTIFICATE_KIND;

export const ACADEMY_HONESTY = [
  "Academy courses issue a Certificate of Completion when you finish — not an accredited professional certification.",
  "We do not claim NASM, CSCS, or other official credentials unless a real accredited program is partnered later.",
  "Content is coaching-practice education inside the Performance OS.",
] as const;

export const ACADEMY_2_HONESTY = [
  "Learning paths order real courses — they do not invent a separate mastery score.",
  "Prerequisites gate enrollment honestly from completed courses — never fake unlocks.",
  "Quizzes use real catalog answer keys and stored attempts only.",
  "Practical assignments are self-attested checklists (or suggested app actions) — not graded rubrics with invented scores.",
  "Technique examples link to existing exercise / technique surfaces — not fabricated video grades.",
  "Knowledge progress is derived from lessons, quizzes, assignments, and path course completion — never a fake overall IQ-style score.",
] as const;

export type AcademyTechniqueExample = {
  exerciseSlug: string;
  label: string;
  note: string;
};

export type AcademyPracticalAssignment = {
  id: string;
  title: string;
  instructions: string;
  /**
   * self_attested — mark practiced (binary).
   * technique_upload_suggested — deepen into /app/technique (still self-attested complete).
   * log_session_suggested — deepen into /app/today.
   */
  evidenceKind:
    | "self_attested"
    | "technique_upload_suggested"
    | "log_session_suggested";
};

export type AcademyLesson = {
  id: string;
  title: string;
  summary: string;
  /** Estimated minutes — honesty, not a guarantee. */
  estimatedMinutes: number;
  body: string;
  /** Academy 2.0 — optional technique deep-links. */
  techniqueExamples?: AcademyTechniqueExample[];
  /** Academy 2.0 — optional practical checklists (no fake grades). */
  practicalAssignments?: AcademyPracticalAssignment[];
};

export type AcademyQuizQuestion = {
  id: string;
  prompt: string;
  choices: Array<{ id: string; label: string }>;
  /** Correct choice id — scored server-side only. */
  correctChoiceId: string;
};

export type AcademyQuiz = {
  id: string;
  title: string;
  passPercent: number;
  questions: AcademyQuizQuestion[];
};

export type AcademyModule = {
  id: string;
  title: string;
  summary: string;
  sortOrder: number;
  lessons: AcademyLesson[];
  quiz: AcademyQuiz | null;
};

export type AcademyCourse = {
  slug: string;
  title: string;
  summary: string;
  audience: "athlete" | "coach" | "both";
  topics: string[];
  estimatedHours: number;
  modules: AcademyModule[];
  isPublished: boolean;
  /** Academy 2.0 — must complete these courses first (Certificate of Completion). */
  prerequisiteCourseSlugs?: string[];
};

export type AcademyLearningPath = {
  slug: string;
  title: string;
  summary: string;
  audience: "athlete" | "coach" | "both";
  /** Ordered course slugs in the path. */
  courseSlugs: string[];
  estimatedHours: number;
};

export function countCourseLessons(course: AcademyCourse): number {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

export function countCourseQuizzes(course: AcademyCourse): number {
  return course.modules.filter((m) => m.quiz != null).length;
}

export function listLessonIds(course: AcademyCourse): string[] {
  return course.modules.flatMap((m) => m.lessons.map((l) => l.id));
}

export function listAssignmentIds(course: AcademyCourse): string[] {
  return course.modules.flatMap((m) =>
    m.lessons.flatMap((l) =>
      (l.practicalAssignments ?? []).map((a) => a.id),
    ),
  );
}

export function findLesson(
  course: AcademyCourse,
  lessonId: string,
): { module: AcademyModule; lesson: AcademyLesson } | null {
  for (const courseModule of course.modules) {
    const lesson = courseModule.lessons.find((l) => l.id === lessonId);
    if (lesson) return { module: courseModule, lesson };
  }
  return null;
}

export function findAssignment(
  course: AcademyCourse,
  assignmentId: string,
): {
  module: AcademyModule;
  lesson: AcademyLesson;
  assignment: AcademyPracticalAssignment;
} | null {
  for (const courseModule of course.modules) {
    for (const lesson of courseModule.lessons) {
      const assignment = (lesson.practicalAssignments ?? []).find(
        (a) => a.id === assignmentId,
      );
      if (assignment) {
        return { module: courseModule, lesson, assignment };
      }
    }
  }
  return null;
}

export function findQuiz(
  course: AcademyCourse,
  quizId: string,
): { module: AcademyModule; quiz: AcademyQuiz } | null {
  for (const courseModule of course.modules) {
    if (courseModule.quiz?.id === quizId) {
      return { module: courseModule, quiz: courseModule.quiz };
    }
  }
  return null;
}

export function scoreQuiz(
  quiz: AcademyQuiz,
  answers: Record<string, string>,
): { scorePercent: number; passed: boolean; correct: number; total: number } {
  const total = quiz.questions.length;
  if (total === 0) {
    return { scorePercent: 0, passed: false, correct: 0, total: 0 };
  }
  let correct = 0;
  for (const q of quiz.questions) {
    if (answers[q.id] === q.correctChoiceId) correct += 1;
  }
  const scorePercent = Math.round((correct / total) * 100);
  return {
    scorePercent,
    passed: scorePercent >= quiz.passPercent,
    correct,
    total,
  };
}

export function completionCertificateTitle(courseTitle: string): string {
  return `Certificate of Completion — ${courseTitle}`;
}

/** Persist practical assignment completion in lesson-progress table. */
export function assignmentProgressKey(assignmentId: string): string {
  return `assignment:${assignmentId}`;
}

export function parseAssignmentProgressKey(lessonId: string): string | null {
  if (!lessonId.startsWith("assignment:")) return null;
  return lessonId.slice("assignment:".length);
}
