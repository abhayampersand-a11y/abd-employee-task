"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CheckCircleIcon, PencilIcon } from "@/components/icons";

const ACTION_WIDTH = 96;
const ACTIONS_TOTAL = ACTION_WIDTH * 2;
/** Past this much drag, release snaps the row open instead of closed. */
const SNAP_THRESHOLD = ACTIONS_TOTAL / 3;

/**
 * Swipe a card left to reveal Edit and Done.
 *
 * Touch only — on desktop the same actions live in the row's own controls, so
 * there is nothing to reveal and the wrapper stays inert.
 */
export function SwipeableRow({
  children,
  onEdit,
  onDone,
  className,
}: {
  children: ReactNode;
  onEdit?: () => void;
  onDone?: () => void;
  className?: string;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);

  function handleTouchStart(event: React.TouchEvent) {
    startX.current = event.touches[0].clientX;
    startOffset.current = offset;
    setDragging(true);
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (!dragging) return;

    const delta = event.touches[0].clientX - startX.current;
    const next = Math.min(0, Math.max(-ACTIONS_TOTAL, startOffset.current + delta));
    setOffset(next);
  }

  function handleTouchEnd() {
    setDragging(false);
    setOffset(offset < -SNAP_THRESHOLD ? -ACTIONS_TOTAL : 0);
  }

  function runAction(action?: () => void) {
    setOffset(0);
    action?.();
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      {/* Action layer, revealed as the card slides off it */}
      <div className="absolute inset-y-0 right-0 flex" aria-hidden={offset === 0}>
        <button
          type="button"
          tabIndex={offset === 0 ? -1 : 0}
          onClick={() => runAction(onEdit)}
          className="flex w-24 flex-col items-center justify-center gap-1.5 bg-slate-500 text-white"
        >
          <PencilIcon className="h-6 w-6" />
          <span className="text-[11px] font-semibold tracking-wide">EDIT</span>
        </button>
        <button
          type="button"
          tabIndex={offset === 0 ? -1 : 0}
          onClick={() => runAction(onDone)}
          className="flex w-24 flex-col items-center justify-center gap-1.5 bg-emerald-700 text-white"
        >
          <CheckCircleIcon className="h-6 w-6" />
          <span className="text-[11px] font-semibold tracking-wide">DONE</span>
        </button>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${offset}px)` }}
        className={cn(
          "relative touch-pan-y",
          !dragging && "transition-transform duration-200",
        )}
      >
        {children}
      </div>
    </div>
  );
}
