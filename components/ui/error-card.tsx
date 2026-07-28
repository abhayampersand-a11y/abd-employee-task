"use client";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { readApiError } from "@/lib/use-api-error";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "@/components/icons";

/** Every data view uses this so failures never render as a blank screen. */
export function ErrorCard({
  error,
  onRetry,
}: {
  error: FetchBaseQueryError | SerializedError | undefined;
  onRetry?: () => void;
}) {
  const { message } = readApiError(error);

  return (
    <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-8 text-center">
      <AlertTriangleIcon className="mx-auto h-8 w-8 text-red-500" />
      <p className="mt-3 font-semibold text-red-800">
        {message ?? "Something went wrong"}
      </p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
