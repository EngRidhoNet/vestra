"use server";

import { WardrobeAiService } from "@/services/wardrobe-ai.service";
import type { ExtractedWardrobeData } from "@/schemas/wardrobe.schema";

/**
 * Extracts wardrobe item metadata from a base64 encoded image using an LLM.
 * @param base64Image The base64 encoded image string (e.g., "data:image/jpeg;base64,...")
 */
export async function extractWardrobeMetadata(
  base64Image: string,
): Promise<ExtractedWardrobeData> {
  return await WardrobeAiService.extractWardrobeItem(base64Image);
}
