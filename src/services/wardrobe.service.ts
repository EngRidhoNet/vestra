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
 * Get a signed URL for an uploaded file
 */
export async function getSignedUrl(supabase: SupabaseClient, path: string) {
  const { data, error } = await supabase.storage
    .from(SUPABASE_STORAGE.WARDROBE)
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    console.error("Failed to get signed URL:", error);
    return null;
  }

  return data.signedUrl;
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

/**
 * Get a single wardrobe item by ID
 */
export async function getWardrobeItemById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.WARDROBE_ITEMS)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to get wardrobe item: ${error.message}`);
  }
  return data as WardrobeItem;
}
