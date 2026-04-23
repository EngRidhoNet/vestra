import { Sparkles } from "lucide-react";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { createClient } from "@/lib/supabase/server";

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const { data: recs } = await supabase
    .from("recommendations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <Container className="py-8 sm:py-12">
      <PageHeader
        title="Recommendations"
        description="Outfits curated for you based on weather, occasion, and your taste."
      />

      {!recs || recs.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No recommendations yet"
          description="Add items to your wardrobe to get your first suggestion."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recs.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </Container>
  );
}
