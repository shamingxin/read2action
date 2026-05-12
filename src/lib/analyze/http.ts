import type { AnalyzeErrorResponse } from "@/types/analyze-api";
import type { ErrorCode } from "./error-codes";

export function jsonError(
  status: number,
  code: ErrorCode,
  message: string,
): Response {
  const body: AnalyzeErrorResponse = {
    ok: false,
    error: { code, message },
  };
  return Response.json(body, { status });
}

export function jsonSuccess<T extends object>(status: number, body: T): Response {
  return Response.json(body, { status });
}
