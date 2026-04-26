import { Shirt, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { WeatherSummaryCard } from "@/components/recommendations/weather-summary-card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { count: itemCount } = await supabase
    .from("wardrobe_items")
    .select("*", { count: "exact", head: true })
    .eq("archived", false);

  return (
    <Container className="pt-5 sm:py-12">
      <PageHeader
        title="Today"
        description="Your weather-aware outfit pick for today."
        actions={
          <Button asChild variant="outline">
            <Link href="/wardrobe">Open wardrobe</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {itemCount && itemCount > 0 ? (
            <RecommendationCard
              recommendation={{
                occasion: "casual day",
                reason:
                  "Light layers — it's mild with a slight chance of wind this afternoon.",
                score: 0.82,
              }}
            />
          ) : (
            <EmptyState
              icon={Shirt}
              title="Your wardrobe is empty"
              description="Upload a few outfits to start getting daily recommendations."
              action={
                <Button asChild>
                  <Link href="/wardrobe">Upload items</Link>
                </Button>
              }
            />
          )}
        </div>
        <div className="space-y-4">
          <WeatherSummaryCard weather={null} />
          <Link
            href="/recommendations"
            className="glass-subtle flex min-h-16 items-center justify-between rounded-2xl p-4 transition duration-300 ease-out active:scale-[0.99] hover:bg-card/70"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-medium">Browse more ideas</p>
            </div>
            <span className="text-muted-foreground text-xs">→</span>
          </Link>
        </div>
      </div>
    </Container>
  );
}
