"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { STYLE_TAGS } from "@/lib/constants";
import {
  completeOnboarding,
  type OnboardingState,
} from "@/actions/onboarding";

const initial: OnboardingState = {};

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(completeOnboarding, initial);

  return (
    <Card className="glass-panel border-0">
      <CardContent className="pt-6">
        <form action={action} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Your name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={defaultName}
              placeholder="How should we call you?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Style you like</Label>
            <p className="text-muted-foreground text-xs">
              Pick any that resonate. You can change this later.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {STYLE_TAGS.map((tag) => (
                <label key={tag} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="styleTags"
                    value={tag}
                    className="peer sr-only"
                  />
                  <Badge
                    variant="outline"
                    className="peer-checked:bg-primary peer-checked:text-primary-foreground capitalize"
                  >
                    {tag}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="climate">Climate / city (optional)</Label>
            <Input
              id="climate"
              name="climate"
              placeholder="e.g. Jakarta — hot and humid"
            />
          </div>

          {state.error ? (
            <p className="text-destructive text-sm">{state.error}</p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
