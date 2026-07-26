"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  completeAssignment,
  completeLesson,
  enrollInCourse,
  submitQuizAttempt,
} from "@/services/academy/academy-service";

function revalidateAcademy(courseSlug: string) {
  revalidatePath("/app/academy");
  revalidatePath(`/app/academy/${courseSlug}`);
  revalidatePath(`/academy/${courseSlug}`);
}

export async function enrollInCourseAction(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const courseSlug = String(formData.get("courseSlug") ?? "");
  if (!courseSlug) return { ok: false, error: "Missing course." };
  const result = await enrollInCourse({
    userId: session.user.id,
    courseSlug,
  });
  if (result.ok) revalidateAcademy(courseSlug);
  return result.ok ? { ok: true } : result;
}

export async function completeLessonAction(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  if (!courseSlug || !lessonId) {
    return { ok: false, error: "Missing lesson." };
  }
  const result = await completeLesson({
    userId: session.user.id,
    courseSlug,
    lessonId,
  });
  if (result.ok) revalidateAcademy(courseSlug);
  return result;
}

export async function completeAssignmentAction(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (!courseSlug || !assignmentId) {
    return { ok: false, error: "Missing assignment." };
  }
  const result = await completeAssignment({
    userId: session.user.id,
    courseSlug,
    assignmentId,
  });
  if (result.ok) revalidateAcademy(courseSlug);
  return result;
}

export async function submitQuizAction(formData: FormData): Promise<
  | { ok: true; scorePercent: number; passed: boolean }
  | { ok: false; error: string }
> {
  const session = await requireSession();
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const quizId = String(formData.get("quizId") ?? "");
  if (!courseSlug || !quizId) {
    return { ok: false, error: "Missing quiz." };
  }

  const answers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("answer_")) {
      answers[key.replace(/^answer_/, "")] = String(value);
    }
  }

  const result = await submitQuizAttempt({
    userId: session.user.id,
    courseSlug,
    quizId,
    answers,
  });
  if (!result.ok) return result;
  revalidateAcademy(courseSlug);
  return {
    ok: true,
    scorePercent: result.scorePercent,
    passed: result.passed,
  };
}
