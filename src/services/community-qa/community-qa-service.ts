import { prisma } from "@/lib/db";
import {
  applyVoteDelta,
  buildDiscussionAiSummary,
  canAcceptAnswer,
  isQaCategory,
  isQaModerationAction,
  isVisibleAnswerStatus,
  isVisibleQuestionStatus,
  nextAnswerStatusAfterModeration,
  nextQuestionStatusAfterModeration,
  normalizeVoteValue,
  QA_CATEGORY_LABELS,
  QA_HONESTY,
  shouldShowExpertBadge,
  type QaAiSummaryView,
  type QaCategory,
  type VoteValue,
} from "@/domain/community-qa";
import { isVerifiedExpertContributor } from "@/domain/expert-contributor";

export type QaQuestionListItem = {
  id: string;
  category: QaCategory;
  categoryLabel: string;
  title: string;
  score: number;
  answerCount: number;
  hasAccepted: boolean;
  authorLabel: string;
  createdAt: string;
};

export type QaAnswerView = {
  id: string;
  body: string;
  score: number;
  authorship: string;
  expertBadge: boolean;
  isAccepted: boolean;
  authorLabel: string;
  createdAt: string;
  myVote: VoteValue | null;
};

export type QaQuestionDetail = {
  id: string;
  category: QaCategory;
  categoryLabel: string;
  title: string;
  body: string;
  score: number;
  status: string;
  authorLabel: string;
  authorProfileId: string;
  createdAt: string;
  myVote: VoteValue | null;
  answers: QaAnswerView[];
  aiSummary: QaAiSummaryView | null;
  isQuestionAuthor: boolean;
};

export type QaIndexView = {
  honesty: readonly string[];
  category: QaCategory | null;
  questions: QaQuestionListItem[];
};

async function hasVerifiedExpertContributor(userId: string): Promise<boolean> {
  const profile = await prisma.expertContributorProfile.findUnique({
    where: { userId },
    select: { verificationStatus: true },
  });
  return isVerifiedExpertContributor(profile?.verificationStatus);
}

function authorLabel(displayName: string | null, profileId: string): string {
  return displayName?.trim() || `Athlete ${profileId.slice(-4).toUpperCase()}`;
}

export async function listCommunityQuestions(
  category: string | null | undefined,
): Promise<QaIndexView> {
  const cat = category && isQaCategory(category) ? category : null;
  const rows = await prisma.communityQuestion.findMany({
    where: {
      status: { in: ["open", "closed"] },
      ...(cat ? { category: cat } : {}),
    },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: 50,
    include: {
      athleteProfile: { select: { displayName: true, id: true } },
      _count: { select: { answers: { where: { status: "published" } } } },
    },
  });

  return {
    honesty: QA_HONESTY,
    category: cat,
    questions: rows.map((q) => ({
      id: q.id,
      category: q.category as QaCategory,
      categoryLabel:
        QA_CATEGORY_LABELS[q.category as QaCategory] ?? q.category,
      title: q.title,
      score: q.score,
      answerCount: q._count.answers,
      hasAccepted: Boolean(q.acceptedAnswerId),
      authorLabel: authorLabel(q.athleteProfile.displayName, q.athleteProfile.id),
      createdAt: q.createdAt.toISOString(),
    })),
  };
}

export async function getCommunityQuestionDetail(
  userId: string,
  questionId: string,
): Promise<QaQuestionDetail | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const q = await prisma.communityQuestion.findUnique({
    where: { id: questionId },
    include: {
      athleteProfile: { select: { id: true, displayName: true } },
      answers: {
        where: { status: "published" },
        orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        include: {
          athleteProfile: { select: { id: true, displayName: true } },
        },
      },
    },
  });
  if (!q || !isVisibleQuestionStatus(q.status)) return null;

  const votes = await prisma.communityVote.findMany({
    where: {
      athleteProfileId: profile.id,
      OR: [
        { targetKey: `question:${q.id}` },
        ...q.answers.map((a) => ({ targetKey: `answer:${a.id}` })),
      ],
    },
  });
  const voteMap = new Map(votes.map((v) => [v.targetKey, v.value as VoteValue]));

  const answers: QaAnswerView[] = q.answers
    .filter((a) => isVisibleAnswerStatus(a.status))
    .map((a) => ({
      id: a.id,
      body: a.body,
      score: a.score,
      authorship: a.authorship,
      expertBadge: Boolean(a.expertBadgeAt),
      isAccepted: q.acceptedAnswerId === a.id,
      authorLabel: authorLabel(a.athleteProfile.displayName, a.athleteProfile.id),
      createdAt: a.createdAt.toISOString(),
      myVote: voteMap.get(`answer:${a.id}`) ?? null,
    }));

  let aiSummary: QaAiSummaryView | null = null;
  if (q.aiSummary && q.aiSummaryAt) {
    aiSummary = {
      label: "AI summary",
      disclaimer:
        "Generated overview of the discussion — not a human answer and not medical advice.",
      isAiGenerated: true,
      body: q.aiSummary,
      generatedAt: q.aiSummaryAt.toISOString(),
      engineVersion: q.aiEngineVersion,
    };
  }

  return {
    id: q.id,
    category: q.category as QaCategory,
    categoryLabel: QA_CATEGORY_LABELS[q.category as QaCategory] ?? q.category,
    title: q.title,
    body: q.body,
    score: q.score,
    status: q.status,
    authorLabel: authorLabel(q.athleteProfile.displayName, q.athleteProfile.id),
    authorProfileId: q.athleteProfileId,
    createdAt: q.createdAt.toISOString(),
    myVote: voteMap.get(`question:${q.id}`) ?? null,
    answers,
    aiSummary,
    isQuestionAuthor: q.athleteProfileId === profile.id,
  };
}

export async function createCommunityQuestion(
  userId: string,
  input: { category: string; title: string; body: string },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!isQaCategory(input.category)) {
    return { ok: false, error: "Choose a valid category." };
  }
  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 8) return { ok: false, error: "Title is too short." };
  if (body.length < 20) return { ok: false, error: "Question body is too short." };

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const row = await prisma.communityQuestion.create({
    data: {
      athleteProfileId: profile.id,
      category: input.category,
      title,
      body,
    },
  });
  return { ok: true, id: row.id };
}

export async function createCommunityAnswer(
  userId: string,
  questionId: string,
  bodyRaw: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const body = bodyRaw.trim();
  if (body.length < 8) return { ok: false, error: "Answer is too short." };

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const question = await prisma.communityQuestion.findUnique({
    where: { id: questionId },
    select: { id: true, status: true },
  });
  if (!question || question.status !== "open") {
    return { ok: false, error: "Question is not open for answers." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isCoach: true },
  });
  const expert = await hasVerifiedExpertContributor(userId);
  const showExpert = shouldShowExpertBadge({
    hasVerifiedExpertContributor: expert,
  });

  const row = await prisma.communityAnswer.create({
    data: {
      questionId,
      athleteProfileId: profile.id,
      body,
      authorship: user?.isCoach ? "human_coach" : "human_athlete",
      expertBadgeAt: showExpert ? new Date() : null,
    },
  });
  return { ok: true, id: row.id };
}

export async function voteOnCommunityTarget(
  userId: string,
  input: { targetType: "question" | "answer"; targetId: string; value: number },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const value = normalizeVoteValue(input.value);
  if (!value) return { ok: false, error: "Vote must be +1 or -1." };

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const targetKey = `${input.targetType}:${input.targetId}`;
  const existing = await prisma.communityVote.findUnique({
    where: {
      athleteProfileId_targetKey: {
        athleteProfileId: profile.id,
        targetKey,
      },
    },
  });

  if (input.targetType === "question") {
    const q = await prisma.communityQuestion.findUnique({
      where: { id: input.targetId },
    });
    if (!q || !isVisibleQuestionStatus(q.status)) {
      return { ok: false, error: "Question not found." };
    }
    const prev = (existing?.value as VoteValue | undefined) ?? null;
    const next = prev === value ? null : value;
    const newScore = applyVoteDelta(q.score, prev, next);

    await prisma.$transaction(async (tx) => {
      if (next == null && existing) {
        await tx.communityVote.delete({ where: { id: existing.id } });
      } else if (next != null && existing) {
        await tx.communityVote.update({
          where: { id: existing.id },
          data: { value: next },
        });
      } else if (next != null) {
        await tx.communityVote.create({
          data: {
            athleteProfileId: profile.id,
            targetType: "question",
            targetKey,
            questionId: q.id,
            value: next,
          },
        });
      }
      await tx.communityQuestion.update({
        where: { id: q.id },
        data: { score: newScore },
      });
    });
    return { ok: true };
  }

  const a = await prisma.communityAnswer.findUnique({
    where: { id: input.targetId },
  });
  if (!a || !isVisibleAnswerStatus(a.status)) {
    return { ok: false, error: "Answer not found." };
  }
  const prev = (existing?.value as VoteValue | undefined) ?? null;
  const next = prev === value ? null : value;
  const newScore = applyVoteDelta(a.score, prev, next);

  await prisma.$transaction(async (tx) => {
    if (next == null && existing) {
      await tx.communityVote.delete({ where: { id: existing.id } });
    } else if (next != null && existing) {
      await tx.communityVote.update({
        where: { id: existing.id },
        data: { value: next },
      });
    } else if (next != null) {
      await tx.communityVote.create({
        data: {
          athleteProfileId: profile.id,
          targetType: "answer",
          targetKey,
          answerId: a.id,
          questionId: a.questionId,
          value: next,
        },
      });
    }
    await tx.communityAnswer.update({
      where: { id: a.id },
      data: { score: newScore },
    });
  });
  return { ok: true };
}

export async function acceptCommunityAnswer(
  userId: string,
  questionId: string,
  answerId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const question = await prisma.communityQuestion.findUnique({
    where: { id: questionId },
  });
  const answer = await prisma.communityAnswer.findUnique({
    where: { id: answerId },
  });
  if (!question || !answer || answer.questionId !== questionId) {
    return { ok: false, error: "Answer not found on this question." };
  }
  if (
    !canAcceptAnswer({
      questionAuthorProfileId: question.athleteProfileId,
      actorProfileId: profile.id,
      answerStatus: answer.status,
      answerAuthorship: answer.authorship,
    })
  ) {
    return { ok: false, error: "Only the question author can accept a published human answer." };
  }

  await prisma.communityQuestion.update({
    where: { id: questionId },
    data: { acceptedAnswerId: answerId, status: "closed" },
  });
  return { ok: true };
}

export async function refreshQuestionAiSummary(
  questionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const q = await prisma.communityQuestion.findUnique({
    where: { id: questionId },
    include: {
      answers: {
        where: { status: "published" },
        select: { body: true, expertBadgeAt: true, score: true },
      },
    },
  });
  if (!q) return { ok: false, error: "Question not found." };

  const summary = buildDiscussionAiSummary({
    questionTitle: q.title,
    questionBody: q.body,
    answers: q.answers.map((a) => ({
      body: a.body,
      isExpert: Boolean(a.expertBadgeAt),
      score: a.score,
    })),
  });

  await prisma.communityQuestion.update({
    where: { id: questionId },
    data: {
      aiSummary: summary.body,
      aiSummaryAt: new Date(),
      aiEngineVersion: summary.engineVersion,
    },
  });
  return { ok: true };
}

export type QaModerationQueueItem = {
  id: string;
  kind: "question" | "answer";
  titleOrExcerpt: string;
  status: string;
  category: string | null;
  authorLabel: string;
  createdAt: string;
  flagCount: number;
};

export async function listQaModerationQueue(): Promise<QaModerationQueueItem[]> {
  const [hiddenQuestions, hiddenAnswers, recentFlags] = await Promise.all([
    prisma.communityQuestion.findMany({
      where: { status: { in: ["hidden", "removed"] } },
      orderBy: { updatedAt: "desc" },
      take: 40,
      include: {
        athleteProfile: { select: { displayName: true, id: true } },
        moderationEvents: {
          where: { action: "flag" },
          select: { id: true },
        },
      },
    }),
    prisma.communityAnswer.findMany({
      where: { status: { in: ["hidden", "removed"] } },
      orderBy: { updatedAt: "desc" },
      take: 40,
      include: {
        athleteProfile: { select: { displayName: true, id: true } },
        question: { select: { category: true, title: true } },
        moderationEvents: {
          where: { action: "flag" },
          select: { id: true },
        },
      },
    }),
    prisma.communityQaModerationEvent.findMany({
      where: { action: "flag" },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        question: {
          include: {
            athleteProfile: { select: { displayName: true, id: true } },
          },
        },
        answer: {
          include: {
            athleteProfile: { select: { displayName: true, id: true } },
            question: { select: { title: true, category: true } },
          },
        },
      },
    }),
  ]);

  const items: QaModerationQueueItem[] = [];

  for (const q of hiddenQuestions) {
    items.push({
      id: q.id,
      kind: "question",
      titleOrExcerpt: q.title,
      status: q.status,
      category: q.category,
      authorLabel: authorLabel(q.athleteProfile.displayName, q.athleteProfile.id),
      createdAt: q.createdAt.toISOString(),
      flagCount: q.moderationEvents.length,
    });
  }
  for (const a of hiddenAnswers) {
    items.push({
      id: a.id,
      kind: "answer",
      titleOrExcerpt: a.body.slice(0, 120),
      status: a.status,
      category: a.question.category,
      authorLabel: authorLabel(a.athleteProfile.displayName, a.athleteProfile.id),
      createdAt: a.createdAt.toISOString(),
      flagCount: a.moderationEvents.length,
    });
  }
  for (const f of recentFlags) {
    if (f.question && isVisibleQuestionStatus(f.question.status)) {
      items.push({
        id: f.question.id,
        kind: "question",
        titleOrExcerpt: `[Flagged] ${f.question.title}`,
        status: f.question.status,
        category: f.question.category,
        authorLabel: authorLabel(
          f.question.athleteProfile.displayName,
          f.question.athleteProfile.id,
        ),
        createdAt: f.createdAt.toISOString(),
        flagCount: 1,
      });
    }
    if (f.answer && isVisibleAnswerStatus(f.answer.status)) {
      items.push({
        id: f.answer.id,
        kind: "answer",
        titleOrExcerpt: `[Flagged] ${f.answer.body.slice(0, 100)}`,
        status: f.answer.status,
        category: f.answer.question.category,
        authorLabel: authorLabel(
          f.answer.athleteProfile.displayName,
          f.answer.athleteProfile.id,
        ),
        createdAt: f.createdAt.toISOString(),
        flagCount: 1,
      });
    }
  }

  return items.slice(0, 60);
}

export async function moderateCommunityContent(
  adminUserId: string,
  input: {
    kind: "question" | "answer";
    id: string;
    action: string;
    reason?: string | null;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isQaModerationAction(input.action)) {
    return { ok: false, error: "Invalid moderation action." };
  }

  if (input.kind === "question") {
    const q = await prisma.communityQuestion.findUnique({
      where: { id: input.id },
    });
    if (!q) return { ok: false, error: "Question not found." };
    const next = nextQuestionStatusAfterModeration(input.action, q.status);
    await prisma.$transaction([
      prisma.communityQaModerationEvent.create({
        data: {
          questionId: q.id,
          action: input.action,
          reason: input.reason?.trim() || null,
          actorUserId: adminUserId,
        },
      }),
      ...(next
        ? [
            prisma.communityQuestion.update({
              where: { id: q.id },
              data: { status: next },
            }),
          ]
        : []),
    ]);
    return { ok: true };
  }

  const a = await prisma.communityAnswer.findUnique({
    where: { id: input.id },
  });
  if (!a) return { ok: false, error: "Answer not found." };
  const next = nextAnswerStatusAfterModeration(input.action, a.status);
  await prisma.$transaction([
    prisma.communityQaModerationEvent.create({
      data: {
        answerId: a.id,
        questionId: a.questionId,
        action: input.action,
        reason: input.reason?.trim() || null,
        actorUserId: adminUserId,
      },
    }),
    ...(next
      ? [
          prisma.communityAnswer.update({
            where: { id: a.id },
            data: { status: next },
          }),
        ]
      : []),
  ]);
  return { ok: true };
}

export async function flagCommunityContent(
  userId: string,
  input: { kind: "question" | "answer"; id: string; reason?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.kind === "question") {
    const q = await prisma.communityQuestion.findUnique({
      where: { id: input.id },
    });
    if (!q) return { ok: false, error: "Question not found." };
    await prisma.communityQaModerationEvent.create({
      data: {
        questionId: q.id,
        action: "flag",
        reason: input.reason?.trim() || "Flagged by community member",
        actorUserId: userId,
      },
    });
    return { ok: true };
  }
  const a = await prisma.communityAnswer.findUnique({
    where: { id: input.id },
  });
  if (!a) return { ok: false, error: "Answer not found." };
  await prisma.communityQaModerationEvent.create({
    data: {
      answerId: a.id,
      questionId: a.questionId,
      action: "flag",
      reason: input.reason?.trim() || "Flagged by community member",
      actorUserId: userId,
    },
  });
  return { ok: true };
}
