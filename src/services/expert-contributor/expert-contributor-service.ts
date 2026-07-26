import { prisma } from "@/lib/db";
import {
  canPublishExpertArticle,
  canSubmitExpertApplication,
  CONTRIBUTOR_ROLE_LABELS,
  expertArticleJsonLd,
  EXPERT_CONTRIBUTOR_HONESTY,
  EXPERT_VERIFICATION_LABELS,
  isVerifiedExpertContributor,
  parseSpecializationsJson,
  resolveContributorRoles,
  serializeSpecializations,
  slugifyExpert,
  type ContributorRole,
} from "@/domain/expert-contributor";
import { isCredentialVerified } from "@/domain/marketplace/catalog";
import type { JsonLd } from "@/domain/seo/schema";

export type ExpertWorkspaceView = {
  honesty: readonly string[];
  roles: ContributorRole[];
  roleLabels: string[];
  profile: {
    id: string;
    displayName: string;
    bio: string | null;
    specializations: string[];
    credentialsSummary: string | null;
    experienceSummary: string | null;
    verificationStatus: string;
    verificationLabel: string;
    seoSlug: string | null;
    verificationNote: string | null;
  } | null;
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
    publishedAt: string | null;
  }>;
  canApply: boolean;
  canPublish: boolean;
};

async function hasVerifiedCoachCredential(userId: string): Promise<boolean> {
  const mp = await prisma.coachMarketplaceProfile.findUnique({
    where: { userId },
    select: {
      credentials: {
        select: { verificationStatus: true, expiresAt: true },
      },
    },
  });
  if (!mp) return false;
  return mp.credentials.some((c) =>
    isCredentialVerified({
      verificationStatus: c.verificationStatus,
      expiresAt: c.expiresAt,
    }),
  );
}

export async function getExpertWorkspace(
  userId: string,
): Promise<ExpertWorkspaceView> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isCoach: true,
      expertContributorProfile: {
        include: {
          articles: { orderBy: { updatedAt: "desc" }, take: 30 },
        },
      },
    },
  });

  const hasCred = await hasVerifiedCoachCredential(userId);
  const status =
    user?.expertContributorProfile?.verificationStatus ?? "none";
  const roles = resolveContributorRoles({
    isCoach: Boolean(user?.isCoach),
    hasVerifiedCoachCredential: hasCred,
    expertVerificationStatus: status,
  });

  const p = user?.expertContributorProfile ?? null;

  return {
    honesty: EXPERT_CONTRIBUTOR_HONESTY,
    roles,
    roleLabels: roles.map((r) => CONTRIBUTOR_ROLE_LABELS[r]),
    profile: p
      ? {
          id: p.id,
          displayName: p.displayName,
          bio: p.bio,
          specializations: parseSpecializationsJson(p.specializationsJson),
          credentialsSummary: p.credentialsSummary,
          experienceSummary: p.experienceSummary,
          verificationStatus: p.verificationStatus,
          verificationLabel:
            EXPERT_VERIFICATION_LABELS[
              p.verificationStatus as keyof typeof EXPERT_VERIFICATION_LABELS
            ] ?? p.verificationStatus,
          seoSlug: p.seoSlug,
          verificationNote: p.verificationNote,
        }
      : null,
    articles:
      p?.articles.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        status: a.status,
        publishedAt: a.publishedAt?.toISOString() ?? null,
      })) ?? [],
    canApply: canSubmitExpertApplication({ currentStatus: status }),
    canPublish: canPublishExpertArticle({
      expertVerificationStatus: status,
    }),
  };
}

export async function upsertExpertApplication(
  userId: string,
  input: {
    displayName: string;
    bio?: string | null;
    specializations: string[];
    credentialsSummary?: string | null;
    experienceSummary?: string | null;
    submitForReview: boolean;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const displayName = input.displayName.trim();
  if (displayName.length < 2) {
    return { ok: false, error: "Display name is required." };
  }

  const existing = await prisma.expertContributorProfile.findUnique({
    where: { userId },
  });
  if (
    existing &&
    !canSubmitExpertApplication({
      currentStatus: existing.verificationStatus,
    }) &&
    input.submitForReview
  ) {
    if (existing.verificationStatus === "pending_review") {
      return { ok: false, error: "Application already pending review." };
    }
    if (existing.verificationStatus === "verified") {
      // Allow profile updates without re-submit
    } else {
      return { ok: false, error: "Cannot submit application in this status." };
    }
  }

  let seoSlug = existing?.seoSlug ?? slugifyExpert(displayName);
  if (!seoSlug) seoSlug = `expert-${userId.slice(-6)}`;

  const clash = await prisma.expertContributorProfile.findFirst({
    where: {
      seoSlug,
      NOT: existing ? { id: existing.id } : undefined,
    },
    select: { id: true },
  });
  if (clash) {
    seoSlug = `${seoSlug}-${userId.slice(-4).toLowerCase()}`;
  }

  const nextStatus =
    input.submitForReview &&
    canSubmitExpertApplication({
      currentStatus: existing?.verificationStatus ?? "none",
    })
      ? "pending_review"
      : (existing?.verificationStatus ?? "none");

  await prisma.expertContributorProfile.upsert({
    where: { userId },
    create: {
      userId,
      displayName,
      bio: input.bio?.trim() || null,
      specializationsJson: serializeSpecializations(input.specializations),
      credentialsSummary: input.credentialsSummary?.trim() || null,
      experienceSummary: input.experienceSummary?.trim() || null,
      verificationStatus: input.submitForReview ? "pending_review" : "none",
      seoSlug,
    },
    update: {
      displayName,
      bio: input.bio?.trim() || null,
      specializationsJson: serializeSpecializations(input.specializations),
      credentialsSummary: input.credentialsSummary?.trim() || null,
      experienceSummary: input.experienceSummary?.trim() || null,
      seoSlug,
      ...(input.submitForReview &&
      canSubmitExpertApplication({
        currentStatus: existing?.verificationStatus ?? "none",
      })
        ? {
            verificationStatus: "pending_review",
            verifiedAt: null,
            verifiedByUserId: null,
            verificationNote: null,
          }
        : nextStatus === existing?.verificationStatus
          ? {}
          : {}),
    },
  });

  return { ok: true };
}

export async function saveExpertArticle(
  userId: string,
  input: {
    id?: string | null;
    title: string;
    description: string;
    body: string;
    publish: boolean;
  },
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const profile = await prisma.expertContributorProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    return { ok: false, error: "Create an Expert Contributor profile first." };
  }
  if (
    input.publish &&
    !canPublishExpertArticle({
      expertVerificationStatus: profile.verificationStatus,
    })
  ) {
    return {
      ok: false,
      error: "Only verified Expert Contributors can publish articles.",
    };
  }

  const title = input.title.trim();
  const description = input.description.trim();
  const body = input.body.trim();
  if (title.length < 4) return { ok: false, error: "Title is too short." };
  if (description.length < 8) {
    return { ok: false, error: "Description is too short." };
  }
  if (body.length < 40) return { ok: false, error: "Article body is too short." };

  let slug = slugifyExpert(title);
  if (!slug) slug = `article-${Date.now()}`;

  if (input.id) {
    const existing = await prisma.expertArticle.findFirst({
      where: { id: input.id, contributorId: profile.id },
    });
    if (!existing) return { ok: false, error: "Article not found." };
    const updated = await prisma.expertArticle.update({
      where: { id: existing.id },
      data: {
        title,
        description,
        body,
        status: input.publish ? "published" : "draft",
        publishedAt: input.publish
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt,
      },
    });
    return { ok: true, slug: updated.slug };
  }

  const clash = await prisma.expertArticle.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const created = await prisma.expertArticle.create({
    data: {
      contributorId: profile.id,
      slug,
      title,
      description,
      body,
      status: input.publish ? "published" : "draft",
      publishedAt: input.publish ? new Date() : null,
    },
  });
  return { ok: true, slug: created.slug };
}

export type PublicExpertProfileView = {
  displayName: string;
  bio: string | null;
  specializations: string[];
  credentialsSummary: string | null;
  experienceSummary: string | null;
  seoSlug: string;
  roleLabels: string[];
  articles: Array<{ slug: string; title: string; description: string }>;
};

export async function getPublicExpertProfile(
  slug: string,
): Promise<PublicExpertProfileView | null> {
  const profile = await prisma.expertContributorProfile.findUnique({
    where: { seoSlug: slug },
    include: {
      user: { select: { isCoach: true } },
      articles: {
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 50,
      },
    },
  });
  if (!profile || !isVerifiedExpertContributor(profile.verificationStatus)) {
    return null;
  }
  if (!profile.seoSlug) return null;

  const hasCred = await hasVerifiedCoachCredential(profile.userId);
  const roles = resolveContributorRoles({
    isCoach: profile.user.isCoach,
    hasVerifiedCoachCredential: hasCred,
    expertVerificationStatus: profile.verificationStatus,
  });

  return {
    displayName: profile.displayName,
    bio: profile.bio,
    specializations: parseSpecializationsJson(profile.specializationsJson),
    credentialsSummary: profile.credentialsSummary,
    experienceSummary: profile.experienceSummary,
    seoSlug: profile.seoSlug,
    roleLabels: roles.map((r) => CONTRIBUTOR_ROLE_LABELS[r]),
    articles: profile.articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      description: a.description,
    })),
  };
}

export type PublicExpertArticleView = {
  title: string;
  description: string;
  body: string;
  slug: string;
  publishedAt: string | null;
  author: PublicExpertProfileView;
  jsonLd: JsonLd;
};

export async function getPublicExpertArticle(
  expertSlug: string,
  articleSlug: string,
): Promise<PublicExpertArticleView | null> {
  const author = await getPublicExpertProfile(expertSlug);
  if (!author) return null;

  const profile = await prisma.expertContributorProfile.findUnique({
    where: { seoSlug: expertSlug },
    select: { id: true, verificationStatus: true, displayName: true, seoSlug: true },
  });
  if (!profile?.seoSlug) return null;

  const article = await prisma.expertArticle.findFirst({
    where: {
      slug: articleSlug,
      contributorId: profile.id,
      status: "published",
    },
  });
  if (!article) return null;

  const path = `/experts/${profile.seoSlug}/articles/${article.slug}`;
  const jsonLd = expertArticleJsonLd({
    headline: article.title,
    description: article.description,
    path,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      displayName: profile.displayName,
      profilePath: `/experts/${profile.seoSlug}`,
      bio: author.bio,
      specializations: author.specializations,
      expertVerificationStatus: profile.verificationStatus,
    },
  });

  return {
    title: article.title,
    description: article.description,
    body: article.body,
    slug: article.slug,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    author,
    jsonLd,
  };
}

export type ExpertReviewQueueItem = {
  id: string;
  displayName: string;
  specializations: string[];
  credentialsSummary: string | null;
  experienceSummary: string | null;
  bio: string | null;
  verificationStatus: string;
  userEmail: string | null;
  createdAt: string;
};

export async function listExpertReviewQueue(): Promise<ExpertReviewQueueItem[]> {
  const rows = await prisma.expertContributorProfile.findMany({
    where: { verificationStatus: "pending_review" },
    orderBy: { updatedAt: "asc" },
    take: 50,
    include: { user: { select: { email: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    displayName: r.displayName,
    specializations: parseSpecializationsJson(r.specializationsJson),
    credentialsSummary: r.credentialsSummary,
    experienceSummary: r.experienceSummary,
    bio: r.bio,
    verificationStatus: r.verificationStatus,
    userEmail: r.user.email,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function reviewExpertContributor(
  adminUserId: string,
  profileId: string,
  decision: "verify" | "reject" | "revoke",
  note?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.expertContributorProfile.findUnique({
    where: { id: profileId },
  });
  if (!profile) return { ok: false, error: "Profile not found." };

  if (decision === "verify") {
    await prisma.expertContributorProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: "verified",
        verifiedAt: new Date(),
        verifiedByUserId: adminUserId,
        verificationNote: note?.trim() || "Explicitly verified by staff.",
      },
    });
    return { ok: true };
  }
  if (decision === "reject") {
    await prisma.expertContributorProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: "rejected",
        verifiedAt: null,
        verifiedByUserId: adminUserId,
        verificationNote: note?.trim() || "Application rejected.",
      },
    });
    return { ok: true };
  }
  await prisma.expertContributorProfile.update({
    where: { id: profileId },
    data: {
      verificationStatus: "revoked",
      verifiedAt: null,
      verifiedByUserId: adminUserId,
      verificationNote: note?.trim() || "Expert Contributor status revoked.",
    },
  });
  return { ok: true };
}
