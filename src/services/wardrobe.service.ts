import { SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_STORAGE,
  SUPABASE_TABLES,
} from "@/constants/supabase.constant";
import { WardrobeItem } from "@/types/database";

/**
 * Upload an image to the Wardrobe storage bucket
 */
export async function uploadImage(supabase: SupabaseClient, file: File, path: string) {
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
export async function getPublicUrl(supabase: SupabaseClient, path: string) {
  const { data } = supabase.storage
    .from(SUPABASE_STORAGE.WARDROBE)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Save a wardrobe item to the database
 */
export async function saveWardrobeItem(supabase: SupabaseClient, itemData: Omit<WardrobeItem, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.WARDROBE_ITEMS)
    .insert(itemData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save wardrobe item: ${error.message}`);
  }
  return data as WardrobeItem;
}

/**
 * Get wardrobe items for the logged-in user
 */
export async function getWardrobeItems(supabase: SupabaseClient) {
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
  return data as WardrobeItem[];
}
