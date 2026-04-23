import Link from "next/link";
import { ArrowRight, Shirt, Sparkles, CloudSun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="py-6">
        <Container>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-base font-semibold tracking-tight"
            >
              <Shirt className="h-5 w-5" />
              {APP_NAME}
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        <Container size="md" className="py-16 sm:py-24">
          <div className="flex flex-col items-center text-center">
            <div className="bg-muted text-muted-foreground mb-6 flex h-9 items-center gap-2 rounded-full px-3 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              AI outfit assistant — private beta
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              What should I wear today?
            </h1>
            <p className="text-muted-foreground mt-5 max-w-xl text-base sm:text-lg">
              {APP_TAGLINE} Upload your wardrobe once — {APP_NAME} picks an
              outfit that fits the weather, your plans, and your taste.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-20 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Shirt,
                title: "Your wardrobe, digitized",
                body: "Upload photos of your clothes once. We organize them by category, color, and season.",
              },
              {
                icon: CloudSun,
                title: "Weather-aware",
                body: "Outfit picks factor in today's temperature, rain, and how warm it actually feels.",
              },
              {
                icon: Sparkles,
                title: "Learns your taste",
                body: "Like and dislike recommendations — the app tunes to your personal style over time.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="glass-panel flex flex-col gap-2 rounded-2xl p-5"
              >
                <Icon className="h-5 w-5" />
                <h3 className="text-sm font-medium">{title}</h3>
                <p className="text-muted-foreground text-sm">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </main>

      <footer className="text-muted-foreground py-8 text-center text-xs">
        © {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
