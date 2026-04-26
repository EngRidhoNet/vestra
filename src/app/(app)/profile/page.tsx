import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/app/(app)/profile/profile-form";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";

async function signedProfilePhotoUrl(path: string | null) {
  if (!path) return null;

  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(STORAGE_BUCKETS.profilePhotos)
    .createSignedUrl(path, 60 * 60);

  return data?.signedUrl ?? null;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, avatar_url, gender, skin_tone, body_shape, face_photo_path, body_photo_path",
    )
    .eq("id", user?.id)
    .maybeSingle();

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("style_tags, climate")
    .eq("user_id", user?.id)
    .maybeSingle();

  const [facePhotoUrl, bodyPhotoUrl] = await Promise.all([
    signedProfilePhotoUrl(profile?.face_photo_path ?? null),
    signedProfilePhotoUrl(profile?.body_photo_path ?? null),
  ]);

  return (
    <Container size="lg" className="pt-5 sm:py-12">
      <PageHeader
        title="Profile"
        description="Review and update the personal details used for outfit recommendations."
      />

      <ProfileForm
        initialProfile={{
          fullName: profile?.full_name ?? user?.email?.split("@")[0] ?? "",
          email: user?.email ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          gender: profile?.gender ?? null,
          skinTone: profile?.skin_tone ?? null,
          bodyShape: profile?.body_shape ?? null,
          facePhotoPath: profile?.face_photo_path ?? null,
          bodyPhotoPath: profile?.body_photo_path ?? null,
          facePhotoUrl,
          bodyPhotoUrl,
          styleTags: preferences?.style_tags ?? [],
          climate: preferences?.climate ?? "",
        }}
      />
    </Container>
  );
}
