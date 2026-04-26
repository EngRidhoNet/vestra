"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  Check,
  CloudSun,
  Palette,
  Save,
  Shirt,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfilePhotoUpload } from "@/components/onboarding/profile-photo-upload";
import {
  SelectableCard,
  SkinToneSwatch,
} from "@/components/onboarding/selectable-card";
import {
  ACCEPTED_IMAGE_TYPES,
  BODY_SHAPES,
  GENDERS,
  MAX_UPLOAD_BYTES,
  SKIN_TONES,
  STORAGE_BUCKETS,
  STYLE_TAGS,
} from "@/lib/constants";
import {
  updateProfile,
  type UpdateProfilePayload,
} from "@/actions/profile";
import { createClient } from "@/lib/supabase/client";
import type { BodyShape, GenderType, SkinTone } from "@/types/database";

type PhotoType = "avatar" | "face" | "body";
type UploadedPhoto = {
  path: string;
  signedUrl: string | null;
};

type InitialProfile = {
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
  gender: GenderType | null;
  skinTone: SkinTone | null;
  bodyShape: BodyShape | null;
  facePhotoPath: string | null;
  bodyPhotoPath: string | null;
  facePhotoUrl: string | null;
  bodyPhotoUrl: string | null;
  styleTags: string[];
  climate: string;
};

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/heic") return "heic";

  return "jpg";
}

async function uploadPhoto(file: File, type: PhotoType): Promise<UploadedPhoto> {
  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    throw new Error("Please upload JPG, PNG, WebP, or HEIC");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be under 8MB");
  }

  // Read file content IMMEDIATELY — File references can go stale
  // if we wait for network calls (like getUser) first.
  const arrayBuffer = await file.arrayBuffer();
  const contentType = file.type;

  console.log(`[upload] File read: type=${type}, size=${arrayBuffer.byteLength}, mime=${contentType}`);

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in. Please log in and try again.");
  }

  console.log(`[upload] User authenticated: ${user.id}`);

  const ext = extensionFor(file);
  const path = `${user.id}/${type}/${crypto.randomUUID()}.${ext}`;

  console.log(`[upload] Uploading ${arrayBuffer.byteLength} bytes to path: ${path}`);

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.profilePhotos)
    .upload(path, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    console.error(`[upload] Upload failed:`, uploadError);
    throw new Error(uploadError.message);
  }

  console.log(`[upload] Upload succeeded, getting signed URL...`);

  const { data: signed, error: signedError } = await supabase.storage
    .from(STORAGE_BUCKETS.profilePhotos)
    .createSignedUrl(path, 60 * 60);

  if (signedError) {
    console.warn(`[upload] Signed URL failed:`, signedError);
    return { path, signedUrl: null };
  }

  console.log(`[upload] Done!`);
  return { path, signedUrl: signed?.signedUrl ?? null };
}

export function ProfileForm({
  initialProfile,
}: {
  initialProfile: InitialProfile;
}) {
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<PhotoType | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [gender, setGender] = useState<GenderType | null>(
    initialProfile.gender,
  );
  const [skinTone, setSkinTone] = useState<SkinTone | null>(
    initialProfile.skinTone,
  );
  const [bodyShape, setBodyShape] = useState<BodyShape | null>(
    initialProfile.bodyShape,
  );
  const [styleTags, setStyleTags] = useState<string[]>(
    initialProfile.styleTags,
  );
  const [climate, setClimate] = useState(initialProfile.climate);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialProfile.avatarUrl,
  );
  const [facePhoto, setFacePhoto] = useState({
    path: initialProfile.facePhotoPath,
    url: initialProfile.facePhotoUrl,
  });
  const [bodyPhoto, setBodyPhoto] = useState({
    path: initialProfile.bodyPhotoPath,
    url: initialProfile.bodyPhotoUrl,
  });

  const profileSummary = useMemo(() => {
    return [
      GENDERS.find((item) => item.value === gender)?.label,
      SKIN_TONES.find((item) => item.value === skinTone)?.label,
      BODY_SHAPES.find((item) => item.value === bodyShape)?.label,
    ].filter(Boolean);
  }, [bodyShape, gender, skinTone]);

  const handlePhotoUpload = useCallback(
    async (file: File, type: PhotoType) => {
      setError(null);
      setMessage(null);
      setUploading(type);

      try {
        const uploaded = await uploadPhoto(file, type);
        const displayUrl = uploaded.signedUrl;

        if (type === "avatar") {
          setAvatarUrl(displayUrl);
        } else if (type === "face") {
          setFacePhoto({ path: uploaded.path, url: displayUrl });
        } else {
          setBodyPhoto({ path: uploaded.path, url: displayUrl });
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Photo upload failed. Please try again.";
        setError(message);
        throw err;
      } finally {
        setUploading(null);
      }
    },
    [],
  );

  const toggleStyleTag = (tag: string) => {
    setStyleTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  const canSave = fullName.trim().length > 0 && gender && skinTone && bodyShape;

  const handleSave = () => {
    if (!gender || !skinTone || !bodyShape) {
      setError("Please complete the required profile fields.");
      return;
    }

    setError(null);
    setMessage(null);

    const payload: UpdateProfilePayload = {
      fullName,
      gender,
      skinTone,
      bodyShape,
      styleTags: styleTags as UpdateProfilePayload["styleTags"],
      climate,
      avatarUrl,
      facePhotoPath: facePhoto.path,
      bodyPhotoPath: bodyPhoto.path,
    };

    startTransition(async () => {
      const result = await updateProfile(payload);

      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage("Profile updated.");
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
      <Card className="glass-panel border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4" />
            Your profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col items-center text-center">
            <ProfilePhotoUpload
              value={avatarUrl}
              onUpload={(file) => handlePhotoUpload(file, "avatar")}
              onRemove={() => setAvatarUrl(null)}
              uploading={uploading === "avatar"}
              label="Profile Photo"
              hint="Shown in your account menu"
              shape="circle"
            />
            <div className="mt-4 space-y-1">
              <p className="text-lg font-semibold">{fullName || "Profile"}</p>
              {initialProfile.email ? (
                <p className="text-muted-foreground text-sm">
                  {initialProfile.email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-4" />
              <p className="text-sm font-medium">Recommendation signals</p>
            </div>
            {profileSummary.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileSummary.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Complete your profile so recommendations can feel personal.
              </p>
            )}
          </div>

          <Button
            type="button"
            size="lg"
            className="h-12 w-full"
            disabled={pending || uploading !== null || !canSave}
            onClick={handleSave}
          >
            {pending ? (
              "Saving..."
            ) : (
              <>
                <Save className="size-4" />
                Save profile
              </>
            )}
          </Button>

          {message ? (
            <p className="text-center text-sm text-emerald-700">{message}</p>
          ) : null}
          {error ? (
            <p className="text-destructive text-center text-sm">{error}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="glass-panel border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-4" />
              Basic information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="How should Fitly call you?"
                className="h-12 rounded-xl bg-white/35 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label>Gender</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {GENDERS.map((item) => (
                  <SelectableCard
                    key={item.value}
                    value={item.value}
                    selected={gender === item.value}
                    onSelect={(value) => setGender(value as GenderType)}
                    label={item.label}
                    className="min-h-14 py-3"
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-4" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Skin tone</Label>
              <div className="flex flex-wrap gap-1">
                {SKIN_TONES.map((item) => (
                  <SkinToneSwatch
                    key={item.value}
                    value={item.value}
                    selected={skinTone === item.value}
                    onSelect={(value) => setSkinTone(value as SkinTone)}
                    label={item.label}
                    color={item.color}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Body type</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {BODY_SHAPES.map((item) => (
                  <SelectableCard
                    key={item.value}
                    value={item.value}
                    selected={bodyShape === item.value}
                    onSelect={(value) => setBodyShape(value as BodyShape)}
                    label={item.label}
                    description={item.description}
                    className="min-h-20 py-3"
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="size-4" />
              AI outfit photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              These photos help Fitly tune silhouette and face-aware styling.
              They stay private in your profile photo storage.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <ProfilePhotoUpload
                value={facePhoto.url}
                onUpload={(file) => handlePhotoUpload(file, "face")}
                onRemove={() => setFacePhoto({ path: null, url: null })}
                uploading={uploading === "face"}
                label="Face Photo"
                hint="Clear front-facing"
                shape="rounded"
              />
              <ProfilePhotoUpload
                value={bodyPhoto.url}
                onUpload={(file) => handlePhotoUpload(file, "body")}
                onRemove={() => setBodyPhoto({ path: null, url: null })}
                uploading={uploading === "body"}
                label="Full Body"
                hint="Head to toe"
                shape="rounded"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudSun className="size-4" />
              Style and climate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <Label>Style preferences</Label>
              <div className="flex flex-wrap gap-2">
                {STYLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleStyleTag(tag)}
                    className="rounded-full"
                  >
                    <Badge
                      variant={styleTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5 capitalize"
                    >
                      {styleTags.includes(tag) ? (
                        <Check className="mr-1 size-3" />
                      ) : null}
                      {tag}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="climate">Climate / city</Label>
              <Input
                id="climate"
                value={climate}
                onChange={(event) => setClimate(event.target.value)}
                placeholder="e.g. Jakarta, hot and humid"
                className="h-12 rounded-xl bg-white/35 text-base"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
