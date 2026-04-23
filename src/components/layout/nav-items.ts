import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  Settings,
} from "lucide-react";
import type { NavItem } from "@/types";

export const APP_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Wardrobe", href: "/wardrobe", icon: Shirt },
  { label: "Recommendations", href: "/recommendations", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];
