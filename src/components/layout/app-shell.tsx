"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { APP_NAME } from "@/lib/constants";

type ShellProps = {
  user: {
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
  children: React.ReactNode;
};

export function AppShell({ user, children }: ShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="glass-subtle sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r p-4 md:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 text-base font-semibold tracking-tight"
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

      {/* Mobile topbar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-subtle sticky top-0 z-20 flex items-center justify-between gap-3 border-b px-4 py-3 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <SheetHeader className="px-2">
                <SheetTitle className="flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  {APP_NAME}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <SidebarNav onNavigate={() => setOpen(false)} />
              </div>
              <div className="mt-auto pt-6">
                <UserMenu
                  name={user.name}
                  email={user.email}
                  avatarUrl={user.avatarUrl}
                />
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="w-9" />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
