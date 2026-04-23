import Link from "next/link";
import { Shirt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthButton } from "@/components/shared/auth-button";
import { APP_NAME } from "@/lib/constants";

type SearchParams = Promise<{ redirect?: string; error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { redirect, error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-base font-semibold tracking-tight"
        >
          <Shirt className="h-5 w-5" />
          {APP_NAME}
        </Link>
        <Card className="glass-panel border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <p className="text-muted-foreground text-sm">
              Sign in to start building your wardrobe.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <AuthButton redirect={redirect ?? "/dashboard"} />
            {error ? (
              <p className="text-destructive text-center text-xs">
                Something went wrong. Please try again.
              </p>
            ) : null}
            <p className="text-muted-foreground text-center text-xs">
              By continuing you agree to the terms of service.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
