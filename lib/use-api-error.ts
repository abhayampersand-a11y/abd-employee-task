import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import type { ApiError } from "@/lib/api";

type AnyError = FetchBaseQueryError | SerializedError | undefined;

/**
 * Pulls the message and per-field errors out of whatever RTK Query hands back,
 * so forms don't each reinvent the unwrapping.
 */
export function readApiError(error: AnyError): {
  message: string | null;
  fieldErrors: Record<string, string>;
} {
  if (!error) return { message: null, fieldErrors: {} };

  if ("data" in error && error.data && typeof error.data === "object") {
    const body = error.data as Partial<ApiError>;
    return {
      message: body.error ?? "Something went wrong",
      fieldErrors: body.fieldErrors ?? {},
    };
  }

  if ("message" in error && error.message) {
    return { message: error.message, fieldErrors: {} };
  }

  return { message: "Something went wrong", fieldErrors: {} };
}
