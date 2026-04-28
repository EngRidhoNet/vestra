import { OpenRouterClient } from "@/lib/api-clients/openrouter.client";
import { extractWardrobeSchema } from "@/schemas/wardrobe.schema";

/**
 * The Domain Service for AI Wardrobe interactions.
 * Job: Handles AI business logic and prompts.
 */
export class WardrobeAiService {
  static async extractWardrobeItem(imageBase64: string) {
    const prompt = `
You are an expert fashion AI. 
Analyze the uploaded clothing item. Return ONLY a valid JSON object matching this exact schema:
{
  "category": "top" | "bottom" | "outerwear" | "shoes" | "accessory" | "bag" | "other",
  "subcategory": "string (e.g., T-shirt, Jeans, Jacket, Sneakers)",
  "color": "string (Dominant color)",
  "brightness": "light" | "medium" | "dark",
  "material": "string (optional, guess if possible e.g., Cotton, Denim, Leather)",
  "brand": "string (optional, only if a logo is clearly visible)",
  "season": ["string (e.g., summer, winter, all-season)"],
  "tags": ["string (e.g., casual, formal, streetwear, athletic)"]
}
Do not include markdown code blocks, just raw JSON.`;

    const rawResponse = await OpenRouterClient.sendChatWithImage(
      prompt,
      imageBase64,
    );

    try {
      // trim first
      let cleanedResponse = rawResponse.trim();

      // Sometimes the LLM wraps the response in markdown code blocks even when told not to.
      if (cleanedResponse.startsWith("\`\`\`json")) {
        cleanedResponse = cleanedResponse
          .replace(/^\`\`\`json/, "")
          .replace(/\`\`\`$/, "")
          .trim();
      } else if (cleanedResponse.startsWith("\`\`\`")) {
        cleanedResponse = cleanedResponse
          .replace(/^\`\`\`/, "")
          .replace(/\`\`\`$/, "")
          .trim();
      }

      // JSON parse
      const parsedData = JSON.parse(cleanedResponse);

      // Validate against our Zod schema
      const validatedData = extractWardrobeSchema.parse(parsedData);

      return validatedData;
    } catch (error) {
      console.error("Failed to extract wardrobe metadata:", error);
      throw new Error("Failed to parse AI response into valid JSON metadata.");
    }
  }

  static async getRecommendedOutfit() {}

  static async generateOutfitImage() {}
}
