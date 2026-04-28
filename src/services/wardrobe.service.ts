import { createClient } from "@/lib/supabase/server";
import {
  SUPABASE_STORAGE,
  SUPABASE_TABLES,
} from "@/constants/supabase.constant";

/**
 * The Domain Service for Wardrobe Database Operations.
 * Job: Handles data access logic (inserting/fetching wardrobes).
 */
export class WardrobeService {
  /**
   * Upload an image to the Wardrobe storage bucket
   */
  static async uploadImage(file: File, path: string) {
    const supabase = await createClient(); // The infrastructure connection

    const { data, error } = await supabase.storage
      .from(SUPABASE_STORAGE.WARDROBE)
      .upload(path, file);

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    return data;
  }

  /**
   * Get a public URL for an uploaded file
   */
  static async getPublicUrl(path: string) {
    const supabase = await createClient();
    const { data } = supabase.storage
      .from(SUPABASE_STORAGE.WARDROBE)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Save a wardrobe item to the database
   */
  static async saveWardrobeItem(itemData: any) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WARDROBE_ITEMS)
      .insert(itemData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save wardrobe item: ${error.message}`);
    }
    return data;
  }

  /**
   * Get wardrobe items for the logged-in user
   */
  static async getWardrobeItems() {
    const supabase = await createClient();

    // Auth logic could also eventually move to an AuthService, but this is fine here for now.
    const userResult = await supabase.auth.getUser();
    const userId = userResult.data.user?.id;

    if (!userId) {
      throw new Error("User is not authenticated");
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WARDROBE_ITEMS)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get wardrobe items: ${error.message}`);
    }
    return data;
  }
}
