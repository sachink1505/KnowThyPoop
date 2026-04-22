# Logio — Project Context

## What This Is
Logio is a gut health / poop tracking web app built with Next.js, intended to be wrapped with Capacitor for Play Store and App Store distribution.

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Nova preset, Stone palette) |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (via @supabase/ssr) |
| Forms | React Hook Form + Zod + @hookform/resolvers |
| Dates | date-fns |
| LLM | Configurable — Gemini or OpenAI (set via LLM_PROVIDER env var) |
| Mobile | Capacitor (future — wraps this Next.js app) |

## Folder Structure
```
src/
  app/          Next.js App Router pages and layouts
  components/   Shared UI components
  lib/          Utilities, Supabase client, LLM client
  types/        TypeScript type definitions
```

## Environment Variables
| Variable | Purpose |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key (safe for browser) |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key (server-only) |
| LLM_PROVIDER | "gemini" or "openai" |
| GEMINI_API_KEY | Google Gemini API key |
| OPENAI_API_KEY | OpenAI API key |

## Database Schema

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | id (→ auth.users), name, age, phone | Auto-created on signup via trigger |
| `user_issues` | user_id, issue_type, custom_issue | Gut health issues the user reports |
| `poop_entries` | user_id, logged_at, urgency, straining, odour, notes, image_path, image_hash, score | Core log entry. `image_hash` is a client-computed SHA-256 of the uploaded image, used for duplicate-submission abuse checks. |
| `poop_analysis` | entry_id, stool_form, color, size, surface_texture, visible_elements, insights, raw_response | LLM analysis result |
| `analysis_feedback` | entry_id, thumbs, feedback_text | User rating of analysis quality |

All tables have RLS enabled — users can only read/write their own rows.

Storage bucket: `poop-images` (private). Path convention: `{user_id}/{entry_id}.jpg`.

## Routes

| Route | Description | Protected |
|---|---|---|
| `/` | Welcome screen — rotating taglines, Get Started CTA | No |
| `/auth` | Email OTP sign in / sign up — two states (email entry, OTP entry) | No |
| `/onboarding` | Name, age, gut issues setup — runs once after first login | Yes |
| `/home` | Main feed — empty state feature cards or recent entry cards | Yes |
| `/log` | Log entry form — time, urgency, straining, odour, notes, image upload | Yes |
| `/insight/[id]` | Entry insight view — score ring, logged data, analysis placeholders, feedback, gated image view | Yes |
| `/api/entries/[id]/image` | Returns a 60s signed URL for the entry's stored image (auth-gated, user-scoped) | Yes |
| `/api/analyze-poop` | Two-pass LLM pipeline (validation + analysis), writes `poop_analysis` and updates entry score | Yes |
| `/insights` | Past insights — calendar view with entry dot markers, tap to see day's entries | Yes |
| `/terms` | Terms & Conditions | No |
| `/privacy` | Privacy Policy | No |
| `/profile` | User profile — editable name/age/phone/issues, share, export, delete account, sign out | Yes |
| `/api/export` | Streams a JSON dump of the user's profile, issues, entries, analyses, and feedback | Yes |
| `/api/account` | DELETE — purges all user data (images, entries, analyses, feedback, issues, profile) and the auth user | Yes |

## Auth Flow
- Email OTP only (no passwords, no magic links)
- Supabase `signInWithOtp` → `verifyOtp`
- After verify: if `profile.name` is null → `/onboarding`, else → `/home`
- Middleware in `src/middleware.ts` protects `/home`, `/onboarding`, `/profile`, `/log`, `/insight`, `/insights`
- Session refreshed on every request via middleware cookie handling

## Shared Components
| Component | Location | Purpose |
|---|---|---|
| `CircularProgress` | `src/components/CircularProgress.tsx` | SVG score ring used on insight page |
| `EntryCard` | `src/components/EntryCard.tsx` | Reusable entry card used on home + insights pages |
| `InsightFeedback` | `src/components/InsightFeedback.tsx` | Client thumbs up/down wired to `analysis_feedback` table |
| `ImageUpload` | `src/components/ImageUpload.tsx` | Take-photo / gallery picker with preview, 5MB + JPEG/PNG validation, privacy notice |
| `EntryImageViewer` | `src/components/EntryImageViewer.tsx` | "View image" button on insight page — fetches a 60s signed URL from the API |
| `AnalysisLoader` | `src/components/AnalysisLoader.tsx` | Full-screen loader with rotating status messages shown during LLM analysis |
| `ScoreExplainer` | `src/components/ScoreExplainer.tsx` | "?" button on the insight score card — opens a modal explaining the 0–100 Form/Colour/Experience/Frequency breakdown as a segmented bar |

## Image Upload Flow
- `/log` uses `<ImageUpload />` — "Take photo" uses `<input type="file" accept="image/*" capture="environment">`, "Upload from gallery" uses the same input without `capture`. Files are validated client-side: JPEG or PNG only, max 5MB.
- On save, the flow is: (1) insert `poop_entries` row without `image_path`, (2) upload to `poop-images` bucket at `{user_id}/{entry_id}.jpg`, (3) update row with `image_path`. If step 2 or 3 fails, the row is deleted for a clean rollback (and the uploaded object, if any, is removed).
- On `/insight/[id]`, the image is NOT rendered by default. A "View image" button calls `/api/entries/[id]/image`, which returns a 60-second signed URL scoped to the authenticated user. The client then renders the image inline with a Hide option.

## LLM Analysis Pipeline
- Provider-agnostic interface in [src/lib/llm/](src/lib/llm/) — `types.ts`, `prompts.ts`, `gemini.ts`, `openai.ts`, `index.ts` (factory reads `LLM_PROVIDER` env, default `gemini`).
- Default model: **Gemini 2.5 Flash** (`gemini-2.5-flash`) via REST, using `response_mime_type: "application/json"` for structured output. OpenAI uses `gpt-4o-mini` with `response_format: json_object`.
- All LLM calls are server-side only — invoked from [src/app/api/analyze-poop/route.ts](src/app/api/analyze-poop/route.ts).
- **Pass 1 (cheap validation):** asks `{ is_stool, confidence, rejection_reason, is_blurry }`. If `is_stool=false` or `confidence<0.6` or `is_blurry=true`, returns 200 `{ ok:false, stage:"pass1", rejection_reason }` — Pass 2 is skipped.
- **Pass 2 (full analysis):** image + user context (urgency/straining/odour/notes) → structured JSON with `stool_form` (Bristol 1–7), `color`, `size`, `surface_texture`, `visible_elements`, `objective_summary`, `insights`, `corrections`. Prompt forbids medical advice, requires hedged "may indicate" language, and handles edge cases (beetroot/menstruation false-red, mixed stools, partial submersion, multiple stools).
- **Scoring is backend-only** — see [src/lib/scoring.ts](src/lib/scoring.ts). Formula: Form (40) + Color (25) + Experience (20) + Frequency (15), capped at 100. Frequency uses last 7 days of entries for the user.
- **Rate limit:** max 10 analyses per user per day (counted via `poop_analysis` joined through today's entries). Returns 429 with a clear message.

## Frontend Analysis Flow
- On `/log` save with an image: insert row → upload image → update `image_path` → POST `/api/analyze-poop`. During the call, `<AnalysisLoader />` covers the screen with rotating status lines.
- On success → navigate to `/insight/[id]`.
- On Pass 1 rejection → stay on `/log`, show the rejection reason inline with two actions: **Try different image** (re-uploads to the same storage path, re-runs analysis on the same entry) or **Save without analysis** (navigates to the insight page as-is).
- On rate-limit or other errors → navigate to `/insight/[id]`; user still has their saved entry.

## Score
- Computed in [src/lib/scoring.ts](src/lib/scoring.ts) after Pass 2, stored on `poop_entries.score`.
- If no image was analysed, `score` remains `null` and the insight page renders `0/100` with no LLM-derived sections.

## Home Page Polish
- **Streak counter:** consecutive days with at least one entry, ending today (or yesterday if today is empty). Flame icon fills orange once streak > 2 days. Computed from `logged_at` over the last 60 days; see `computeStreak` in [src/app/home/page.tsx](src/app/home/page.tsx).
- **Empty-state illustration:** custom inline SVG (amber smiling blob) on the empty home state — no external assets.

## Account Deletion
- [src/app/api/account/route.ts](src/app/api/account/route.ts) uses the service-role client to cascade delete: storage objects → `analysis_feedback` → `poop_analysis` → `poop_entries` → `user_issues` → `profiles` → `auth.admin.deleteUser`. Requires the user to type `DELETE` in the confirmation modal. Required for Play Store / App Store compliance.

## Key Decisions
- **shadcn/ui Nova preset + Stone color palette** — warm neutral tone chosen for health/wellness feel, avoids generic blue
- **legacy-peer-deps=true in .npmrc** — needed due to ESLint 8/9 version conflict between create-next-app@14 and shadcn's latest installer
- **src/ directory** — all source code lives under src/ for clean separation from config files

## Hardening (store-submission readiness)

### Global error handling
- [src/app/error.tsx](src/app/error.tsx) — on-brand client error boundary for any route segment, with **Try again** and **Home** buttons. Logs `error.digest` for support.
- [src/app/global-error.tsx](src/app/global-error.tsx) — last-resort error screen rendered when the root layout itself crashes (must include its own `<html>`/`<body>`).
- [src/app/not-found.tsx](src/app/not-found.tsx) — on-brand 404 with **Back to home** CTA.
- [src/components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx) — reusable React error boundary for isolating widget-level failures.

### API hardening
- [src/lib/api.ts](src/lib/api.ts) — `withAuth(handler, { bodySchema?, paramsSchema? })` wrapper applied to every API route. Handles auth check (401), zod validation (400 with structured `issues`), and try/catch with a 500 fallback that hides internals in production.
- Every route (`/api/analyze-poop`, `/api/account`, `/api/export`, `/api/entries/[id]/image`) uses `withAuth`. UUID params are validated; request bodies are zod-validated.
- **Duplicate-image abuse check** — `poop_entries.image_hash` stores a SHA-256 of the uploaded image (computed client-side via `crypto.subtle` in [src/lib/hash.ts](src/lib/hash.ts)). Before insert, [src/app/log/page.tsx](src/app/log/page.tsx) rejects any submission whose hash matches another of the user's entries in the last 24 hours. `/api/analyze-poop` also enforces the same check server-side (returns 409 `"This image was already analysed."`).

### Client-side safeguards
- [src/components/ImageUpload.tsx](src/components/ImageUpload.tsx) — rejects non-JPEG/PNG and files larger than 5 MB **before** upload.
- Save button in [src/app/log/page.tsx](src/app/log/page.tsx) is `disabled` during `saving`/`analysing` and early-returns on re-entry, preventing double-submits.

### Security headers
- [next.config.mjs](next.config.mjs) sets CSP (locked to `'self'` + the Supabase origin for `connect-src`/`img-src`), plus `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera only on self; mic/geo denied), and `Strict-Transport-Security`. CSP `script-src` includes `'unsafe-eval'` only in development (Next HMR).

### Environment validation
- [src/lib/env.ts](src/lib/env.ts) uses zod to validate required env vars at startup. Imported as a side-effect in [src/app/layout.tsx](src/app/layout.tsx) so a misconfigured deployment fails fast with a readable list of missing/invalid vars. Enforces provider-specific keys (`GEMINI_API_KEY` when `LLM_PROVIDER=gemini`, `OPENAI_API_KEY` when `openai`).

### Database migration
- [supabase/migrations/20260422_add_image_hash.sql](supabase/migrations/20260422_add_image_hash.sql) adds the `image_hash TEXT` column and a partial index on `(user_id, image_hash, logged_at DESC)` for the duplicate lookup. Must be applied before this hardening is live.

## Native (Capacitor) distribution

The app ships to Play Store and App Store as a **Capacitor shell that loads the hosted Next.js site** — not as a static export. API routes, SSR, and Supabase cookie auth stay on Vercel unchanged. The native shell adds native camera, splash, status-bar theming, and haptics.

- **App ID / bundle ID:** `com.pooptracker.site`
- **App name:** `Logio`
- **Production URL:** `https://pooptracker.site` (set as `server.url` in [capacitor.config.ts](capacitor.config.ts))
- **Path chosen (A over B/C):** Keep API on Vercel, point Capacitor at the remote URL. Avoids rewriting every route in [src/app/api/](src/app/api/) as Supabase Edge Functions. Tradeoff: requires network for every request; Apple may scrutinise the web-wrapper pattern — mitigated by native camera + haptics + native splash.

### Files
- [capacitor.config.ts](capacitor.config.ts) — bundle ID, `server.url`, `allowNavigation` allowlist, plugin config (SplashScreen, StatusBar).
- [src/lib/native.ts](src/lib/native.ts) — `isNative()` / `platform()` helpers; all native-plugin code is behind these checks so the web build never loads native-only modules.
- [src/components/ImageUpload.tsx](src/components/ImageUpload.tsx) — on native, the **Take photo / Upload from gallery / Replace** buttons route to `@capacitor/camera` via a dynamic import; on web, they still trigger the hidden `<input type="file">`. Same 5 MB + JPEG/PNG client-side validation applies to both paths.
- [resources/](resources/) — placeholder SVG icon + splash art (on-brand amber blob on stone bg). Generated into native projects via `npm run cap:assets` (uses `@capacitor/assets`). **Replace with final brand art before store submission.**
- [CAPACITOR.md](CAPACITOR.md) — exact build commands (Android `bundleRelease`, iOS Archive), keystore setup, Play Console + App Store Connect submission checklists, screenshot sizes, Data Safety / Privacy Nutrition answers, and App Review notes.

### npm scripts
- `cap:assets` — regenerate all icon + splash artefacts from [resources/](resources/) into `ios/` + `android/`.
- `cap:sync` — copy config and plugins into both native platforms (run after every web change or plugin addition).
- `cap:add:ios` / `cap:add:android` — one-time platform scaffold.
- `cap:open:ios` / `cap:open:android` — open Xcode / Android Studio on the native project.

### Plugins installed
`@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`, `@capacitor/camera`, `@capacitor/haptics`, `@capacitor/splash-screen`, `@capacitor/status-bar`, `@capacitor/app`, `@capacitor/browser`. Dev: `@capacitor/assets`.
