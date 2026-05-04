import { UploadCloud } from "lucide-react";

interface ImageUploadZoneProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploadZone({ onFileChange }: ImageUploadZoneProps) {
  return (
    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer bg-muted/20 border-muted-foreground/30 hover:bg-muted/40 transition-colors group relative overflow-hidden">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <div className="p-4 rounded-full bg-primary/10 mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            Click to upload
          </span>{" "}
          or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, or WebP
        </p>
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={onFileChange}
      />
    </label>
  );
}
