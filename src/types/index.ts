export * from "./database";

export type NavItem = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export type WeatherSummary = {
  tempC: number;
  feelsLikeC: number;
  condition: string;
  humidity: number;
  location: string;
};
