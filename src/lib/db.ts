import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "error" },
            { emit: "stdout", level: "warn" },
          ]
        : [{ emit: "event", level: "error" }],
  });

  client.$on("error", (event) => {
    void import("@/services/observability/logger")
      .then(({ obs }) => {
        obs.error({
          category: "database",
          message: "prisma_error",
          props: {
            // Prisma message only — never query args (may contain PII).
            target: String(event.target ?? "prisma").slice(0, 80),
          },
        });
      })
      .catch(() => undefined);
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
