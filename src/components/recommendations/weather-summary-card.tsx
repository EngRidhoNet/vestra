import { CloudSun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { WeatherSummary } from "@/types";

export function WeatherSummaryCard({
  weather,
}: {
  weather: WeatherSummary | null;
}) {
  if (!weather) {
    return (
      <Card className="glass-subtle border-0">
        <CardContent className="flex items-center gap-3 py-4">
          <CloudSun className="text-muted-foreground h-5 w-5" />
          <p className="text-muted-foreground text-sm">
            Weather unavailable — set your location in Settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-subtle border-0">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
            <CloudSun className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium capitalize">{weather.condition}</p>
            <p className="text-muted-foreground text-xs">{weather.location}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">{Math.round(weather.tempC)}°</p>
          <p className="text-muted-foreground text-xs">
            feels {Math.round(weather.feelsLikeC)}°
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
