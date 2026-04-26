"use client";

import { cn } from "@/lib/utils";

type StepIndicatorProps = {
  steps: string[];
  current: number;
};

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                i < current &&
                  "bg-primary text-primary-foreground",
                i === current &&
                  "bg-primary text-primary-foreground ring-primary/30 ring-4",
                i > current &&
                  "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                "hidden text-[10px] font-medium sm:block",
                i === current
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mb-4 h-0.5 w-6 rounded-full transition-colors sm:mb-0 sm:w-10",
                i < current ? "bg-primary" : "bg-muted",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
