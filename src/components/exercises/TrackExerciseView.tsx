"use client";

import { useEffect } from "react";
import { rememberExerciseView } from "@/lib/exercises/recently-viewed";

/** Records a detail-page view in localStorage for discovery “Recently viewed”. */
export function TrackExerciseView({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  useEffect(() => {
    rememberExerciseView(slug, name);
  }, [slug, name]);

  return null;
}
