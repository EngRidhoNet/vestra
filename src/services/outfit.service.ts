import { createClient } from "@/lib/supabase/server";
import { SUPABASE_TABLES } from "@/constants/supabase.constant";

export class OutfitService {
  /**
   * Creates an outfit and links multiple items to it.
   * Handles the transaction logic of inserting into both 'outfits' and 'outfit_items'.
   */
  static async createOutfitWithItems({
    userId,
    name,
    occasion,
    itemIds,
  }: {
    userId: string;
    name: string;
    occasion: string;
    itemIds: string[];
  }) {
    const supabase = await createClient();

    // 1. Insert the outfit record
    const { data: outfit, error: outfitError } = await supabase
      .from(SUPABASE_TABLES.OUTFITS)
      .insert({
        user_id: userId,
        name: name,
        occasion: occasion,
      })
      .select()
      .single();

    if (outfitError) {
      throw new Error(`Failed to save outfit: ${outfitError.message}`);
    }

    // 2. Link items to the outfit (Junction table)
    const outfitItemRecords = itemIds.map((itemId) => ({
      outfit_id: outfit.id,
      item_id: itemId,
    }));

    const { error: itemsError } = await supabase
      .from(SUPABASE_TABLES.OUTFIT_ITEMS)
      .insert(outfitItemRecords);

    if (itemsError) {
      throw new Error(`Failed to save outfit items: ${itemsError.message}`);
    }

    return outfit;
  }
}
