/**
 * Structured production logger (Prompt 155).
 * JSON lines to console — sanitized props only.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  sanitizeLogProps,
  type ObservabilityCategory,
  type ObservabilityLevel,
} from "@/domain/observability";
import {
  getCorrelationId,
  getObservabilityContext,
  pushObservabilityRecord,
} from "@/services/observability/context";

export type LogInput = {
  category: ObservabilityCategory;
  message: string;
  props?: Record<string, unknown>;
  level?: ObservabilityLevel;
};

function emit(level: ObservabilityLevel, input: LogInput): void {
  if (!featureFlags.productionObservability) return;

  const correlationId = getCorrelationId();
  const route = getObservabilityContext()?.route;
  const props = sanitizeLogProps({
    ...(route ? { route } : {}),
    ...input.props,
  });

  const record = {
    at: new Date().toISOString(),
    level,
    category: input.category,
    message: input.message.slice(0, 200),
    correlationId,
    props,
  };

  pushObservabilityRecord(record);

  const line = JSON.stringify({
    src: "observability",
    ...record,
  });

  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else if (level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.info(line);
  }
}

export const obs = {
  info(input: LogInput): void {
    emit("info", { ...input, level: "info" });
  },
  warn(input: LogInput): void {
    emit("warn", { ...input, level: "warn" });
  },
  error(input: LogInput): void {
    emit("error", { ...input, level: "error" });
  },
  debug(input: LogInput): void {
    if (process.env.NODE_ENV === "development") {
      emit("debug", { ...input, level: "debug" });
    }
  },
};
