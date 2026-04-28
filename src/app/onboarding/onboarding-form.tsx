"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  User,
  Palette,
  Camera,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ProfilePhotoUpload } from "@/components/onboarding/profile-photo-upload";
import {
  SelectableCard,
  SkinToneSwatch,
} from "@/components/onboarding/selectable-card";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/constants/general.constant";
import {
  GENDERS,
  SKIN_TONES,
  BODY_SHAPES,
  STYLE_TAGS,
} from "@/constants/wardrobe-related.constant";

import {
  completeOnboarding,
  type OnboardingPayload,
} from "@/actions/onboarding";
import { createClient } from "@/lib/supabase/client";
import type { GenderType, SkinTone, BodyShape } from "@/types/database";

const STEPS = ["Profile", "Appearance", "Photos", "Review"];

type PhotoState = {
  file: File | null;
  preview: string | null;
  path: string | null;
};

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/heic") return "heic";

  return "jpg";
}

import { uploadProfilePhotoAction } from "@/actions/upload";

async function uploadPhoto(
  base64Data: string,
  mimeType: string,
  type: "avatar" | "face" | "body",
): Promise<string> {
  const result = await uploadProfilePhotoAction(base64Data, mimeType, type);

  if (result.error) {
    throw new Error(result.error);
  }

  return result.path!;
}

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(defaultName);
  const [gender, setGender] = useState<GenderType | null>(null);
  const [skinTone, setSkinTone] = useState<SkinTone | null>(null);
  const [bodyShape, setBodyShape] = useState<BodyShape | null>(null);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [climate, setClimate] = useState("");

  const [avatar, setAvatar] = useState<PhotoState>({
    file: null,
    preview: null,
    path: null,
  });
  const [facePhoto, setFacePhoto] = useState<PhotoState>({
    file: null,
    preview: null,
    path: null,
  });
  const [bodyPhoto, setBodyPhoto] = useState<PhotoState>({
    file: null,
    preview: null,
    path: null,
  });
  const [uploading, setUploading] = useState<string | null>(null);

  const handlePhotoUpload = useCallback(
    async (
      base64Data: string,
      mimeType: string,
      type: "avatar" | "face" | "body",
      setter: React.Dispatch<React.SetStateAction<PhotoState>>,
    ) => {
      setter({ file: null, preview: base64Data, path: null });
      setUploading(type);
      try {
        const path = await uploadPhoto(base64Data, mimeType, type);
        setter((prev) => ({ ...prev, path }));
      } catch {
        setter({ file: null, preview: null, path: null });
        setError("Photo upload failed. Please try again.");
      } finally {
        setUploading(null);
      }
    },
    [],
  );

  const getSignedUrl = useCallback(async (path: string) => {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("profile-photos")
      .createSignedUrl(path, 300);
    return data?.signedUrl ?? null;
  }, []);

  const canProceed = (s: number): boolean => {
    switch (s) {
      case 0:
        return fullName.trim().length > 0 && gender !== null;
      case 1:
        return skinTone !== null && bodyShape !== null;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const next = () => {
    if (step < STEPS.length - 1 && canProceed(step)) {
      setError(null);
      setStep(step + 1);
    }
  };
  const back = () => {
    if (step > 0) {
      setError(null);
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (!gender || !skinTone || !bodyShape) return;

    setError(null);
    startTransition(async () => {
      const payload: OnboardingPayload = {
        fullName: fullName.trim(),
        gender,
        skinTone,
        bodyShape,
        styleTags: styleTags as OnboardingPayload["styleTags"],
        climate,
        avatarUrl: avatar.path
          ? await getSignedUrl(avatar.path).then((url) => url ?? avatar.path)
          : null,
        facePhotoPath: facePhoto.path ?? null,
        bodyPhotoPath: bodyPhoto.path ?? null,
      };

      const result = await completeOnboarding(payload);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    });
  };

  const toggleStyleTag = (tag: string) => {
    setStyleTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col px-4 pb-8 pt-6 sm:px-0">
      <div className="mb-8">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1">
          {step === 0 && (
            <StepBasicProfile
              fullName={fullName}
              onNameChange={setFullName}
              gender={gender}
              onGenderChange={setGender}
              avatar={avatar}
              onAvatarUpload={(b64, mime) =>
                handlePhotoUpload(b64, mime, "avatar", setAvatar)
              }
              onAvatarRemove={() =>
                setAvatar({ file: null, preview: null, path: null })
              }
              uploading={uploading === "avatar"}
            />
          )}

          {step === 1 && (
            <StepAppearance
              skinTone={skinTone}
              onSkinToneChange={setSkinTone}
              bodyShape={bodyShape}
              onBodyShapeChange={setBodyShape}
            />
          )}

          {step === 2 && (
            <StepPhotos
              facePhoto={facePhoto}
              bodyPhoto={bodyPhoto}
              onFaceUpload={(b64, mime) =>
                handlePhotoUpload(b64, mime, "face", setFacePhoto)
              }
              onBodyUpload={(b64, mime) =>
                handlePhotoUpload(b64, mime, "body", setBodyPhoto)
              }
              onFaceRemove={() =>
                setFacePhoto({ file: null, preview: null, path: null })
              }
              onBodyRemove={() =>
                setBodyPhoto({ file: null, preview: null, path: null })
              }
              uploadingFace={uploading === "face"}
              uploadingBody={uploading === "body"}
            />
          )}

          {step === 3 && (
            <StepReview
              fullName={fullName}
              gender={gender}
              skinTone={skinTone}
              bodyShape={bodyShape}
              styleTags={styleTags}
              climate={climate}
              avatarPreview={avatar.preview}
              facePreview={facePhoto.preview}
              bodyPreview={bodyPhoto.preview}
              onToggleStyleTag={toggleStyleTag}
              onClimateChange={setClimate}
              onEditStep={setStep}
            />
          )}
        </div>

        {error && (
          <p className="text-destructive mt-4 text-center text-sm">{error}</p>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={back}
              className="h-12 flex-1 rounded-xl text-base"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              size="lg"
              onClick={next}
              disabled={!canProceed(step)}
              className="h-12 flex-1 rounded-xl text-base"
            >
              Continue
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={handleSubmit}
              disabled={pending || !canProceed(step)}
              className="h-12 flex-1 rounded-xl text-base"
            >
              {pending ? (
                "Saving..."
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBasicProfile({
  fullName,
  onNameChange,
  gender,
  onGenderChange,
  avatar,
  onAvatarUpload,
  onAvatarRemove,
  uploading,
}: {
  fullName: string;
  onNameChange: (v: string) => void;
  gender: GenderType | null;
  onGenderChange: (v: GenderType) => void;
  avatar: PhotoState;
  onAvatarUpload: (base64Data: string, mimeType: string) => Promise<void>;
  onAvatarRemove: () => void;
  uploading: boolean;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <User className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Let&apos;s start with the basics
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Tell us a bit about yourself
        </p>
      </div>

      <div className="flex justify-center">
        <ProfilePhotoUpload
          value={avatar.preview}
          onUpload={onAvatarUpload}
          onRemove={onAvatarRemove}
          uploading={uploading}
          label="Profile Photo"
          hint="Optional"
          shape="circle"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Your name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="How should we call you?"
          className="h-12 rounded-xl text-base"
        />
      </div>

      <div className="space-y-3">
        <Label>Gender</Label>
        <div className="grid grid-cols-3 gap-2">
          {GENDERS.map((g: any) => (
            <SelectableCard
              key={g.value}
              value={g.value}
              selected={gender === g.value}
              onSelect={(v) => onGenderChange(v as GenderType)}
              label={g.label}
              className="py-3"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepAppearance({
  skinTone,
  onSkinToneChange,
  bodyShape,
  onBodyShapeChange,
}: {
  skinTone: SkinTone | null;
  onSkinToneChange: (v: SkinTone) => void;
  bodyShape: BodyShape | null;
  onBodyShapeChange: (v: BodyShape) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Palette className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Your appearance
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Helps us recommend colors and fits that look great on you
        </p>
      </div>

      <div className="space-y-3">
        <Label>Skin Tone</Label>
        <div className="flex flex-wrap justify-center gap-1">
          {SKIN_TONES.map((t: any) => (
            <SkinToneSwatch
              key={t.value}
              value={t.value}
              selected={skinTone === t.value}
              onSelect={(v) => onSkinToneChange(v as SkinTone)}
              label={t.label}
              color={t.color}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Body Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {BODY_SHAPES.map((b: any) => (
            <SelectableCard
              key={b.value}
              value={b.value}
              selected={bodyShape === b.value}
              onSelect={(v) => onBodyShapeChange(v as BodyShape)}
              label={b.label}
              description={b.description}
              className="py-3"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepPhotos({
  facePhoto,
  bodyPhoto,
  onFaceUpload,
  onBodyUpload,
  onFaceRemove,
  onBodyRemove,
  uploadingFace,
  uploadingBody,
}: {
  facePhoto: PhotoState;
  bodyPhoto: PhotoState;
  onFaceUpload: (base64Data: string, mimeType: string) => Promise<void>;
  onBodyUpload: (base64Data: string, mimeType: string) => Promise<void>;
  onFaceRemove: () => void;
  onBodyRemove: () => void;
  uploadingFace: boolean;
  uploadingBody: boolean;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Camera className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          AI outfit preparation
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          These photos help our AI generate personalized outfit suggestions
        </p>
      </div>

      <div className="bg-muted/30 rounded-2xl p-4 text-center">
        <p className="text-muted-foreground text-xs">
          Your photos are stored securely and only used for generating outfit
          recommendations. You can skip this step and add them later.
        </p>
      </div>

      <div className="flex justify-center gap-6">
        <ProfilePhotoUpload
          value={facePhoto.preview}
          onUpload={onFaceUpload}
          onRemove={onFaceRemove}
          uploading={uploadingFace}
          label="Face Photo"
          hint="Clear front-facing"
          shape="rounded"
        />
        <ProfilePhotoUpload
          value={bodyPhoto.preview}
          onUpload={onBodyUpload}
          onRemove={onBodyRemove}
          uploading={uploadingBody}
          label="Full Body"
          hint="Head to toe"
          shape="rounded"
        />
      </div>
    </div>
  );
}

function StepReview({
  fullName,
  gender,
  skinTone,
  bodyShape,
  styleTags,
  climate,
  avatarPreview,
  facePreview,
  bodyPreview,
  onToggleStyleTag,
  onClimateChange,
  onEditStep,
}: {
  fullName: string;
  gender: GenderType | null;
  skinTone: SkinTone | null;
  bodyShape: BodyShape | null;
  styleTags: string[];
  climate: string;
  avatarPreview: string | null;
  facePreview: string | null;
  bodyPreview: string | null;
  onToggleStyleTag: (tag: string) => void;
  onClimateChange: (v: string) => void;
  onEditStep: (step: number) => void;
}) {
  const genderLabel =
    GENDERS.find((g: any) => g.value === gender)?.label ?? "—";
  const skinLabel =
    SKIN_TONES.find((t: any) => t.value === skinTone)?.label ?? "—";

  const bodyLabel =
    BODY_SHAPES.find((b: any) => b.value === bodyShape)?.label ?? "—";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Review your profile
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Almost done! Review and finalize your details.
        </p>
      </div>

      <div className="divide-border divide-y rounded-2xl border">
        <ReviewRow label="Name" value={fullName} onEdit={() => onEditStep(0)} />
        <ReviewRow
          label="Gender"
          value={genderLabel}
          onEdit={() => onEditStep(0)}
        />
        <ReviewRow
          label="Skin Tone"
          value={skinLabel}
          onEdit={() => onEditStep(1)}
        />
        <ReviewRow
          label="Body Type"
          value={bodyLabel}
          onEdit={() => onEditStep(1)}
        />
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <span className="text-muted-foreground text-xs">Photos</span>
            <div className="mt-1 flex gap-2">
              {avatarPreview && (
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src={avatarPreview}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              {facePreview && (
                <div className="relative h-10 w-8 overflow-hidden rounded-lg">
                  <Image
                    src={facePreview}
                    alt="Face"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              {bodyPreview && (
                <div className="relative h-10 w-8 overflow-hidden rounded-lg">
                  <Image
                    src={bodyPreview}
                    alt="Body"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              {!avatarPreview && !facePreview && !bodyPreview && (
                <span className="text-muted-foreground text-sm">
                  No photos added
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-primary text-xs font-medium"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Style preferences (optional)</Label>
        <p className="text-muted-foreground text-xs">
          Pick any that resonate. You can change this later.
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLE_TAGS.map((tag: string) => (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleStyleTag(tag)}
            >
              <Badge
                variant={styleTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer capitalize"
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="climate">Climate / city (optional)</Label>
        <Input
          id="climate"
          value={climate}
          onChange={(e) => onClimateChange(e.target.value)}
          placeholder="e.g. Jakarta — hot and humid"
          className="h-12 rounded-xl text-base"
        />
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <span className="text-muted-foreground text-xs">{label}</span>
        <p className="text-sm font-medium">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-primary text-xs font-medium"
      >
        Edit
      </button>
    </div>
  );
}
