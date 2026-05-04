import { Container } from "@/components/shared/container";
import { AddWardrobeForm } from "@/components/wardrobe/AddWardrobeForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddWardrobeItemPage() {
  return (
    <Container className="pt-5 sm:py-12">
      <div className="mb-6">
        <Button
          variant="ghost"
          asChild
          className="pl-0 text-muted-foreground hover:text-foreground"
        >
          <Link href="/wardrobe">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wardrobe
          </Link>
        </Button>
      </div>

      <AddWardrobeForm />
    </Container>
  );
}
