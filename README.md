# Fitly

AI-powered daily outfit recommendation. Upload your wardrobe once, Fitly picks
an outfit that fits the weather, your plans, and your taste.

Built on Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui, and Supabase.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Create a new project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in the values from
   **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Apply the database schema

Open the **SQL editor** in Supabase and paste the contents of
[`supabase/schema.sql`](supabase/schema.sql). It is idempotent and sets up:

- `profiles`, `user_preferences`, `wardrobe_items`, `outfits`, `outfit_items`,
  `recommendations`
- `updated_at` triggers
- Signup trigger that auto-creates the profile + preferences row
- Row-Level Security (users only see/touch their own rows)
- Private `wardrobe` storage bucket with per-user folder policies

### 4. Configure Google OAuth

1. In the Supabase dashboard: **Authentication → Providers → Google → enable**.
2. Follow the [Google OAuth guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
   to set up a client in Google Cloud. Use the redirect URL shown by Supabase.
3. Add `http://localhost:3000/auth/callback` to your app's redirect URLs under
   **Authentication → URL Configuration**.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  actions/              # Server Actions (mutations only)
  app/
    (app)/              # Authenticated routes (share sidebar shell)
      dashboard/
      wardrobe/
      recommendations/
      settings/
    auth/callback/      # OAuth callback route handler
    login/              # Sign-in page (public)
    onboarding/         # First-run profile setup
    page.tsx            # Marketing landing
    layout.tsx          # Root layout (fonts, Toaster, TooltipProvider)
    globals.css         # Design tokens + glass utilities
  components/
    layout/             # AppShell, Sidebar, UserMenu
    shared/             # Container, PageHeader, EmptyState, UploadZone…
    ui/                 # shadcn/ui primitives
    wardrobe/           # WardrobeItemCard
    recommendations/    # RecommendationCard, WeatherSummaryCard
  hooks/                # React hooks (useUser)
  lib/
    env.ts              # Zod-validated env
    supabase/           # client.ts · server.ts · middleware.ts (proxy helper)
    constants.ts
    utils.ts            # cn()
  types/                # App + database types
  proxy.ts              # Next.js 16 proxy (was middleware) — route guard
```

## Coding conventions

- Server Components by default. Add `"use client"` only where you need state,
  effects, or browser-only APIs.
- Mutations live in `src/actions/*` as Server Actions. Route Handlers are only
  for OAuth callbacks or webhooks.
- Validate external input with Zod. Environment variables are validated in
  [`src/lib/env.ts`](src/lib/env.ts).
- All Supabase calls use the helpers in `src/lib/supabase/*`. Never import
  `@supabase/supabase-js` directly in app code.
- File names: `kebab-case.tsx`. Components: `PascalCase`. Hooks: `useX`.
- Tailwind v4 CSS-first tokens — palette lives in `globals.css`, not a config.

## Storage convention

Files are stored in the private `wardrobe` bucket under
`<user_id>/<item_id>/<random>.<ext>`. Only signed URLs are exposed to the
client (1h TTL in [`app/(app)/wardrobe/page.tsx`](src/app/%28app%29/wardrobe/page.tsx)).
Allowed MIME types and size limits are in
[`src/lib/constants.ts`](src/lib/constants.ts).

## Next steps

- [ ] Wire up wardrobe upload: client-side resize + Supabase Storage upload +
      insert into `wardrobe_items`.
- [ ] Generate Supabase types: `npx supabase gen types typescript` into
      `src/types/database.ts`.
- [ ] Add a weather provider (Open-Meteo is free + no key) and store the
      summary in Settings → Preferences.
- [ ] Build the recommendation engine (start with a rules-based picker; layer
      an LLM in later).
