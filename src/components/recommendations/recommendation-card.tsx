import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recommendation } from "@/types";

export function RecommendationCard({
  recommendation,
}: {
  recommendation: Pick<Recommendation, "occasion" | "reason" | "score">;
}) {
  return (
    <Card className="glass-panel border-0">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            Today&apos;s outfit
          </CardTitle>
          {recommendation.occasion ? (
            <Badge variant="secondary" className="capitalize">
              {recommendation.occasion}
            </Badge>
          ) : null}
        </div>
        {recommendation.score !== null &&
        recommendation.score !== undefined ? (
          <div className="text-muted-foreground text-xs">
            match · {Math.round(recommendation.score * 100)}%
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        {recommendation.reason ?? "AI pick based on today's weather and your style preferences."}
      </CardContent>
    </Card>
  );
}
