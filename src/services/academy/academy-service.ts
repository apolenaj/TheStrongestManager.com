import {
  ACADEMY_2_HONESTY,
  ACADEMY_CERTIFICATE_KIND,
  ACADEMY_HONESTY,
  ACADEMY_COURSES,
  allAcademyPathSlugs,
  assignmentProgressKey,
  completionCertificateTitle,
  computeCourseKnowledgeProgress,
  computePathKnowledgeProgress,
  countCourseLessons,
  findAssignment,
  findLesson,
  findQuiz,
  getAcademyPathBySlug,
  getCourseBySlug,
  listAcademyPaths,
  listAssignmentIds,
  listLessonIds,
  listPublishedCourses,
  parseAssignmentProgressKey,
  scoreQuiz,
  type AcademyCourse,
  type AcademyLearningPath,
  type CourseKnowledgeProgress,
  type PathKnowledgeProgress,
} from "@/domain/academy";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

function certificateCode(): string {
  return `AOC-${randomBytes(6).toString("hex").toUpperCase()}`;
}

function splitProgressIds(lessonIds: string[]): {
  completedLessonIds: string[];
  completedAssignmentIds: string[];
} {
  const completedLessonIds: string[] = [];
  const completedAssignmentIds: string[] = [];
  for (const id of lessonIds) {
    const assignmentId = parseAssignmentProgressKey(id);
    if (assignmentId) completedAssignmentIds.push(assignmentId);
    else completedLessonIds.push(id);
  }
  return { completedLessonIds, completedAssignmentIds };
}

export type AcademyCourseCard = {
  slug: string;
  title: string;
  summary: string;
  audience: AcademyCourse["audience"];
  topics: string[];
  estimatedHours: number;
  moduleCount: number;
  lessonCount: number;
  quizCount: number;
  prerequisiteCourseSlugs: string[];
};

export type AcademyPathCard = {
  slug: string;
  title: string;
  summary: string;
  audience: AcademyLearningPath["audience"];
  courseSlugs: string[];
  estimatedHours: number;
};

export type StudentEnrollmentView = {
  courseSlug: string;
  title: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  lessonsCompleted: number;
  lessonsTotal: number;
  progressPercent: number;
  knowledgePercent: number;
  certificate: {
    title: string;
    kind: string;
    code: string;
    issuedAt: string;
  } | null;
};

export type PrerequisiteStatus = {
  courseSlug: string;
  title: string;
  completed: boolean;
};

export type CourseLearningView = {
  course: AcademyCourse;
  honesty: readonly string[];
  honesty2: readonly string[];
  prerequisites: PrerequisiteStatus[];
  prerequisitesMet: boolean;
  enrollment: {
    id: string;
    status: string;
    completedLessonIds: string[];
    completedAssignmentIds: string[];
    progressPercent: number;
    knowledgePercent: number;
    passedQuizIds: string[];
    certificate: {
      title: string;
      kind: string;
      code: string;
      issuedAt: string;
    } | null;
  } | null;
};

export function toCourseCard(course: AcademyCourse): AcademyCourseCard {
  return {
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    audience: course.audience,
    topics: course.topics,
    estimatedHours: course.estimatedHours,
    moduleCount: course.modules.length,
    lessonCount: countCourseLessons(course),
    quizCount: course.modules.filter((m) => m.quiz).length,
    prerequisiteCourseSlugs: course.prerequisiteCourseSlugs ?? [],
  };
}

export function toPathCard(path: AcademyLearningPath): AcademyPathCard {
  return {
    slug: path.slug,
    title: path.title,
    summary: path.summary,
    audience: path.audience,
    courseSlugs: [...path.courseSlugs],
    estimatedHours: path.estimatedHours,
  };
}

export function listAcademyCatalog(): AcademyCourseCard[] {
  return listPublishedCourses().map(toCourseCard);
}

export function listAcademyPathCatalog(): AcademyPathCard[] {
  return listAcademyPaths().map(toPathCard);
}

async function completedCourseSlugs(userId: string): Promise<Set<string>> {
  const rows = await prisma.academyEnrollment.findMany({
    where: { userId, status: "completed" },
    select: { courseSlug: true },
  });
  return new Set(rows.map((r) => r.courseSlug));
}

async function prerequisiteStatuses(
  userId: string | null,
  course: AcademyCourse,
): Promise<{ prerequisites: PrerequisiteStatus[]; prerequisitesMet: boolean }> {
  const slugs = course.prerequisiteCourseSlugs ?? [];
  if (slugs.length === 0) {
    return { prerequisites: [], prerequisitesMet: true };
  }
  const done = userId ? await completedCourseSlugs(userId) : new Set<string>();
  const prerequisites = slugs.map((slug) => {
    const prereq = getCourseBySlug(slug);
    return {
      courseSlug: slug,
      title: prereq?.title ?? slug,
      completed: done.has(slug),
    };
  });
  return {
    prerequisites,
    prerequisitesMet: prerequisites.every((p) => p.completed),
  };
}

export async function getStudentDashboard(
  userId: string,
): Promise<{
  honesty: readonly string[];
  honesty2: readonly string[];
  catalog: AcademyCourseCard[];
  paths: AcademyPathCard[];
  pathProgress: PathKnowledgeProgress[];
  enrollments: StudentEnrollmentView[];
}> {
  const catalog = listAcademyCatalog();
  const paths = listAcademyPathCatalog();
  const rows = await prisma.academyEnrollment.findMany({
    where: { userId, status: { in: ["active", "completed"] } },
    include: {
      lessonProgress: { select: { lessonId: true } },
      quizAttempts: {
        where: { passed: true },
        select: { quizId: true },
      },
      certificate: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  const courseProgressBySlug = new Map<string, CourseKnowledgeProgress>();

  const enrollments: StudentEnrollmentView[] = rows.map((row) => {
    const course = getCourseBySlug(row.courseSlug);
    const { completedLessonIds, completedAssignmentIds } = splitProgressIds(
      row.lessonProgress.map((p) => p.lessonId),
    );
    const lessonsTotal = course ? listLessonIds(course).length : 0;
    const lessonsCompleted = completedLessonIds.length;
    const progressPercent =
      lessonsTotal > 0
        ? Math.min(100, Math.round((lessonsCompleted / lessonsTotal) * 100))
        : 0;
    const passedQuizIds = [
      ...new Set(row.quizAttempts.map((a) => a.quizId)),
    ];
    const knowledge = course
      ? computeCourseKnowledgeProgress({
          course,
          completedLessonIds,
          passedQuizIds,
          completedAssignmentIds,
          courseCompleted: row.status === "completed",
        })
      : null;
    if (knowledge) courseProgressBySlug.set(row.courseSlug, knowledge);

    return {
      courseSlug: row.courseSlug,
      title: course?.title ?? row.courseSlug,
      status: row.status,
      enrolledAt: row.enrolledAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
      lessonsCompleted,
      lessonsTotal,
      progressPercent,
      knowledgePercent: knowledge?.knowledgePercent ?? progressPercent,
      certificate: row.certificate
        ? {
            title: row.certificate.title,
            kind: row.certificate.certificateKind,
            code: row.certificate.code,
            issuedAt: row.certificate.issuedAt.toISOString(),
          }
        : null,
    };
  });

  const pathProgress = listAcademyPaths().map((path) => {
    const courseProgress = path.courseSlugs.map((slug) => {
      const existing = courseProgressBySlug.get(slug);
      if (existing) return existing;
      const course = getCourseBySlug(slug);
      if (!course) {
        return {
          courseSlug: slug,
          lessonsCompleted: 0,
          lessonsTotal: 0,
          quizzesPassed: 0,
          quizzesTotal: 0,
          assignmentsCompleted: 0,
          assignmentsTotal: 0,
          knowledgePercent: 0,
          courseCompleted: false,
        };
      }
      return computeCourseKnowledgeProgress({
        course,
        completedLessonIds: [],
        passedQuizIds: [],
        completedAssignmentIds: [],
        courseCompleted: false,
      });
    });
    return computePathKnowledgeProgress({ path, courseProgress });
  });

  return {
    honesty: ACADEMY_HONESTY,
    honesty2: ACADEMY_2_HONESTY,
    catalog,
    paths,
    pathProgress,
    enrollments,
  };
}

export async function getCourseLearningView(input: {
  userId: string | null;
  courseSlug: string;
}): Promise<CourseLearningView | null> {
  const course = getCourseBySlug(input.courseSlug);
  if (!course) return null;

  const { prerequisites, prerequisitesMet } = await prerequisiteStatuses(
    input.userId,
    course,
  );

  if (!input.userId) {
    return {
      course,
      honesty: ACADEMY_HONESTY,
      honesty2: ACADEMY_2_HONESTY,
      prerequisites,
      prerequisitesMet,
      enrollment: null,
    };
  }

  const enrollment = await prisma.academyEnrollment.findUnique({
    where: {
      userId_courseSlug: {
        userId: input.userId,
        courseSlug: input.courseSlug,
      },
    },
    include: {
      lessonProgress: { select: { lessonId: true } },
      quizAttempts: {
        where: { passed: true },
        select: { quizId: true },
      },
      certificate: true,
    },
  });

  if (!enrollment || enrollment.status === "withdrawn") {
    return {
      course,
      honesty: ACADEMY_HONESTY,
      honesty2: ACADEMY_2_HONESTY,
      prerequisites,
      prerequisitesMet,
      enrollment: null,
    };
  }

  const { completedLessonIds, completedAssignmentIds } = splitProgressIds(
    enrollment.lessonProgress.map((p) => p.lessonId),
  );
  const lessonsTotal = listLessonIds(course).length;
  const progressPercent =
    lessonsTotal > 0
      ? Math.min(
          100,
          Math.round((completedLessonIds.length / lessonsTotal) * 100),
        )
      : 0;
  const passedQuizIds = [
    ...new Set(enrollment.quizAttempts.map((a) => a.quizId)),
  ];
  const knowledge = computeCourseKnowledgeProgress({
    course,
    completedLessonIds,
    passedQuizIds,
    completedAssignmentIds,
    courseCompleted: enrollment.status === "completed",
  });

  return {
    course,
    honesty: ACADEMY_HONESTY,
    honesty2: ACADEMY_2_HONESTY,
    prerequisites,
    prerequisitesMet,
    enrollment: {
      id: enrollment.id,
      status: enrollment.status,
      completedLessonIds,
      completedAssignmentIds,
      progressPercent,
      knowledgePercent: knowledge.knowledgePercent,
      passedQuizIds,
      certificate: enrollment.certificate
        ? {
            title: enrollment.certificate.title,
            kind: enrollment.certificate.certificateKind,
            code: enrollment.certificate.code,
            issuedAt: enrollment.certificate.issuedAt.toISOString(),
          }
        : null,
    },
  };
}

export async function enrollInCourse(input: {
  userId: string;
  courseSlug: string;
}): Promise<{ ok: true; enrollmentId: string } | { ok: false; error: string }> {
  const course = getCourseBySlug(input.courseSlug);
  if (!course) return { ok: false, error: "Course not found." };

  const { prerequisitesMet, prerequisites } = await prerequisiteStatuses(
    input.userId,
    course,
  );
  if (!prerequisitesMet) {
    const missing = prerequisites
      .filter((p) => !p.completed)
      .map((p) => p.title)
      .join(", ");
    return {
      ok: false,
      error: `Complete prerequisite courses first: ${missing}.`,
    };
  }

  const existing = await prisma.academyEnrollment.findUnique({
    where: {
      userId_courseSlug: {
        userId: input.userId,
        courseSlug: input.courseSlug,
      },
    },
  });

  if (existing?.status === "active" || existing?.status === "completed") {
    return { ok: true, enrollmentId: existing.id };
  }

  if (existing?.status === "withdrawn") {
    const row = await prisma.academyEnrollment.update({
      where: { id: existing.id },
      data: {
        status: "active",
        enrolledAt: new Date(),
        withdrawnAt: null,
        completedAt: null,
      },
    });
    return { ok: true, enrollmentId: row.id };
  }

  const row = await prisma.academyEnrollment.create({
    data: {
      userId: input.userId,
      courseSlug: input.courseSlug,
      status: "active",
    },
  });
  return { ok: true, enrollmentId: row.id };
}

export async function completeLesson(input: {
  userId: string;
  courseSlug: string;
  lessonId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const course = getCourseBySlug(input.courseSlug);
  if (!course) return { ok: false, error: "Course not found." };
  if (!findLesson(course, input.lessonId)) {
    return { ok: false, error: "Lesson not found." };
  }

  const enrollment = await prisma.academyEnrollment.findUnique({
    where: {
      userId_courseSlug: {
        userId: input.userId,
        courseSlug: input.courseSlug,
      },
    },
  });
  if (!enrollment || enrollment.status === "withdrawn") {
    return { ok: false, error: "Enroll in the course first." };
  }

  await prisma.academyLessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId: input.lessonId,
      },
    },
    create: {
      enrollmentId: enrollment.id,
      lessonId: input.lessonId,
    },
    update: { completedAt: new Date() },
  });

  await maybeIssueCompletion({
    enrollmentId: enrollment.id,
    userId: input.userId,
    course,
  });

  return { ok: true };
}

export async function completeAssignment(input: {
  userId: string;
  courseSlug: string;
  assignmentId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const course = getCourseBySlug(input.courseSlug);
  if (!course) return { ok: false, error: "Course not found." };
  if (!findAssignment(course, input.assignmentId)) {
    return { ok: false, error: "Assignment not found." };
  }

  const enrollment = await prisma.academyEnrollment.findUnique({
    where: {
      userId_courseSlug: {
        userId: input.userId,
        courseSlug: input.courseSlug,
      },
    },
  });
  if (!enrollment || enrollment.status === "withdrawn") {
    return { ok: false, error: "Enroll in the course first." };
  }

  const progressKey = assignmentProgressKey(input.assignmentId);
  await prisma.academyLessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId: progressKey,
      },
    },
    create: {
      enrollmentId: enrollment.id,
      lessonId: progressKey,
    },
    update: { completedAt: new Date() },
  });

  // Assignments are self-attested practice — they do not gate Certificate of Completion.
  return { ok: true };
}

export async function submitQuizAttempt(input: {
  userId: string;
  courseSlug: string;
  quizId: string;
  answers: Record<string, string>;
}): Promise<
  | {
      ok: true;
      scorePercent: number;
      passed: boolean;
      certificateIssued: boolean;
    }
  | { ok: false; error: string }
> {
  const course = getCourseBySlug(input.courseSlug);
  if (!course) return { ok: false, error: "Course not found." };
  const found = findQuiz(course, input.quizId);
  if (!found) return { ok: false, error: "Quiz not found." };

  const enrollment = await prisma.academyEnrollment.findUnique({
    where: {
      userId_courseSlug: {
        userId: input.userId,
        courseSlug: input.courseSlug,
      },
    },
  });
  if (!enrollment || enrollment.status === "withdrawn") {
    return { ok: false, error: "Enroll in the course first." };
  }

  const result = scoreQuiz(found.quiz, input.answers);
  await prisma.academyQuizAttempt.create({
    data: {
      enrollmentId: enrollment.id,
      quizId: input.quizId,
      scorePercent: result.scorePercent,
      passed: result.passed,
      answersJson: JSON.stringify(input.answers),
    },
  });

  const certificateIssued = result.passed
    ? await maybeIssueCompletion({
        enrollmentId: enrollment.id,
        userId: input.userId,
        course,
      })
    : false;

  return {
    ok: true,
    scorePercent: result.scorePercent,
    passed: result.passed,
    certificateIssued,
  };
}

/**
 * Completion requires all lessons done + all module quizzes passed (if any).
 * Practical assignments do not gate certificates.
 * Issues Certificate of Completion only — never an accredited cert.
 */
async function maybeIssueCompletion(input: {
  enrollmentId: string;
  userId: string;
  course: AcademyCourse;
}): Promise<boolean> {
  const enrollment = await prisma.academyEnrollment.findUnique({
    where: { id: input.enrollmentId },
    include: {
      lessonProgress: true,
      quizAttempts: { where: { passed: true } },
      certificate: true,
    },
  });
  if (!enrollment || enrollment.certificate) return false;

  const { completedLessonIds } = splitProgressIds(
    enrollment.lessonProgress.map((p) => p.lessonId),
  );
  const completed = new Set(completedLessonIds);
  const lessonIds = listLessonIds(input.course);
  if (!lessonIds.every((id) => completed.has(id))) return false;

  const requiredQuizzes = input.course.modules
    .map((m) => m.quiz?.id)
    .filter((id): id is string => Boolean(id));
  const passedQuizzes = new Set(enrollment.quizAttempts.map((a) => a.quizId));
  if (!requiredQuizzes.every((id) => passedQuizzes.has(id))) return false;

  await prisma.$transaction(async (tx) => {
    await tx.academyEnrollment.update({
      where: { id: enrollment.id },
      data: { status: "completed", completedAt: new Date() },
    });
    await tx.academyCompletionCertificate.create({
      data: {
        enrollmentId: enrollment.id,
        certificateKind: ACADEMY_CERTIFICATE_KIND,
        title: completionCertificateTitle(input.course.title),
        code: certificateCode(),
      },
    });
  });

  return true;
}

export function getAcademy20AdminSnapshot(): {
  honesty2: readonly string[];
  paths: AcademyPathCard[];
  coursesWithPrereqs: Array<{
    slug: string;
    title: string;
    prerequisites: string[];
    assignmentCount: number;
    techniqueExampleCount: number;
  }>;
  pathSlugs: string[];
} {
  return {
    honesty2: ACADEMY_2_HONESTY,
    paths: listAcademyPathCatalog(),
    pathSlugs: allAcademyPathSlugs(),
    coursesWithPrereqs: listPublishedCourses().map((c) => ({
      slug: c.slug,
      title: c.title,
      prerequisites: c.prerequisiteCourseSlugs ?? [],
      assignmentCount: listAssignmentIds(c).length,
      techniqueExampleCount: c.modules.reduce(
        (n, m) =>
          n +
          m.lessons.reduce(
            (ln, l) => ln + (l.techniqueExamples?.length ?? 0),
            0,
          ),
        0,
      ),
    })),
  };
}

export { getAcademyPathBySlug, ACADEMY_COURSES };
