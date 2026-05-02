"use server";

import { createClient } from "@/lib/supabase/server";
import { getWardrobeItems, getWardrobeItemById, getSignedUrl } from "@/services/wardrobe.service";
import { recommendOutfit } from "@/services/outfit-ai.service";
import { sendChatText } from "@/lib/api-clients/openrouter.client";
import { OutfitService } from "@/services/outfit.service";

export async function generateOutfitAction(seedItemId: string) {
  try {
    const supabase = await createClient();
    
    // 1. Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Fetch data via Services
    const seedItem = await getWardrobeItemById(supabase, seedItemId);
    const allItems = await getWardrobeItems(supabase);
    
    const availableItems = allItems.filter(item => item.id !== seedItemId);

    if (availableItems.length === 0) {
      return { 
        success: false, 
        error: "Not enough items in your wardrobe to create an outfit." 
      };
    }

    // 3. Coordinate AI Service
    const recommendation = await recommendOutfit(
      sendChatText,
      seedItem,
      availableItems
    );

    // 4. Save via Domain Service
    const outfit = await OutfitService.createOutfitWithItems({
      userId: user.id,
      name: recommendation.title,
      occasion: "Everyday",
      itemIds: [seedItemId, ...recommendation.recommendedItemIds],
    });

    const selectedItems = [seedItem, ...availableItems.filter(i => recommendation.recommendedItemIds.includes(i.id))];
    const itemsWithUrls = await Promise.all(
      selectedItems.map(async (item) => {
        if (!item.image_path) return { ...item, imageUrl: null };
        const imageUrl = await getSignedUrl(supabase, item.image_path);
        return { ...item, imageUrl };
      })
    );

    return { 
      success: true, 
      data: {
        outfitId: outfit.id,
        title: recommendation.title,
        reasoning: recommendation.reasoning,
        outfitType: recommendation.outfitType,
        suggestedMissingItems: recommendation.suggestedMissingItems || [],
        items: itemsWithUrls
      } 
    };

  } catch (error: any) {
    console.error("Generate Outfit Action Error:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}

