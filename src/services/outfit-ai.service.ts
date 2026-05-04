import { WardrobeItem } from "@/types/database";
import {
  OutfitRecommendation,
  outfitRecommendationSchema,
} from "@/schemas/outfit.schema";

export async function recommendOutfit(
  sendChatFn: (prompt: string) => Promise<string>,
  seedItem: WardrobeItem,
  availableItems: WardrobeItem[],
): Promise<OutfitRecommendation> {
  const prompt = `
You are a professional fashion stylist AI. 
The user wants to build an outfit around a specific seed item.

SEED ITEM:
- ID: ${seedItem.id}
- Name: ${seedItem.name}
- Category: ${seedItem.category}
- Subcategory: ${seedItem.subcategory || "N/A"}
- Color: ${seedItem.color || "N/A"}
- Brightness: ${seedItem.brightness || "N/A"}
- Tags: ${seedItem.tags.join(", ")}

AVAILABLE WARDROBE ITEMS:
${availableItems.length > 0 ? availableItems
  .map(
    (item) =>
      `- [ID: ${item.id}] ${item.category} | ${item.color} ${item.name} (${
        item.subcategory || "N/A"
      }) | Tags: ${item.tags.join(", ")}`,
  )
  .join("\n") : "None"}

YOUR TASK:
1. Attempt to select 1 to 3 items from the AVAILABLE WARDROBE ITEMS that complement the SEED ITEM to make a complete, stylish outfit (e.g. top + bottom + shoes). 
2. If the user has enough complementary items to build a complete outfit, set "outfitType" to "Wardrobe Match" and return their IDs in "recommendedItemIds". "suggestedMissingItems" should be empty.
3. If the user DOES NOT have the necessary items (for example, they only uploaded shirts and no pants/shoes), do your best with what they have. Set "outfitType" to "Style Suggestion". In "suggestedMissingItems", describe 1-2 generic items the user SHOULD wear to complete the look (e.g. "Beige Chinos").
4. Provide a catchy "title" for this outfit.
5. Provide a "reasoning" explaining why this combination works.

IMPORTANT: Return your response strictly as a JSON object matching this schema:
{
  "title": "String",
  "reasoning": "String",
  "outfitType": "Wardrobe Match" | "Style Suggestion",
  "recommendedItemIds": ["String (ID of item 1)", "String (ID of item 2)"],
  "suggestedMissingItems": [
    {
      "category": "String (e.g., bottom, shoes)",
      "description": "String (e.g., Beige Chinos)",
      "reason": "String (why it completes the look)"
    }
  ]
}
`;

  try {
    const rawResponse = await sendChatFn(prompt);
    
    // Clean up markdown code blocks if the model wrapped the JSON
    const cleanJsonString = rawResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanJsonString);

    const validation = outfitRecommendationSchema.safeParse(parsed);

    if (!validation.success) {
      console.error("AI Schema Validation Error:", validation.error);
      throw new Error("Invalid response format from AI styling engine.");
    }

    return validation.data;
  } catch (error) {
    console.error("AI Outfit Recommendation failed:", error);
    throw new Error("Failed to generate outfit recommendation.");
  }
}
