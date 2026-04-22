# Changelog

All notable changes to Know Thy Poop.

## [0.4.0] — 2026-04-22

Android versionCode `4` · versionName `0.4`

### Added
- **Unified score formula** — one Bristol-backed formula (composition 30 · colour 25 · straining 15 · urgency 10 · volume 10 · odour 10). Computed at save time from the characteristics you pick. A photo auto-fills those traits so the score stays consistent — same number on home, insight, everywhere.
- **Picture-based pickers** for colour, volume, composition, urgency, straining, odour (emoji tiles + custom poop-composition SVGs for rock / pellets / smooth / mushy).
- **Stopwatch** for poop duration, stored in new `duration_seconds` column.
- **`/stats` page** — 24-hour timing histogram, average duration, average gap between consecutive poops.
- **Stats tile on home** — quick link alongside Insights.
- **Flush sound** on successful save (`/public/sounds/flush.mp3` — drop a CC0 asset there).
- **Notification deep-link** — tapping the daily reminder opens `/log`.

### Fixed
- **Score 0 vs 75 inconsistency** — removed both `?? 75` placeholder (EntryCard) and `?? 0` fallback (insight). Score is now computed at save and shown consistently; entries with no traits show "—".
- **Avatars broken** — CSP `img-src` now allows `https://api.dicebear.com`.
- **Camera permissions** — we now explicitly `checkPermissions` + `requestPermissions` before `getPhoto`; denial shows a clear message instead of the generic "couldn't open camera".
- **Non-poop images** — pass1 rejection threshold tightened (confidence ≥ 0.7), prompt rewritten to be strict + copy now reads "The uploaded picture is not of a poop. Try a different image."
- **Logged out on app restart / notification tap** — Android `CookieManager` now accepts + flushes cookies in `MainActivity.onCreate` and `onPause`, so the Supabase session persists.
- **Android launcher icon** — adaptive icon (v26+) now points to a custom brown-poop-on-amber vector instead of the stock Capacitor smile.

### Changed
- Log form copy + layout: Notes collapsible by default, Photo above traits, pickers everywhere.
- ScoreExplainer infographic redrawn for the new 6-trait formula.

### Database
New migration `supabase/migrations/20260422b_characteristics.sql` adds `poop_color`, `poop_volume`, `poop_composition`, `duration_seconds` to `poop_entries`.

### Native
A new APK is required for the launcher icon, cookie persistence, and notification deep-link. Run `npx cap sync android` and rebuild.

## [0.3.0] — 2026-04-22

Android versionCode `3` · versionName `0.3`

### Added
- **Daily reminder push notification** — set a time during onboarding; fires daily via `@capacitor/local-notifications`. Editable in Profile.
- **Avatars** — 8 DiceBear avatars selectable in Profile; stored as `avatar_seed`.
- **Country-code phone input** — searchable country dropdown (react-phone-number-input), digits-only, E.164 storage.
- **Animated 404 page** — wobbling poop emoji with "Back home" CTA.
- **Global loader + route skeletons** — `loading.tsx` for profile and insights; `<Loader/>` component.
- **"Go home" CTA** on insight page alongside "Track another".
- **App icon (`icon.svg`)** — brown poop on amber circle; Next auto-wires.

### Changed
- **Rebrand**: Logio → **Know Thy Poop** everywhere (metadata, landing, auth, terms, privacy, footer, share text, package name).
- **Log form**: urgency / straining / odour default to unselected (no pill highlighted) — all three now optional and nullable in DB.
- **Log form**: Photo moved above Notes; Notes is now a collapsible — shows as "Add notes (optional)" until tapped.
- **Onboarding**: "Any issues with your poop?" removed from signup — now only in Profile.
- **Auth page**: instruction above email input, larger spacing between label and field.
- **Profile load**: instant skeleton via `profile/loading.tsx`.
- **Copy pass**: shorter, punchier across onboarding, auth, log, insight disclaimer, share text.

### Removed
- **Export my data** from Profile and the backing `/api/export` route.

### Database
New migration `supabase/migrations/20260422_add_reminder_avatar.sql` adds `reminder_time`, `avatar_seed`, `country_code` to `profiles`.

### Native
- Added `@capacitor/local-notifications` plugin; requires `npx cap sync android` + a fresh APK.
- `LocalNotifications` plugin entry added to [capacitor.config.ts](capacitor.config.ts).

## [0.2.0]

Initial beta — web + Android shell, Supabase auth, poop logging with AI image analysis.
