"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { STYLE_TAGS } from "@/constants/wardrobe-related.constant";

const genderValues = ["male", "female", "prefer_not_to_say"] as const;
const skinToneValues = [
  "very_light",
  "light",
  "medium",
  "tan",
  "brown",
  "dark",
  "very_dark",
] as const;
const bodyShapeValues = [
  "slim",
  "athletic",
  "average",
  "curvy",
  "plus_size",
  "broad",
  "petite",
] as const;

const schema = z.object({
  fullName: z.string().min(1).max(80),
  gender: z.enum(genderValues),
  skinTone: z.enum(skinToneValues),
  bodyShape: z.enum(bodyShapeValues),
  styleTags: z.array(z.enum(STYLE_TAGS)).default([]),
  climate: z.string().max(40).optional().default(""),
  avatarUrl: z.string().nullable().optional(),
  facePhotoPath: z.string().nullable().optional(),
  bodyPhotoPath: z.string().nullable().optional(),
});

export type OnboardingState = {
  error?: string;
};

export type OnboardingPayload = z.input<typeof schema>;

export async function completeOnboarding(
  payload: OnboardingPayload,
): Promise<OnboardingState> {
  const parsed = schema.safeParse(payload);

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
      gender: parsed.data.gender,
      skin_tone: parsed.data.skinTone,
      body_shape: parsed.data.bodyShape,
      avatar_url: parsed.data.avatarUrl ?? null,
      face_photo_path: parsed.data.facePhotoPath ?? null,
      body_photo_path: parsed.data.bodyPhotoPath ?? null,
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
