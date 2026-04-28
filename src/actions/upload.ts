"use server";

import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";
import crypto from "crypto";

export async function uploadProfilePhotoAction(
  base64Data: string,
  mimeType: string,
  type: "avatar" | "face" | "body"
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not signed in" };
    }

    // Extract the base64 payload (remove the data:image/jpeg;base64, prefix)
    const base64String = base64Data.split(",")[1];
    if (!base64String) {
      return { error: "Invalid image data format" };
    }

    const buffer = Buffer.from(base64String, "base64");

    // Determine extension
    let ext = "jpg";
    if (mimeType === "image/png") ext = "png";
    if (mimeType === "image/webp") ext = "webp";
    if (mimeType === "image/heic") ext = "heic";

    const path = `${user.id}/${type}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.profilePhotos)
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadProfilePhotoAction] Upload error:", uploadError);
      return { error: uploadError.message };
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKETS.profilePhotos)
      .createSignedUrl(path, 60 * 60);

    return { 
      success: true, 
      path, 
      signedUrl: signed?.signedUrl ?? null 
    };
  } catch (error: any) {
    console.error("[uploadProfilePhotoAction] Exception:", error);
    return { error: error.message || "Failed to upload photo" };
  }
}
