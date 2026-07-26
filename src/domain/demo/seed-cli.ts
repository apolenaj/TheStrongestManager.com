/**
 * CLI: seed the isolated Demo Mode athlete.
 * Usage: npm run db:seed:demo
 *
 * Never run against production with a weak password.
 * Password: DEMO_ATHLETE_PASSWORD env or default local-only string.
 */
import { seedDemoAthlete } from "@/domain/demo/seed-demo-athlete";

async function main() {
  const result = await seedDemoAthlete();
  console.info("[demo-seed] Demo athlete ready", {
    email: result.email,
    userId: result.userId,
    athleteProfileId: result.athleteProfileId,
    created: result.created,
    note: "isDemoAccount=true — production signups never receive this flag.",
  });
}

main().catch((error: unknown) => {
  console.error("[demo-seed] failed", error);
  process.exit(1);
});
