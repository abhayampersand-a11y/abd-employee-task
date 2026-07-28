import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "@/lib/auth";

export type ApiError = {
  error: string;
  fieldErrors?: Record<string, string>;
};

export function jsonError(
  status: number,
  error: string,
  fieldErrors?: Record<string, string>,
) {
  return NextResponse.json<ApiError>({ error, fieldErrors }, { status });
}

/**
 * Wraps a route handler so thrown `HttpError`s and zod failures become
 * proper responses instead of unhandled 500s.
 *
 *   export const GET = handler(async () => {
 *     const user = await requireAdmin();
 *     return NextResponse.json(...);
 *   });
 */
export function handler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof HttpError) {
        return jsonError(error.status, error.message);
      }

      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};

        for (const issue of error.issues) {
          const key = issue.path.join(".") || "_";
          fieldErrors[key] ??= issue.message;
        }

        return jsonError(422, "Please check the highlighted fields", fieldErrors);
      }

      console.error("Unhandled route error:", error);
      return jsonError(500, "Something went wrong");
    }
  };
}

/** Reads and parses pagination params with sane bounds. */
export function readPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize")) || 10),
  );

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
