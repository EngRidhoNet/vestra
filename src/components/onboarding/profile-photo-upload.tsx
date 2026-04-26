"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, X, RefreshCw } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";

type ProfilePhotoUploadProps = {
  value: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  uploading?: boolean;
  label: string;
  hint?: string;
  shape?: "circle" | "rounded";
  className?: string;
};

const COMPRESSED_IMAGE_TYPE = "image/jpeg";

function compressionProfile(shape: ProfilePhotoUploadProps["shape"]) {
  if (shape === "circle") {
    return { maxDimension: 640, quality: 0.72 };
  }

  return { maxDimension: 900, quality: 0.62 };
}

async function compressImage(
  file: File,
  {
    maxDimension,
    quality,
  }: {
    maxDimension: number;
    quality: number;
  },
) {
  if (file.type === "image/heic") {
    return file;
  }

  try {
    const image = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const largestSide = Math.max(image.width, image.height);
    const scale = Math.min(1, maxDimension / largestSide);
    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(image, 0, 0, width, height);
    image.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, COMPRESSED_IMAGE_TYPE, quality);
    });

    if (!blob) return file;

    return new File(
      [blob],
      file.name.replace(/\.[^.]+$/, "") + ".jpg",
      {
        type: COMPRESSED_IMAGE_TYPE,
        lastModified: Date.now(),
      },
    );
  } catch {
    return file;
  }
}

function uploadErrorMessage(err: unknown) {
  if (err instanceof Error && err.message) return err.message;
  if (err instanceof ProgressEvent) {
    return "Could not read this image. Please try a different photo.";
  }

  return "Upload failed. Try again.";
}

export function ProfilePhotoUpload({
  value,
  onUpload,
  onRemove,
  uploading = false,
  label,
  hint,
  shape = "rounded",
  className,
}: ProfilePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = preview ?? value;

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (
        !ACCEPTED_IMAGE_TYPES.includes(
          file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
        )
      ) {
        setError("Please upload JPG, PNG, WebP, or HEIC");
        return;
      }

      // Read file from disk IMMEDIATELY to prevent stale references.
      // Page re-renders (Fast Refresh, ECONNRESET) can invalidate the
      // original File handle, so we create an in-memory copy first.
      let memFile: File;
      try {
        const buffer = await file.arrayBuffer();
        memFile = new File([buffer], file.name, {
          type: file.type,
          lastModified: file.lastModified,
        });
      } catch {
        setError("Could not read this image. Please try selecting it again.");
        return;
      }

      try {
        const uploadFile = await compressImage(memFile, compressionProfile(shape));

        if (uploadFile.size > MAX_UPLOAD_BYTES) {
          setError("Image must be under 8MB after compression");
          return;
        }

        await onUpload(uploadFile);
      } catch (err) {
        setPreview(null);
        setError(uploadErrorMessage(err));
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onUpload, shape],
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    setError(null);
    onRemove();
    if (inputRef.current) inputRef.current.value = "";
  }, [onRemove]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "relative flex items-center justify-center overflow-hidden border-2 border-dashed transition-all",
            "hover:border-foreground/20 hover:bg-muted/50",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            shape === "circle"
              ? "h-28 w-28 rounded-full"
              : "h-44 w-32 rounded-2xl",
            displayUrl
              ? "border-transparent"
              : "border-muted-foreground/20 bg-muted/30",
            uploading && "opacity-60",
          )}
        >
          {displayUrl ? (
            displayUrl.startsWith("blob:") || displayUrl.startsWith("data:") ? (
              <span
                role="img"
                aria-label={label}
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${displayUrl})` }}
              />
            ) : (
              <Image
                src={displayUrl}
                alt={label}
                fill
                className="object-cover"
                unoptimized
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Camera className="text-muted-foreground h-6 w-6" />
              <span className="text-muted-foreground text-xs font-medium">
                {uploading ? "Uploading..." : "Add Photo"}
              </span>
            </div>
          )}
        </button>

        {displayUrl && !uploading && (
          <div className="absolute -top-1 -right-1 flex gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-background flex h-7 w-7 items-center justify-center rounded-full shadow-md transition hover:scale-105"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground flex h-7 w-7 items-center justify-center rounded-full shadow-md transition hover:scale-105"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium">{label}</p>
        {hint && (
          <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>
        )}
        {error && <p className="text-destructive mt-0.5 text-xs">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
