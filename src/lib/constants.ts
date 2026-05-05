import {
  ACCEPTED_IMAGE_TYPES,
  APP_NAME,
  APP_TAGLINE,
  MAX_UPLOAD_BYTES,
} from "@/constants/general.constant";
import {
  BODY_SHAPES,
  BRIGHTNESS_VALUES,
  GENDERS,
  ITEM_CATEGORIES,
  SEASONS,
  SKIN_TONES,
  STYLE_TAGS,
} from "@/constants/wardrobe-related.constant";
import {
  OPENROUTER_BASE_URL,
  OPENROUTER_MODELS,
} from "@/constants/openrouter.constant";
import {
  SUPABASE_STORAGE,
  SUPABASE_TABLES,
} from "@/constants/supabase.constant";

export {
  ACCEPTED_IMAGE_TYPES,
  APP_NAME,
  APP_TAGLINE,
  MAX_UPLOAD_BYTES,
  BODY_SHAPES,
  BRIGHTNESS_VALUES,
  GENDERS,
  ITEM_CATEGORIES,
  SEASONS,
  SKIN_TONES,
  STYLE_TAGS,
  OPENROUTER_BASE_URL,
  OPENROUTER_MODELS,
  SUPABASE_STORAGE,
  SUPABASE_TABLES,
};

export const STORAGE_BUCKETS = {
  wardrobe: SUPABASE_STORAGE.WARDROBE,
  profilePhotos: SUPABASE_STORAGE.PROFILES_PHOTO,
} as const;
