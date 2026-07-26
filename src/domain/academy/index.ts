import { ACADEMY_COURSES } from "@/domain/academy/catalog";
import type { AcademyCourse } from "@/domain/academy/types";
import {
  allAcademyPathSlugs,
  getAcademyPathBySlug,
  listAcademyPaths,
} from "@/domain/academy/paths";

export function listPublishedCourses(): AcademyCourse[] {
  return ACADEMY_COURSES.filter((c) => c.isPublished);
}

export function getCourseBySlug(slug: string): AcademyCourse | null {
  return ACADEMY_COURSES.find((c) => c.slug === slug && c.isPublished) ?? null;
}

export function allCourseSlugs(): string[] {
  return listPublishedCourses().map((c) => c.slug);
}

export {
  ACADEMY_2_HONESTY,
  ACADEMY_CERTIFICATE_KIND,
  ACADEMY_HONESTY,
  assignmentProgressKey,
  completionCertificateTitle,
  countCourseLessons,
  countCourseQuizzes,
  findAssignment,
  findLesson,
  findQuiz,
  listAssignmentIds,
  listLessonIds,
  parseAssignmentProgressKey,
  scoreQuiz,
} from "@/domain/academy/types";
export type {
  AcademyCertificateKind,
  AcademyCourse,
  AcademyLearningPath,
  AcademyLesson,
  AcademyModule,
  AcademyPracticalAssignment,
  AcademyQuiz,
  AcademyQuizQuestion,
  AcademyTechniqueExample,
} from "@/domain/academy/types";
export {
  computeCourseKnowledgeProgress,
  computePathKnowledgeProgress,
} from "@/domain/academy/knowledge-progress";
export type {
  CourseKnowledgeProgress,
  PathKnowledgeProgress,
} from "@/domain/academy/knowledge-progress";
export {
  ACADEMY_LEARNING_PATHS,
  allAcademyPathSlugs,
  getAcademyPathBySlug,
  listAcademyPaths,
} from "@/domain/academy/paths";
export { ACADEMY_COURSES } from "@/domain/academy/catalog";
