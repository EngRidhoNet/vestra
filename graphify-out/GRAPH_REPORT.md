# Graph Report - vestra  (2026-04-28)

## Corpus Check
- 70 files · ~10,976 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 141 nodes · 95 edges · 5 communities detected
- Extraction: 75% EXTRACTED · 25% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 10 edges
2. `Select()` - 6 edges
3. `GET()` - 5 edges
4. `WardrobeService` - 5 edges
5. `handleFileChange()` - 4 edges
6. `saveWardrobeItem()` - 4 edges
7. `WardrobeAiService` - 4 edges
8. `AppLayout()` - 3 edges
9. `OnboardingPage()` - 3 edges
10. `extractWardrobeMetadata()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `AppLayout()` --calls--> `createClient()`  [INFERRED]
  src/app/(app)/layout.tsx → src/lib/supabase/server.ts
- `GET()` --calls--> `Select()`  [INFERRED]
  src/app/auth/callback/route.ts → src/components/ui/select.tsx
- `OnboardingPage()` --calls--> `createClient()`  [INFERRED]
  src/app/onboarding/page.tsx → src/lib/supabase/server.ts
- `handleFileChange()` --calls--> `extractWardrobeMetadata()`  [INFERRED]
  src/components/wardrobe/AddWardrobeForm.tsx → src/actions/extract-wardrobe-item.ts
- `proxy()` --calls--> `updateSession()`  [INFERRED]
  src/proxy.ts → src/lib/supabase/middleware.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.23
Nodes (5): completeOnboarding(), saveWardrobeItem(), GET(), WardrobeService, createClient()

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (3): AppLayout(), OnboardingPage(), Select()

### Community 2 - "Community 2"
Cohesion: 0.2
Nodes (3): extractWardrobeMetadata(), OpenRouterClient, WardrobeAiService

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (4): fileToBase64(), resizeImage(), handleFileChange(), handleSave()

### Community 6 - "Community 6"
Cohesion: 0.5
Nodes (2): proxy(), updateSession()

## Knowledge Gaps
- **Thin community `Community 6`** (4 nodes): `middleware.ts`, `proxy()`, `proxy.ts`, `updateSession()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `handleFileChange()` connect `Community 4` to `Community 2`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `extractWardrobeMetadata()` connect `Community 2` to `Community 4`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `createClient()` (e.g. with `AppLayout()` and `GET()`) actually correct?**
  _`createClient()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `Select()` (e.g. with `AppLayout()` and `GET()`) actually correct?**
  _`Select()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `GET()` (e.g. with `createClient()` and `Select()`) actually correct?**
  _`GET()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `handleFileChange()` (e.g. with `resizeImage()` and `fileToBase64()`) actually correct?**
  _`handleFileChange()` has 3 INFERRED edges - model-reasoned connections that need verification._