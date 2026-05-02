// Replace this file with generated types:
//   npx supabase gen types typescript --project-id <id> --schema public > src/types/database.ts
// For now we export a minimal manual shape so app code can typecheck without
// the generator having been run yet.

export type ItemCategory =
  | "top"
  | "bottom"
  | "outerwear"
  | "dress"
  | "shoes"
  | "accessory"
  | "bag"
  | "other";

export type Brightness =
  | "light" // terang/cerah (putih, pastel, kuning cerah)
  | "dark" // gelap (hitam, navy, burgundy tua)
  | "medium"; // menengah (warna netral/sedang)

export type GenderType = "male" | "female" | "prefer_not_to_say";

export type SkinTone =
  | "very_light"
  | "light"
  | "medium"
  | "tan"
  | "brown"
  | "dark"
  | "very_dark";

export type BodyShape =
  | "slim"
  | "athletic"
  | "average"
  | "curvy"
  | "plus_size"
  | "broad"
  | "petite";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  gender: GenderType | null;
  skin_tone: SkinTone | null;
  body_shape: BodyShape | null;
  face_photo_path: string | null;
  body_photo_path: string | null;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPreferences = {
  user_id: string;
  style_tags: string[];
  favorite_colors: string[];
  disliked_colors: string[];
  sizing: Record<string, string | number>;
  climate: string | null;
  timezone: string | null;
  updated_at: string;
};

export type WardrobeItem = {
  id: string;
  user_id: string;
  name: string;
  category: ItemCategory;
  subcategory: string | null;
  color: string | null;
  brand: string | null;
  material: string | null;
  season: string[];
  tags: string[];
  image_path: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
  brightness: Brightness | null;
};

export type Outfit = {
  id: string;
  user_id: string;
  name: string | null;
  occasion: string | null;
  created_at: string;
};

export type OutfitItem = {
  outfit_id: string;
  item_id: string;
};

export type Recommendation = {
  id: string;
  user_id: string;
  outfit_id: string | null;
  occasion: string | null;
  weather: Record<string, unknown> | null;
  reason: string | null;
  score: number | null;
  feedback: "like" | "dislike" | null;
  scheduled_for: string | null;
  created_at: string;
};
