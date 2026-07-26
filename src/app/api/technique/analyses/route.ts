import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isCameraAngleId } from "@/domain/technique/validation";
import { createTechniqueUpload } from "@/services/technique/analysis-service";
import { TECHNIQUE_MAX_FILE_BYTES } from "@/domain/technique/constants";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import { obs, withObservedApi } from "@/services/observability";
import { safeErrorCode } from "@/domain/observability";

export const runtime = "nodejs";

async function postHandler(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const limited = rateLimit(
    clientKeyFromRequest(request, "technique-upload", session.user.id),
    RATE_LIMITS.techniqueUpload,
  );
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Upload rate limit reached. Try again in ${limited.retryAfterSeconds}s.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { ok: false, error: "Expected multipart form upload." },
      { status: 400 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not read upload. File may exceed server limits." },
      { status: 413 },
    );
  }

  const file = form.get("video");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Video file is required." },
      { status: 400 },
    );
  }
  if (file.size > TECHNIQUE_MAX_FILE_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: `File is too large. Maximum size is ${Math.floor(TECHNIQUE_MAX_FILE_BYTES / (1024 * 1024))} MB.`,
      },
      { status: 400 },
    );
  }

  const exerciseId = String(form.get("exerciseId") ?? "");
  const cameraAngle = String(form.get("cameraAngle") ?? "");
  const consent = String(form.get("consent") ?? "") === "true";
  const allowExpertReview =
    String(form.get("allowExpertReview") ?? "") === "true";
  const allowAnonymousModelImprovement =
    String(form.get("allowAnonymousModelImprovement") ?? "") === "true";
  const durationSeconds = Number(form.get("durationSeconds"));
  const widthPx = Number(form.get("widthPx"));
  const heightPx = Number(form.get("heightPx"));
  const loadRaw = String(form.get("load") ?? "").trim() || null;
  const repsRaw = String(form.get("reps") ?? "").trim() || null;
  const loadUnitPreference = String(form.get("units") ?? "") || null;

  if (!isCameraAngleId(cameraAngle)) {
    return NextResponse.json(
      { ok: false, error: "Choose a camera angle." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await createTechniqueUpload({
      userId: session.user.id,
      exerciseId,
      cameraAngle,
      loadRaw,
      loadUnitPreference,
      repsRaw,
      consent,
      allowExpertReview,
      allowAnonymousModelImprovement,
      file: {
        buffer,
        fileName: file.name || "upload.mp4",
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      },
      clientMeta: { durationSeconds, widthPx, heightPx },
    });

    if (!result.ok) {
      obs.warn({
        category: "technique_failures",
        message: "technique_upload_rejected",
        props: { status: 400 },
      });
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    obs.error({
      category: "technique_failures",
      message: "technique_upload_exception",
      props: {
        status: 500,
        errorCode: safeErrorCode(error),
        fileSizeBytes: file.size,
      },
    });
    return NextResponse.json(
      { ok: false, error: "Upload failed. Try again." },
      { status: 500 },
    );
  }
}

export const POST = withObservedApi(postHandler);
