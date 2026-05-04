"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveWardrobeSchema } from "@/schemas/wardrobe.schema";
import { uploadImage, saveWardrobeItem as saveWardrobeItemService } from "@/services/wardrobe.service";

export async function saveWardrobeItem(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Extract file
    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "Image file is required" };
    }

    // Parse fields
    const parsed = saveWardrobeSchema.safeParse({
      name: formData.get("name"),
      category: formData.get("category"),
      subcategory: formData.get("subcategory"),
      color: formData.get("color"),
      brightness: formData.get("brightness"),
      tags: formData.get("tags"),
    });

    if (!parsed.success) {
      console.error("Validation error:", parsed.error);
      return { success: false, error: "Invalid form data" };
    }

    const { name, category, subcategory, color, brightness, tags } = parsed.data;

    // Clean up tags
    const tagsArray = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // Upload image via Service
    const fileExt = file.name.split(".").pop() || "webp";
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    await uploadImage(supabase, file, filePath);

    // Insert to Database via Service
    await saveWardrobeItemService(supabase, {
      user_id: user.id,
      name,
      category,
      subcategory: subcategory || null,
      color: color || null,
      brightness: brightness || null,
      tags: tagsArray,
      image_path: filePath,
      archived: false,
      season: [],
      brand: null,
      material: null,
    });
  } catch (error: any) {
    console.error("Failed to save wardrobe item:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }

  // Revalidate cache and redirect
  revalidatePath("/wardrobe");
  redirect("/wardrobe");
}
