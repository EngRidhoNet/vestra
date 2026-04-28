"use server";

import { extractWardrobeItem } from "@/services/wardrobe-ai.service";
import { sendChatWithImage } from "@/lib/api-clients/openrouter.client";
import type { ExtractedWardrobeData } from "@/schemas/wardrobe.schema";

export type ExtractWardrobeResponse = 
  | { success: true; data: ExtractedWardrobeData }
  | { success: false; error: string };

/**
 * Extracts wardrobe item metadata from a base64 encoded image using an LLM.
 * @param base64Image The base64 encoded image string (e.g., "data:image/jpeg;base64,...")
 */
export async function extractWardrobeMetadata(
  base64Image: string,
): Promise<ExtractWardrobeResponse> {
  try {
    const data = await extractWardrobeItem(base64Image, sendChatWithImage);
    return { success: true, data };
  } catch (error: any) {
    console.error("AI Extraction Action Error:", error);
    return { success: false, error: error.message || "Failed to extract data" };
  }
}
