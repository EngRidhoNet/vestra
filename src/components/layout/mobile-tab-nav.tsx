"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileTabNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden"
    >
      <div className="glass-dock mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.75rem] p-1.5">
        {APP_NAV.map(({ label, mobileLabel, href, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          const displayLabel = mobileLabel ?? label;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-1 text-[0.68rem] font-medium transition-all duration-300 ease-out",
                active
                  ? "bg-white/70 text-foreground shadow-lg shadow-foreground/10 ring-1 ring-white/75"
                  : "text-muted-foreground hover:bg-white/36 hover:text-foreground",
              )}
            >
              {Icon ? (
                <Icon
                  className={cn(
                    "size-5 transition duration-300 ease-out group-active:scale-90",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                  strokeWidth={active ? 2.4 : 2}
                />
              ) : null}
              <span className="max-w-full truncate leading-none">
                {displayLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
