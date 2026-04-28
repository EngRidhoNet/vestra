"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type SelectableCardProps<T extends string> = {
  value: T;
  selected: boolean;
  onSelect: (value: T) => void;
  label: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function SelectableCard<T extends string>({
  value,
  selected,
  onSelect,
  label,
  description,
  children,
  className,
}: SelectableCardProps<T>) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border-2 px-4 py-4 text-center transition-all",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        "active:scale-[0.97]",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-transparent bg-muted/40 hover:bg-muted/70",
        className,
      )}
    >
      {selected && (
        <div className="bg-primary text-primary-foreground absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full">
          <Check className="h-3 w-3" />
        </div>
      )}
      {children}
      <span className="mt-1.5 text-sm font-medium">{label}</span>
      {description && (
        <span className="text-muted-foreground mt-0.5 text-xs">
          {description}
        </span>
      )}
    </button>
  );
}

type SkinToneSwatchProps = {
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  label: string;
  color: string;
};

export function SkinToneSwatch({
  value,
  selected,
  onSelect,
  label,
  color,
}: SkinToneSwatchProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl p-3 transition-all",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        "active:scale-[0.95]",
        selected ? "bg-primary/5 ring-primary ring-2" : "hover:bg-muted/50",
      )}
    >
      <div
        className={cn(
          "h-12 w-12 rounded-full border-2 shadow-inner transition-transform",
          selected ? "border-primary scale-110" : "border-transparent",
        )}
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
