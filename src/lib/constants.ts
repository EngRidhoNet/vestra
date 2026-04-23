export const APP_NAME = "Fitly";
export const APP_TAGLINE = "Your AI-powered daily outfit assistant.";

export const STORAGE_BUCKETS = {
  wardrobe: "wardrobe",
} as const;

export const ITEM_CATEGORIES = [
  "top",
  "bottom",
  "outerwear",
  "dress",
  "shoes",
  "accessory",
  "bag",
  "other",
] as const;

export const SEASONS = ["spring", "summer", "fall", "winter"] as const;

export const STYLE_TAGS = [
  "casual",
  "formal",
  "streetwear",
  "minimal",
  "sporty",
  "classic",
  "edgy",
  "bohemian",
] as const;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
] as const;
