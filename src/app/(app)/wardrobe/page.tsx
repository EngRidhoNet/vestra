import { Shirt, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { WardrobeItemCard } from "@/components/wardrobe/wardrobe-item-card";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_STORAGE } from "@/constants/supabase.constant";

import { getSignedUrl } from "@/services/wardrobe.service";

export default async function WardrobePage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: false });

  const withUrls = await Promise.all(
    (items ?? []).map(async (item) => {
      if (!item.image_path) return { item, imageUrl: null };
      const imageUrl = await getSignedUrl(supabase, item.image_path);

      return { item, imageUrl };
    }),
  );

  return (
    <Container className="pt-5 sm:py-12">
      <PageHeader
        title="Wardrobe"
        description="Every piece you own — photo, category, and color."
        actions={
          <Button asChild>
            <Link href="/wardrobe/add">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Link>
          </Button>
        }
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
