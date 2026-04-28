"use client";

import { useState } from "react";
import {
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resizeImage, fileToBase64 } from "@/lib/image";
import { extractWardrobeMetadata } from "@/actions/extract-wardrobe-item";
import { saveWardrobeItem } from "@/actions/save-wardrobe-item";
import type { ExtractedWardrobeData } from "@/schemas/wardrobe.schema";
import { toast } from "sonner";
import { BRIGHTNESS_VALUES } from "@/constants/wardrobe-related.constant";

export function AddWardrobeForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] =
    useState<ExtractedWardrobeData | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Show preview immediately
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setFile(selectedFile);

    // Start extraction
    setIsAnalyzing(true);
    setExtractedData(null);

    try {
      // 1. Resize/Compress
      const resized = await resizeImage(selectedFile, 800);

      // 2. Convert to Base64
      const base64 = await fileToBase64(resized);

      // 3. Send to Server Action (LLM)
      const data = await extractWardrobeMetadata(base64);

      toast.success("AI finished analyzing your item!");
      setExtractedData(data);
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to analyze image. You can still enter details manually.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !extractedData) return;

    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("image", file); // Attach the actual image file

      await saveWardrobeItem(formData);
      // The action redirects on success, so no toast needed here unless desired.
    } catch (err) {
      console.error(err);
      toast.error("Failed to save item. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg bg-card/50 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="w-6 h-6 text-primary" />
          Add to Wardrobe
        </CardTitle>
        <CardDescription>
          Upload a photo of your clothing. Our AI will automatically extract the
          details.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upload Zone */}
        {!previewUrl ? (
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
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="flex gap-6">
            {/* Image Preview Area */}
            <div className="relative w-1/3 aspect-[3/4] rounded-xl overflow-hidden bg-muted border shadow-sm">
              <img
                src={previewUrl}
                alt="Preview"
                className="object-cover w-full h-full"
              />

              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center text-primary gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm font-medium animate-pulse">
                    AI is looking...
                  </span>
                </div>
              )}
              {!isAnalyzing && extractedData && (
                <div className="absolute top-2 right-2 bg-green-500/90 text-white p-1.5 rounded-full shadow-lg backdrop-blur-md">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Extracted Details Form */}
            <div className="flex-1">
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                  <Sparkles className="w-8 h-8 animate-pulse text-primary/50" />
                  <p>Extracting color, style, and category...</p>
                </div>
              ) : extractedData ? (
                <form
                  onSubmit={handleSave}
                  className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Item Name</Label>
                      <Input
                        name="name"
                        defaultValue={`${extractedData.color} ${extractedData.subcategory}`.trim()}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        name="category"
                        defaultValue={extractedData.category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "top",
                            "bottom",
                            "outerwear",
                            "shoes",
                            "accessory",
                            "bag",
                            "other",
                          ].map((c) => (
                            <SelectItem
                              key={c}
                              value={c}
                              className="capitalize"
                            >
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Subcategory (e.g. T-Shirt)</Label>
                      <Input
                        name="subcategory"
                        defaultValue={extractedData.subcategory}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Dominant Color</Label>
                      <div className="relative">
                        <Input
                          name="color"
                          defaultValue={extractedData.color}
                          className="pl-9"
                        />
                        <div
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border shadow-sm"
                          style={{
                            backgroundColor: extractedData.color
                              .toLowerCase()
                              .replace(" ", ""),
                          }} // simple visual fallback
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Brightness</Label>
                      <Select
                        name="brightness"
                        defaultValue={extractedData.brightness}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {BRIGHTNESS_VALUES.map((b) => (
                            <SelectItem
                              key={b}
                              value={b}
                              className="capitalize"
                            >
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Tags (Comma separated)</Label>
                      <Input
                        name="tags"
                        defaultValue={extractedData.tags.join(", ")}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPreviewUrl(null);
                        setExtractedData(null);
                      }}
                      className="w-full"
                      disabled={isSaving}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {isSaving ? "Saving..." : "Save Item"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Upload an image to start</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
