"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { STYLE_TAGS } from "@/constants/wardrobe-related.constant";

const schema = z.object({
  fullName: z.string().min(1).max(80),
  styleTags: z.array(z.enum(STYLE_TAGS)).default([]),
  climate: z.string().max(40).optional().default(""),
});

export type OnboardingState = {
  error?: string;
};

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    styleTags: formData.getAll("styleTags"),
    climate: formData.get("climate"),
  });

  if (!parsed.success) {
    return { error: "Please fill in all required fields." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileErr) return { error: profileErr.message };

  const { error: prefsErr } = await supabase
    .from("user_preferences")
    .update({
      style_tags: parsed.data.styleTags,
      climate: parsed.data.climate || null,
    })
    .eq("user_id", user.id);

  if (prefsErr) return { error: prefsErr.message };

  redirect("/dashboard");
}
