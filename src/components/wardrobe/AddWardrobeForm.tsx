"use client";

import { useState } from "react";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resizeImage, fileToBase64 } from "@/lib/image";
import { extractWardrobeMetadata } from "@/actions/extract-wardrobe-item";
import { saveWardrobeItem } from "@/actions/save-wardrobe-item";
import type { ExtractedWardrobeData } from "@/schemas/wardrobe.schema";
import { toast } from "sonner";
import { ImageUploadZone } from "./ImageUploadZone";
import { ExtractedDetailsForm } from "./ExtractedDetailsForm";

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
      const resized = await resizeImage(selectedFile, 800);
      const base64 = await fileToBase64(resized);
      const response = await extractWardrobeMetadata(base64);

      if (!response.success) {
        throw new Error(response.error);
      }

      toast.success("AI finished analyzing your item!");
      setExtractedData(response.data);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.message ||
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

      const result = await saveWardrobeItem(formData);

      if (result && !result.success) {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save item. Please try again.");
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setExtractedData(null);
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
        {!previewUrl ? (
          <ImageUploadZone onFileChange={handleFileChange} />
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

            {/* Extracted Details Form Area */}
            <div className="flex-1">
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                  <Sparkles className="w-8 h-8 animate-pulse text-primary/50" />
                  <p>Extracting color, style, and category...</p>
                </div>
              ) : extractedData ? (
                <ExtractedDetailsForm
                  extractedData={extractedData}
                  isSaving={isSaving}
                  onSubmit={handleSave}
                  onReset={handleReset}
                />
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
