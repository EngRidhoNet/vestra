import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  STORAGE_BUCKETS,
} from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

const validTypes = ["avatar", "face", "body"] as const;

function isValidPhotoType(type: string): type is (typeof validTypes)[number] {
  return validTypes.includes(type as (typeof validTypes)[number]);
}

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/heic") return "heic";

  return "jpg";
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file || !type) {
      return NextResponse.json(
        { error: "File and type are required" },
        { status: 400 },
      );
    }

    if (!isValidPhotoType(type)) {
      return NextResponse.json(
        { error: "Invalid photo type" },
        { status: 400 },
      );
    }

    if (
      !ACCEPTED_IMAGE_TYPES.includes(
        file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
      )
    ) {
      return NextResponse.json(
        { error: "Unsupported image format" },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 8MB)" },
        { status: 400 },
      );
    }

    const ext = extensionFor(file);
    const path = `${user.id}/${type}/${crypto.randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.profilePhotos)
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 },
      );
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKETS.profilePhotos)
      .createSignedUrl(path, 60 * 60);

    if (signedError) {
      return NextResponse.json(
        {
          error: `Photo uploaded, but preview URL could not be created: ${signedError.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ path, signedUrl: signed?.signedUrl ?? null });
  } catch (err) {
    console.error("[upload-profile-photo] Unexpected error:", err);
    const message =
      err instanceof Error ? err.message : "Upload failed unexpectedly";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
