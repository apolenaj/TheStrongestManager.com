/**
 * Academy 2.0 knowledge progress — derived from real completions only.
 * Never invents a mastery / IQ-style score.
 */

import {
  countCourseLessons,
  countCourseQuizzes,
  listAssignmentIds,
  listLessonIds,
  type AcademyCourse,
  type AcademyLearningPath,
} from "@/domain/academy/types";

export type CourseKnowledgeProgress = {
  courseSlug: string;
  lessonsCompleted: number;
  lessonsTotal: number;
  quizzesPassed: number;
  quizzesTotal: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  /** Weighted from lessons + quizzes + assignments that exist — not a fake grade. */
  knowledgePercent: number;
  courseCompleted: boolean;
};

export type PathKnowledgeProgress = {
  pathSlug: string;
  title: string;
  coursesCompleted: number;
  coursesTotal: number;
  knowledgePercent: number;
  courseProgress: CourseKnowledgeProgress[];
};

export function computeCourseKnowledgeProgress(input: {
  course: AcademyCourse;
  completedLessonIds: string[];
  passedQuizIds: string[];
  completedAssignmentIds: string[];
  courseCompleted: boolean;
}): CourseKnowledgeProgress {
  const { course } = input;
  const lessonsTotal = countCourseLessons(course);
  const quizzesTotal = countCourseQuizzes(course);
  const assignmentsTotal = listAssignmentIds(course).length;
  const lessonSet = new Set(listLessonIds(course));
  const assignmentSet = new Set(listAssignmentIds(course));

  const lessonsCompleted = input.completedLessonIds.filter((id) =>
    lessonSet.has(id),
  ).length;
  const quizzesPassed = input.passedQuizIds.length;
  const assignmentsCompleted = input.completedAssignmentIds.filter((id) =>
    assignmentSet.has(id),
  ).length;

  const unitsTotal = lessonsTotal + quizzesTotal + assignmentsTotal;
  const unitsDone =
    lessonsCompleted +
    Math.min(quizzesPassed, quizzesTotal) +
    assignmentsCompleted;
  const knowledgePercent =
    unitsTotal === 0 ? 0 : Math.round((unitsDone / unitsTotal) * 100);

  return {
    courseSlug: course.slug,
    lessonsCompleted,
    lessonsTotal,
    quizzesPassed: Math.min(quizzesPassed, quizzesTotal),
    quizzesTotal,
    assignmentsCompleted,
    assignmentsTotal,
    knowledgePercent,
    courseCompleted: input.courseCompleted,
  };
}

export function computePathKnowledgeProgress(input: {
  path: AcademyLearningPath;
  courseProgress: CourseKnowledgeProgress[];
}): PathKnowledgeProgress {
  const bySlug = new Map(
    input.courseProgress.map((c) => [c.courseSlug, c]),
  );
  const ordered = input.path.courseSlugs.map((slug) => {
    return (
      bySlug.get(slug) ?? {
        courseSlug: slug,
        lessonsCompleted: 0,
        lessonsTotal: 0,
        quizzesPassed: 0,
        quizzesTotal: 0,
        assignmentsCompleted: 0,
        assignmentsTotal: 0,
        knowledgePercent: 0,
        courseCompleted: false,
      }
    );
  });
  const coursesTotal = input.path.courseSlugs.length;
  const coursesCompleted = ordered.filter((c) => c.courseCompleted).length;
  const knowledgePercent =
    coursesTotal === 0
      ? 0
      : Math.round(
          ordered.reduce((s, c) => s + c.knowledgePercent, 0) / coursesTotal,
        );

  return {
    pathSlug: input.path.slug,
    title: input.path.title,
    coursesCompleted,
    coursesTotal,
    knowledgePercent,
    courseProgress: ordered,
  };
}
