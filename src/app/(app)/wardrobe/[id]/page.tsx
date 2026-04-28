import { createClient } from "@/lib/supabase/server";
import { getWardrobeItemById, getSignedUrl } from "@/services/wardrobe.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  Info,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function WardrobeItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const item = await getWardrobeItemById(supabase, id);
    const imageUrl = item.image_path
      ? await getSignedUrl(supabase, item.image_path)
      : null;

    return (
      <div className="container max-w-5xl py-8 animate-in fade-in duration-500">
        {/* Navigation Actions */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            asChild
            className="-ml-2 hover:bg-transparent"
          >
            <Link href="/wardrobe" className="flex items-center gap-2 group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Wardrobe</span>
            </Link>
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="rounded-full px-4">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Image Preview */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-muted border shadow-2xl shadow-primary/5 ring-1 ring-border/50">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={item.name}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <p>No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Information */}
          <div className="lg:col-span-7 flex flex-col pt-4">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge
                  className="px-4 py-1 text-xs font-semibold uppercase tracking-wider rounded-full"
                  variant="secondary"
                >
                  {item.category}
                </Badge>
                {item.subcategory && (
                  <Badge
                    className="px-4 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary/5 text-primary border-primary/10"
                    variant="outline"
                  >
                    {item.subcategory}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <h1 className="text-5xl font-bold tracking-tight text-foreground/90">
                  {item.name}
                </h1>
                <div className="flex items-center gap-3 text-xl text-muted-foreground">
                  <span className="capitalize">{item.color}</span>
                  {item.brightness && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <span className="capitalize">{item.brightness} Tone</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
              <div className="p-5 rounded-3xl bg-card/50 border border-border/50 backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary/60" />
                  <span>Added on</span>
                </div>
                <p className="text-lg font-semibold tracking-tight">
                  {format(new Date(item.created_at), "MMMM d, yyyy")}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-card/50 border border-border/50 backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <Tag className="h-4 w-4 text-primary/60" />
                  <span>Subcategory</span>
                </div>
                <p className="text-lg font-semibold tracking-tight capitalize">
                  {item.subcategory || "Not specified"}
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Tags & Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.tags && item.tags.length > 0 ? (
                  item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 rounded-2xl bg-muted/50 text-foreground/80 text-sm font-medium border border-border/50 hover:bg-muted transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No tags associated with this item.
                  </p>
                )}
              </div>
            </div>

            {/* AI Action CTA */}
            <div className="mt-auto pt-12">
              <Button className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 bg-primary">
                <Sparkles className="h-5 w-5 mr-3 fill-primary-foreground/20" />
                Find Outfits with this Item
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Powered by Vestra AI Matching Engine
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching wardrobe item:", error);
    notFound();
  }
}
