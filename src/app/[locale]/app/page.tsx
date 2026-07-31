import { redirect } from "next/navigation";
import { requireSession } from "@/services/auth/session";
import { getAthleteOnboardingStatus } from "@/services/onboarding/actions";

export default async function AppIndexPage() {
  const session = await requireSession();
  const status = await getAthleteOnboardingStatus(session.user.id);

  if (!status.completed) {
    redirect("/app/onboarding");
  }

  // Central daily experience — intelligence brief + today’s session.
  redirect("/app/today");
}
