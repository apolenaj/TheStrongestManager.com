-- CreateTable
CREATE TABLE "AcademyEnrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "withdrawnAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AcademyEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AcademyLessonProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enrollmentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AcademyLessonProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "AcademyEnrollment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AcademyQuizAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enrollmentId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "scorePercent" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "answersJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AcademyQuizAttempt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "AcademyEnrollment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AcademyCompletionCertificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enrollmentId" TEXT NOT NULL,
    "certificateKind" TEXT NOT NULL DEFAULT 'certificate_of_completion',
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AcademyCompletionCertificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "AcademyEnrollment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademyEnrollment_userId_courseSlug_key" ON "AcademyEnrollment"("userId", "courseSlug");

-- CreateIndex
CREATE INDEX "AcademyEnrollment_userId_status_idx" ON "AcademyEnrollment"("userId", "status");

-- CreateIndex
CREATE INDEX "AcademyEnrollment_courseSlug_status_idx" ON "AcademyEnrollment"("courseSlug", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyLessonProgress_enrollmentId_lessonId_key" ON "AcademyLessonProgress"("enrollmentId", "lessonId");

-- CreateIndex
CREATE INDEX "AcademyLessonProgress_enrollmentId_completedAt_idx" ON "AcademyLessonProgress"("enrollmentId", "completedAt");

-- CreateIndex
CREATE INDEX "AcademyQuizAttempt_enrollmentId_quizId_createdAt_idx" ON "AcademyQuizAttempt"("enrollmentId", "quizId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyCompletionCertificate_enrollmentId_key" ON "AcademyCompletionCertificate"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyCompletionCertificate_code_key" ON "AcademyCompletionCertificate"("code");

-- CreateIndex
CREATE INDEX "AcademyCompletionCertificate_issuedAt_idx" ON "AcademyCompletionCertificate"("issuedAt");
