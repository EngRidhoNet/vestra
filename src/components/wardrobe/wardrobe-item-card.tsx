import Image from "next/image";
import Link from "next/link";
import { Shirt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WardrobeItem } from "@/types";

export function WardrobeItemCard({
  item,
  imageUrl,
  className,
}: {
  item: WardrobeItem;
  imageUrl?: string | null;
  className?: string;
}) {
  return (
    <Link
      href={`/wardrobe/${item.id}`}
      className={cn(
        "glass-panel group flex flex-col overflow-hidden rounded-2xl border-0 transition duration-300 ease-out active:scale-[0.99] sm:hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="bg-muted/70 relative aspect-square overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <Shirt className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {item.category}
          </Badge>
        </div>
        {item.color ? (
          <p className="text-muted-foreground truncate text-xs capitalize">
            {item.color}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
