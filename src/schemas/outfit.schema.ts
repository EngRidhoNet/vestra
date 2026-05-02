import { z } from "zod";

export const suggestedMissingItemSchema = z.object({
  category: z.string(),
  description: z.string(),
  reason: z.string(),
});

export const outfitRecommendationSchema = z.object({
  title: z.string(),
  reasoning: z.string(),
  outfitType: z.enum(["Wardrobe Match", "Style Suggestion"]),
  recommendedItemIds: z.array(z.string()),
  suggestedMissingItems: z.array(suggestedMissingItemSchema).optional(),
});

export type SuggestedMissingItem = z.infer<typeof suggestedMissingItemSchema>;
export type OutfitRecommendation = z.infer<typeof outfitRecommendationSchema>;
