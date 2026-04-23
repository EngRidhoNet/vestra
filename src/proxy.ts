import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// In Next.js 16 this file was renamed from `middleware.ts` to `proxy.ts`,
// and the exported function must be named `proxy`.
// The runtime is nodejs-only (edge is not supported for proxy).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
