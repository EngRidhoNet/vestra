"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";

export function AuthButton({ redirect = "/dashboard" }: { redirect?: string }) {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) {
      toast.error("Sign-in failed", { description: error.message });
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleGoogle}
      disabled={loading}
    >
      {loading ? "Connecting…" : "Continue with Google"}
    </Button>
  );
}
