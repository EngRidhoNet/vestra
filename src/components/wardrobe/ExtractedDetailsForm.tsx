import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { ExtractedWardrobeData } from "@/schemas/wardrobe.schema";
import { BRIGHTNESS_VALUES } from "@/constants/wardrobe-related.constant";

interface ExtractedDetailsFormProps {
  extractedData: ExtractedWardrobeData;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

export function ExtractedDetailsForm({
  extractedData,
  isSaving,
  onSubmit,
  onReset,
}: ExtractedDetailsFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label>Item Name</Label>
          <Input
            name="name"
            defaultValue={`${extractedData.color} ${extractedData.subcategory}`.trim()}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select name="category" defaultValue={extractedData.category}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {[
                "top",
                "bottom",
                "outerwear",
                "shoes",
                "accessory",
                "bag",
                "other",
              ].map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Subcategory (e.g. T-Shirt)</Label>
          <Input name="subcategory" defaultValue={extractedData.subcategory} />
        </div>

        <div className="space-y-2">
          <Label>Dominant Color</Label>
          <div className="relative">
            <Input
              name="color"
              defaultValue={extractedData.color}
              className="pl-9"
            />
            <div
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border shadow-sm"
              style={{
                backgroundColor: extractedData.color
                  .toLowerCase()
                  .replace(" ", ""),
              }} // simple visual fallback
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Brightness</Label>
          <Select name="brightness" defaultValue={extractedData.brightness}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {BRIGHTNESS_VALUES.map((b) => (
                <SelectItem key={b} value={b} className="capitalize">
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 col-span-2">
          <Label>Tags (Comma separated)</Label>
          <Input name="tags" defaultValue={extractedData.tags.join(", ")} />
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {isSaving ? "Saving..." : "Save Item"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="w-full text-muted-foreground hover:text-destructive transition-colors"
          disabled={isSaving}
        >
          Reset and try again
        </Button>
      </div>
    </form>
  );
}
