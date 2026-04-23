import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  size = "lg",
}: {
  className?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const max = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
  }[size];
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-8", max, className)}>
      {children}
    </div>
  );
}
