import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/shared/container";
import { OnboardingForm } from "@/app/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarded_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarded_at) redirect("/dashboard");

  return (
    <Container size="sm" className="py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Let&apos;s set up your profile
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          A few quick details so we can tune recommendations to your taste.
        </p>
      </div>
      <OnboardingForm
        defaultName={profile?.full_name ?? user.user_metadata?.full_name ?? ""}
      />
    </Container>
  );
}
