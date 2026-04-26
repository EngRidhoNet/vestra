"use server";

import { z } from "zod";
import { env } from "@/lib/env";
import { ItemCategory } from "@/types/database";

export const extractWardrobeSchema = z.object({
  category: z.enum([
    "top",
    "bottom",
    "outerwear",
    "shoes",
    "accessory",
    "bag",
    "other",
  ]) as z.ZodType<ItemCategory>,
  subcategory: z.string().describe("e.g., T-shirt, Jeans, Jacket, Sneakers"),
  color: z.string().describe("Dominant color, e.g., Navy Blue, Olive Green"),
  brightness: z.enum(["light", "medium", "dark"]),
  material: z.string().optional().describe("e.g., Cotton, Denim, Leather"),
  brand: z.string().optional(),
  season: z.array(z.string()).describe("e.g., summer, winter, all-season, spring, fall"),
  tags: z.array(z.string()).describe("e.g., casual, formal, streetwear, athletic"),
});

export type ExtractedWardrobeData = z.infer<typeof extractWardrobeSchema>;

/**
 * Extracts wardrobe item metadata from a base64 encoded image using an LLM.
 * @param base64Image The base64 encoded image string (e.g., "data:image/jpeg;base64,...")
 */
export async function extractWardrobeMetadata(
  base64Image: string
): Promise<ExtractedWardrobeData> {
  const prompt = `You are an expert fashion AI. Analyze the uploaded clothing image and extract the requested details.
Return ONLY a valid JSON object matching this exact schema:
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

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": env.NEXT_PUBLIC_APP_URL,
        "X-Title": "Fitly Web",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Excellent for vision tasks + JSON
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: base64Image },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Sometimes the LLM wraps the response in markdown code blocks even when told not to.
    if (content.startsWith("\`\`\`json")) {
      content = content.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
    } else if (content.startsWith("\`\`\`")) {
      content = content.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
    }

    const parsedJson = JSON.parse(content);
    
    // Validate against our Zod schema
    const validatedData = extractWardrobeSchema.parse(parsedJson);
    
    return validatedData;
  } catch (error) {
    console.error("Failed to extract wardrobe metadata:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to analyze image"
    );
  }
}
