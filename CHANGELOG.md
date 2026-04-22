# Changelog

All notable changes to Know Thy Poop.

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
