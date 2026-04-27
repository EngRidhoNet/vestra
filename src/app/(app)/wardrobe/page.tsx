import { Shirt } from "lucide-react";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { WardrobeItemCard } from "@/components/wardrobe/wardrobe-item-card";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";

export default async function WardrobePage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: false });

  const imagePaths = (items ?? [])
    .map((item) => item.image_path)
    .filter((path): path is string => Boolean(path));

  const signedUrlByPath = new Map<string, string>();

  if (imagePaths.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from(STORAGE_BUCKETS.wardrobe)
      .createSignedUrls(imagePaths, 60 * 60);

    (signedUrls ?? []).forEach((entry) => {
      if (entry.path && entry.signedUrl) {
        signedUrlByPath.set(entry.path, entry.signedUrl);
      }
    });
  }

  const withUrls = (items ?? []).map((item) => ({
    item,
    imageUrl: item.image_path ? (signedUrlByPath.get(item.image_path) ?? null) : null,
  }));

  return (
    <Container className="pt-5 sm:py-12">
      <PageHeader
        title="Wardrobe"
        description="Every piece you own — photo, category, and color."
      />

      {withUrls.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="No items yet"
          description="Upload your first piece — a top, bottom, or a favorite jacket."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {withUrls.map(({ item, imageUrl }) => (
            <WardrobeItemCard key={item.id} item={item} imageUrl={imageUrl} />
          ))}
        </div>
      )}
    </Container>
  );
}
