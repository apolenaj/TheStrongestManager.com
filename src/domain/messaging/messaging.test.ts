import { describe, expect, it } from "vitest";
import {
  MESSAGING_HONESTY,
  MESSAGE_RELATED_TYPES,
  canSendOnThread,
  isMessageRelatedType,
  nextMessageStatusAfterModeration,
  previewFromBody,
  resolveMessagingRole,
} from "@/domain/messaging";

describe("messaging", () => {
  it("requires active coach grant for coach role; athlete owns their side", () => {
    expect(
      resolveMessagingRole({
        actorUserId: "coach1",
        threadCoachUserId: "coach1",
        threadAthleteUserId: "ath1",
        hasActiveCoachGrant: true,
      }),
    ).toBe("coach");
    expect(
      resolveMessagingRole({
        actorUserId: "coach1",
        threadCoachUserId: "coach1",
        threadAthleteUserId: "ath1",
        hasActiveCoachGrant: false,
      }),
    ).toBeNull();
    expect(
      resolveMessagingRole({
        actorUserId: "ath1",
        threadCoachUserId: "coach1",
        threadAthleteUserId: "ath1",
        hasActiveCoachGrant: false,
      }),
    ).toBe("athlete");
  });

  it("supports workout and technique references", () => {
    expect(MESSAGE_RELATED_TYPES).toEqual([
      "training_session",
      "technique_analysis",
    ]);
    expect(isMessageRelatedType("training_session")).toBe(true);
    expect(isMessageRelatedType("program")).toBe(false);
  });

  it("locks sending on archived/locked threads", () => {
    expect(canSendOnThread("open")).toBe(true);
    expect(canSendOnThread("locked")).toBe(false);
  });

  it("moderates hide/remove/restore like community QA", () => {
    expect(nextMessageStatusAfterModeration("hide", "active")).toBe("hidden");
    expect(nextMessageStatusAfterModeration("remove", "active")).toBe(
      "removed",
    );
    expect(nextMessageStatusAfterModeration("restore", "hidden")).toBe(
      "active",
    );
    expect(nextMessageStatusAfterModeration("flag", "active")).toBeNull();
  });

  it("states secure access honesty", () => {
    expect(MESSAGING_HONESTY.join(" ")).toMatch(/access grant/i);
    expect(previewFromBody("  hello   world  ")).toBe("hello world");
  });
});
