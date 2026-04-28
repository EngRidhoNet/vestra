import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  User,
} from "lucide-react";
import type { NavItem } from "@/types";

export const APP_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Wardrobe", href: "/wardrobe", icon: Shirt },
  {
    label: "Recommendations",
    mobileLabel: "Ideas",
    href: "/recommendations",
    icon: Sparkles,
  },
  { label: "Profile", href: "/profile", icon: User },
];
