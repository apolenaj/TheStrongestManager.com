import { redirect } from "next/navigation";

/** Friendly apply URL — canonical flow lives at /coaching/premium/apply. */
export default function CoachingApplyAliasPage() {
  redirect("/coaching/premium/apply");
}
