"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { generateOutfitAction } from "@/actions/generate-outfit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface GenerateOutfitButtonProps {
  seedItemId: string;
}

export function GenerateOutfitButton({
  seedItemId,
}: GenerateOutfitButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await generateOutfitAction(seedItemId);
      if (!response.success) {
        throw new Error(response.error);
      }
      setResult(response.data);
      setIsDialogOpen(true);
      toast.success("Outfit curated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate outfit.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 bg-primary"
      >
        {isGenerating ? (
          <Loader2 className="h-5 w-5 mr-3 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5 mr-3 fill-primary-foreground/20" />
        )}
        {isGenerating ? "Curating Outfit..." : "Find Outfits with this Item"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl sm:rounded-3xl">
          <DialogHeader className="space-y-4">
            {result?.outfitType === "Style Suggestion" && (
              <Badge
                variant="secondary"
                className="w-fit bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20"
              >
                <Sparkle className="w-3 h-3 mr-1" />
                Style Suggestion
              </Badge>
            )}
            {result?.outfitType === "Wardrobe Match" && (
              <Badge
                variant="secondary"
                className="w-fit bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
              >
                Wardrobe Match
              </Badge>
            )}
            <div>
              <DialogTitle className="text-3xl font-bold tracking-tight">
                {result?.title}
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                {result?.reasoning}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="py-6">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Items in this Outfit
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {/* Owned Items */}
              {result?.items?.map((item: any) => (
                <div key={item.id} className="flex flex-col gap-3 group">
                  <div className="bg-muted aspect-[3/4] rounded-2xl border border-border/50 relative overflow-hidden shadow-sm transition-transform group-hover:scale-[1.02]">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50 italic text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="px-1">
                    <p className="font-semibold text-sm truncate leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
                      {item.category}
                    </p>
                  </div>
                </div>
              ))}

              {/* Suggested / Missing Items (Phantom Cards) */}
              {result?.suggestedMissingItems?.map(
                (missingItem: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 group opacity-80"
                  >
                    <div className="bg-transparent aspect-[3/4] rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors group-hover:border-primary/40 bg-primary/5">
                      <Sparkle className="w-6 h-6 text-primary/30 mb-2" />
                      <p className="text-[10px] text-primary/60 font-bold uppercase tracking-tighter text-center">
                        Suggestion
                      </p>
                    </div>
                    <div className="px-1">
                      <p className="font-semibold text-sm text-primary/80 truncate leading-tight">
                        {missingItem.description}
                      </p>
                      <p className="text-[10px] text-primary/50 uppercase tracking-widest font-bold mt-1">
                        {missingItem.category}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-between items-center bg-transparent border-none mt-2">
            <DialogClose asChild>
              <Button variant="ghost" className="rounded-full">
                Close
              </Button>
            </DialogClose>
            <Button
              className="rounded-full px-8 shadow-md"
              onClick={() => {
                toast.info("Image Generation coming in Phase 2!");
                setIsDialogOpen(false);
              }}
            >
              Visualize Outfit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
