# Changelog

All notable changes to Know Thy Poop.

## [0.5.0] — 2026-04-23

Android versionCode `5` · versionName `0.5`

### Fixed
- **Entry save failing on "No odour"** — the DB had a CHECK constraint `odour >= 1`; relaxed to `>= 0`. This also unblocked **image upload**, which was cascade-failing because the entry insert threw before the storage step.
- **Score still showing 75 for old entries** — removed the last placeholders and back-filled every existing null-score entry using the new 6-trait heuristic.
- **Camera / gallery upload errors on native** — permission flow now only requests `camera` for the camera source (Android gallery doesn't need the Camera plugin's `photos` permission; the system file picker handles it).
- **Daily reminder toggle on signup** was visually stuck — missing horizontal offset on the knob. Fixed with explicit `left-0.5` and slightly bigger hit area.
- **Stopwatch paused when app was minimized** — now computes elapsed from `Date.now()` and persists to `localStorage`, so it keeps ticking through backgrounding. Stopping it (or killing the app) clears the state.
- **Time cards showed UTC instead of IST** — `EntryCard` is now a client component and `LocalTime` renders the insight-page timestamp on the device, so dates pick up the user's real timezone.
- **Calendar on /insights looked congested** — cell size bumped from 1.75rem to 2.5rem, week rows now have `gap-0.5`, weekday headers bigger, calendar fills the width.
- **Duration / Colour / Volume / Composition hidden in history** — all four now show as chips on `EntryCard` and in the "What you logged" grid on the insight page.

### Added
- **+1 min button** on the stopwatch to bump duration quickly.
- **Themed route loader** (`PoopLoader`) — animated poop + amber ring — replaces the white skeleton flash on route transitions (home, log, profile, insights, stats).

### Changed
- Removed "(optional)" text from log-form labels (everything below Photo is optional by design).
- ScoreExplainer text clarified.

### Database
New migration `20260423_odour_allow_zero.sql` relaxes the odour check. Back-fill of historical scores was applied via SQL (non-migration one-off).

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
