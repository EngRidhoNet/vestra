"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shirt } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileTabNav } from "@/components/layout/mobile-tab-nav";
import { APP_NAV } from "@/components/layout/nav-items";
import { APP_NAME } from "@/constants/general.constant";

type ShellProps = {
  user: {
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
  children: React.ReactNode;
};

export function AppShell({ user, children }: ShellProps) {
  const router = useRouter();

  useEffect(() => {
    APP_NAV.forEach(({ href }) => {
      router.prefetch(href);
    });
  }, [router]);

  return (
    <div className="bg-app relative flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="glass-subtle sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r p-4 md:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 text-base font-semibold tracking-normal"
        >
          <Shirt className="h-5 w-5" />
          {APP_NAME}
        </Link>
        <div className="flex-1">
          <SidebarNav />
        </div>
        <UserMenu
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:hidden">
          <div className="glass-header flex items-center justify-between gap-3 rounded-[1.5rem] px-3 py-2.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-semibold tracking-normal"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-sm">
                <Shirt className="size-4" />
              </span>
              {APP_NAME}
            </Link>
            <div className="w-44 max-w-[48vw]">
              <UserMenu
                name={user.name}
                email={user.email}
                avatarUrl={user.avatarUrl}
                compact
              />
            </div>
          </div>
        </header>

        <main className="flex-1 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>

        <MobileTabNav />
      </div>
    </div>
  );
}
