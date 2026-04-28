import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/app/(app)/profile/profile-form";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: preferences }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, avatar_url, gender, skin_tone, body_shape, face_photo_path, body_photo_path",
      )
      .eq("id", user?.id)
      .maybeSingle(),
    supabase
      .from("user_preferences")
      .select("style_tags, climate")
      .eq("user_id", user?.id)
      .maybeSingle(),
  ]);

  const photoPaths = [profile?.face_photo_path, profile?.body_photo_path].filter(
    (path): path is string => Boolean(path),
  );

  const signedUrlByPath = new Map<string, string>();

  if (photoPaths.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from(STORAGE_BUCKETS.profilePhotos)
      .createSignedUrls(photoPaths, 60 * 60);

    (signedUrls ?? []).forEach((entry) => {
      if (entry.path && entry.signedUrl) {
        signedUrlByPath.set(entry.path, entry.signedUrl);
      }
    });
  }

  const facePhotoUrl = profile?.face_photo_path
    ? (signedUrlByPath.get(profile.face_photo_path) ?? null)
    : null;
  const bodyPhotoUrl = profile?.body_photo_path
    ? (signedUrlByPath.get(profile.body_photo_path) ?? null)
    : null;

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
