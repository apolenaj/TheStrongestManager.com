import { describe, expect, it } from "vitest";
import {
  SOCIAL_ACTIVITY_KINDS,
  SOCIAL_FOLLOW_TARGET_KINDS,
  assertFollowEdgeShape,
  buildSocialGraphSnapshot,
  canViewerReceiveFollowedActivity,
  defaultSocialAccountPrivacy,
  evaluateSocialFeedLaunchGate,
  initialFollowStatusForPrivacy,
} from "@/domain/social-graph";

describe("social graph prep", () => {
  it("supports follow athletes and coaches", () => {
    expect([...SOCIAL_FOLLOW_TARGET_KINDS]).toEqual(["athlete", "coach"]);
    expect(
      assertFollowEdgeShape({
        targetKind: "athlete",
        targetAthleteProfileId: "ap1",
        targetCoachUserId: null,
        status: "pending",
      }).ok,
    ).toBe(true);
    expect(
      assertFollowEdgeShape({
        targetKind: "coach",
        targetAthleteProfileId: null,
        targetCoachUserId: "u1",
        status: "accepted",
      }).ok,
    ).toBe(true);
    expect(
      assertFollowEdgeShape({
        targetKind: "athlete",
        targetAthleteProfileId: null,
        targetCoachUserId: "u1",
        status: "accepted",
      }).ok,
    ).toBe(false);
  });

  it("defaults accounts to private with pending follows", () => {
    const privacy = defaultSocialAccountPrivacy("u1");
    expect(privacy.isPrivate).toBe(true);
    expect(initialFollowStatusForPrivacy(privacy, "athlete")).toBe("pending");
    expect(
      initialFollowStatusForPrivacy(
        { ...privacy, isPrivate: false },
        "coach",
      ),
    ).toBe("accepted");
  });

  it("requires accepted follow to receive activity", () => {
    const privacy = {
      ...defaultSocialAccountPrivacy("author"),
      publishActivityToFollowers: true,
    };
    expect(
      canViewerReceiveFollowedActivity({
        privacy,
        followStatus: "pending",
        viewerUserId: "viewer",
      }),
    ).toBe(false);
    expect(
      canViewerReceiveFollowedActivity({
        privacy,
        followStatus: "accepted",
        viewerUserId: "viewer",
      }),
    ).toBe(true);
  });

  it("blocks full feed launch until moderation is ready", () => {
    const blocked = evaluateSocialFeedLaunchGate({
      socialGraphPrepEnabled: true,
      socialActivityFeedEnabled: false,
      contentModerationEnabled: true,
      moderationCoversUserGeneratedContent: true,
      reportQueueAvailable: true,
    });
    expect(blocked.mayLaunchFullFeed).toBe(false);
    expect(blocked.blockers.join(" ")).toMatch(/socialActivityFeed/i);

    const ready = evaluateSocialFeedLaunchGate({
      socialGraphPrepEnabled: true,
      socialActivityFeedEnabled: true,
      contentModerationEnabled: true,
      moderationCoversUserGeneratedContent: true,
      reportQueueAvailable: true,
    });
    expect(ready.mayLaunchFullFeed).toBe(true);
    expect(ready.blockers).toHaveLength(0);
  });

  it("documents planned activity kinds without inventing a live feed", () => {
    expect(SOCIAL_ACTIVITY_KINDS.length).toBeGreaterThanOrEqual(5);
    const snap = buildSocialGraphSnapshot(
      {
        socialGraphPrepEnabled: true,
        socialActivityFeedEnabled: false,
        contentModerationEnabled: false,
        moderationCoversUserGeneratedContent: true,
        reportQueueAvailable: false,
      },
      "2026-07-22T00:00:00.000Z",
    );
    expect(snap.docPath).toBe("docs/SOCIAL_GRAPH.md");
    expect(snap.launchGate.mayLaunchFullFeed).toBe(false);
    expect(snap.defaultPrivate).toBe(true);
  });
});
