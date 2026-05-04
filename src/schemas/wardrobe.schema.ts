import { z } from "zod";
import { ItemCategory, Brightness } from "@/types/database";

export const extractWardrobeSchema = z.object({
  category: z.enum([
    "top",
    "bottom",
    "outerwear",
    "shoes",
    "accessory",
    "bag",
    "other",
  ]).catch("other") as z.ZodType<ItemCategory>,

  subcategory: z.string().catch("").describe("e.g., T-shirt, Jeans, Jacket, Sneakers"),
  color: z.string().catch("").describe("Dominant color, e.g., Navy Blue, Olive Green"),
  brightness: z.enum(["light", "medium", "dark"]).catch("medium"),

  material: z.string().optional().nullable().catch("").describe("e.g., Cotton, Denim, Leather"),
  brand: z.string().optional().nullable().catch(""),
  season: z.array(z.string()).catch([]).describe("e.g., summer, winter, all-season, spring, fall"),
  tags: z.array(z.string()).catch([]).describe("e.g., casual, formal, streetwear, athletic"),
});


export type ExtractedWardrobeData = z.infer<typeof extractWardrobeSchema>;

export const saveWardrobeSchema = z.object({
  name: z.string().min(1),
  category: z.string() as z.ZodType<ItemCategory>,
  subcategory: z.string().optional(),
  color: z.string().optional(),
  brightness: z.string().optional() as z.ZodType<Brightness | undefined>,
  tags: z.string().optional(),
});
