import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, onboarded_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarded_at) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      user={{
        name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
        email: user.email ?? null,
        avatarUrl:
          profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
      }}
    >
      {children}
    </AppShell>
  );
}
