"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/constants/general.constant";

type UploadZoneProps = {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  className?: string;
  label?: string;
  hint?: string;
};

export function UploadZone({
  onFiles,
  multiple = true,
  className,
  label = "Drop photos here or click to upload",
  hint = "JPG, PNG, WebP up to 8MB",
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const valid: File[] = [];
      for (const file of Array.from(fileList)) {
        if (
          !ACCEPTED_IMAGE_TYPES.includes(
            file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
          )
        )
          continue;
        if (file.size > MAX_UPLOAD_BYTES) continue;
        valid.push(file);
      }
      if (valid.length) onFiles(valid);
    },
    [onFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      className={cn(
        "glass-subtle flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center transition",
        "hover:border-foreground/20 hover:bg-card/70",
        dragging && "border-foreground/30 bg-card/80",
        className,
      )}
    >
      <div className="bg-muted text-muted-foreground mb-3 flex h-11 w-11 items-center justify-center rounded-full">
        <Upload className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
    </div>
  );
}
