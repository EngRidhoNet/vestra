"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { STYLE_TAGS } from "@/lib/constants";

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

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(80),
  gender: z.enum(genderValues),
  skinTone: z.enum(skinToneValues),
  bodyShape: z.enum(bodyShapeValues),
  styleTags: z.array(z.enum(STYLE_TAGS)).default([]),
  climate: z.string().trim().max(40).optional().default(""),
  avatarUrl: z.string().nullable().optional(),
  facePhotoPath: z.string().nullable().optional(),
  bodyPhotoPath: z.string().nullable().optional(),
});

export type UpdateProfilePayload = z.input<typeof profileSchema>;

export type UpdateProfileState = {
  ok?: boolean;
  error?: string;
};

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<UpdateProfileState> {
  const parsed = profileSchema.safeParse(payload);

  if (!parsed.success) {
    return { error: "Please complete the required profile fields." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not signed in." };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      gender: parsed.data.gender,
      skin_tone: parsed.data.skinTone,
      body_shape: parsed.data.bodyShape,
      avatar_url: parsed.data.avatarUrl ?? null,
      face_photo_path: parsed.data.facePhotoPath ?? null,
      body_photo_path: parsed.data.bodyPhotoPath ?? null,
    })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  const { error: preferencesError } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: user.id,
        style_tags: parsed.data.styleTags,
        climate: parsed.data.climate || null,
      },
      { onConflict: "user_id" },
    );

  if (preferencesError) return { error: preferencesError.message };

  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { ok: true };
}
