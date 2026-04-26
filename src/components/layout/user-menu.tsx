"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function UserMenu({
  name,
  email,
  avatarUrl,
  compact = false,
}: {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  compact?: boolean;
}) {
  const router = useRouter();

  const initials = (name ?? email ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "hover:bg-accent/60 flex w-full items-center gap-3 rounded-xl p-2 text-left transition",
          compact && "justify-end rounded-full p-1",
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name ?? "User"} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className={compact ? "sr-only" : "min-w-0 flex-1"}>
          <p className="truncate text-sm font-medium">{name ?? "Account"}</p>
          <p className="text-muted-foreground truncate text-xs">{email ?? ""}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <Settings className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await createClient().auth.signOut();
            router.push("/login");
            router.refresh();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
