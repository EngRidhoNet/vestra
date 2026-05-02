# Graph Report - vestra  (2026-04-28)

## Corpus Check
- 83 files · ~16,910 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 176 nodes · 126 edges · 5 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 10 edges
2. `Select()` - 8 edges
3. `GET()` - 7 edges
4. `POST()` - 5 edges
5. `ProfilePage()` - 4 edges
6. `handleFileChange()` - 4 edges
7. `saveWardrobeItem()` - 4 edges
8. `uploadProfilePhotoAction()` - 4 edges
9. `AppLayout()` - 3 edges
10. `next()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `AppLayout()` --calls--> `createClient()`  [INFERRED]
  src/app/(app)/layout.tsx → src/lib/supabase/server.ts
- `ProfilePage()` --calls--> `Select()`  [INFERRED]
  src/app/(app)/profile/page.tsx → src/components/ui/select.tsx
- `GET()` --calls--> `Select()`  [INFERRED]
  src/app/auth/callback/route.ts → src/components/ui/select.tsx
- `OnboardingPage()` --calls--> `createClient()`  [INFERRED]
  src/app/onboarding/page.tsx → src/lib/supabase/server.ts
- `getWardrobeItems()` --calls--> `Select()`  [INFERRED]
  src/services/wardrobe.service.ts → src/components/ui/select.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (10): completeOnboarding(), updateProfile(), saveWardrobeItem(), GET(), ProfilePage(), uploadImage(), createClient(), extensionFor() (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (7): AppLayout(), OnboardingPage(), getWardrobeItemById(), getWardrobeItems(), saveWardrobeItem(), Select(), handleSave()

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (5): extractWardrobeMetadata(), fileToBase64(), resizeImage(), extractWardrobeItem(), handleFileChange()

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (4): canProceed(), next(), proxy(), updateSession()

### Community 4 - "Community 4"
Cohesion: 0.25
Nodes (3): uploadProfilePhotoAction(), uploadPhoto(), uploadPhoto()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 0` to `Community 1`, `Community 4`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `Select()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `uploadProfilePhotoAction()` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `createClient()` (e.g. with `AppLayout()` and `ProfilePage()`) actually correct?**
  _`createClient()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `Select()` (e.g. with `AppLayout()` and `ProfilePage()`) actually correct?**
  _`Select()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `GET()` (e.g. with `ProfilePage()` and `createClient()`) actually correct?**
  _`GET()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `POST()` (e.g. with `createClient()` and `GET()`) actually correct?**
  _`POST()` has 2 INFERRED edges - model-reasoned connections that need verification._