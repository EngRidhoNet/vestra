import type { LucideIcon } from "lucide-react";

export * from "./database";

export type NavItem = {
  label: string;
  mobileLabel?: string;
  href: string;
  icon?: LucideIcon;
};

export type WeatherSummary = {
  tempC: number;
  feelsLikeC: number;
  condition: string;
  humidity: number;
  location: string;
};
