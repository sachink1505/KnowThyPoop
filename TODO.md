# Store-Submission Hardening — Manual TODO

Things to configure by hand in external dashboards before shipping. Code-side hardening is already done (see `PROJECT_CONTEXT.md → Hardening`).

---

## 🚧 Blockers — do these first

Nothing else in this list can progress until these are done.

- [ ] **Deploy Next.js app to Vercel at `https://pooptracker.site`** — point the custom domain, run a prod build, verify sign-in + log + analyse flow works end-to-end on mobile Safari and Chrome.
- [ ] **Apple Developer Program** — confirm membership is paid and active ($99/year). Needed for certificates, App Store Connect record, and submission.
- [ ] **Google Play Console** — confirm account is created and one-time $25 fee paid. Needed for app listing and AAB upload.

---

## Supabase Auth — Rate Limits
Dashboard → Authentication → Rate Limits

- [ ] Emails per hour (sent): **4**
- [ ] SMS messages per hour: **0** / disabled
- [ ] Token refreshes per 5 min: **150** (default)
- [ ] Token verifications per 5 min: **30**
- [ ] Sign-ups per hour (per IP): **10**
- [ ] Anonymous sign-ins per hour: **0** / disabled

## Supabase Auth — Providers & URLs
Dashboard → Authentication

- [ ] Email → OTP Expiry: **600s (10 min)**, OTP Length: **6**
- [ ] Disable Magic Link provider
- [ ] Disable all unused providers (Google, GitHub, SMS, anonymous, etc.)
- [ ] URL Configuration → Site URL + Redirect URLs set to production domain only (remove `localhost` from prod project)

## Supabase — Database & Policies

- [ ] Run migration `supabase/migrations/20260422_add_image_hash.sql` on prod
- [ ] Confirm RLS enabled on: `profiles`, `user_issues`, `poop_entries`, `poop_analysis`, `analysis_feedback`
- [ ] Confirm each table has per-user policies: `user_id = auth.uid()` for SELECT/INSERT/UPDATE/DELETE

## Supabase — Storage (`poop-images` bucket)

- [ ] Bucket visibility: **Private**
- [ ] File size limit: **5 MB**
- [ ] Allowed MIME types: `image/jpeg, image/png`
- [ ] Storage policies scoped by folder: `auth.uid()::text = (storage.foldername(name))[1]` for SELECT/INSERT/UPDATE/DELETE

## Supabase — Project Settings

- [ ] Rotate `service_role` key if ever exposed outside a secret manager
- [ ] Backups / PITR enabled on production project
- [ ] Database network restrictions set to hosting provider's egress IPs (paid plans)
- [ ] Alerting configured for auth error spikes and 5xx rates

---

## Google AI Studio / Gemini

- [ ] Separate API key per environment (dev / staging / prod)
- [ ] Key kept server-only — never in `NEXT_PUBLIC_*`
- [ ] GCP Console → APIs & Services → per-key daily quota on Generative Language API (e.g. 2,000 req/day)
- [ ] Billing budget alerts at 50% / 90% / 100% of monthly cap
- [ ] Model confirmed as `gemini-2.5-flash` (not `-pro`) for both passes
- [ ] Upgraded to paid tier so prompts aren't used for training (required for health data)

---

## Hosting / Next.js (Vercel or similar)

- [ ] All env vars set on prod (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LLM_PROVIDER`, `GEMINI_API_KEY` or `OPENAI_API_KEY`)
- [ ] CSP graded A or A+ on [securityheaders.com](https://securityheaders.com) in prod
- [ ] Platform DDoS/WAF enabled (Vercel Firewall / Cloudflare)
- [ ] Edge rate-limit rule on `/api/analyze-poop` (~20 req/min per IP)

---

## Store-submission extras (not covered by code changes)

- [ ] Privacy Policy and Terms pages reviewed by legal (health-data context)
- [ ] Play Store Data Safety form filled (images, health info, account deletion available)
- [ ] App Store Privacy Nutrition Label filled
- [ ] Account deletion flow tested end-to-end on prod (it hard-deletes via service role)
- [ ] Test error.tsx / not-found.tsx / global-error.tsx by forcing failures in prod build

---

## Capacitor wrap (partially done — full steps in CAPACITOR.md)

Done in code:
- [x] Install Capacitor core + platforms + plugins (camera, haptics, splash, status-bar, app, browser, assets)
- [x] `capacitor.config.ts` — bundle ID `com.pooptracker.site`, `server.url = https://pooptracker.site`, plugin config
- [x] Capacitor Camera wired into `ImageUpload` with web fallback (dynamic import so web bundle doesn't pull in native code)
- [x] Placeholder on-brand SVG icon + splash art in [resources/](resources/)
- [x] Path chosen: keep Next.js on Vercel, Capacitor loads remote URL (no Edge Function rewrite)

Pending — native project creation & first build:
- [ ] Deploy Next.js app to Vercel; confirm `https://pooptracker.site` loads in a mobile browser
- [ ] `npm run cap:assets` — generate icon/splash artefacts from [resources/](resources/)
- [ ] `npm run cap:add:ios` and `npm run cap:add:android` — scaffold native projects
- [ ] `npm run cap:sync`
- [ ] Replace placeholder [resources/](resources/) art with final brand icon/splash before submission
- [ ] Handle auth deep links if/when you add non-OTP redirects (not needed today — OTP stays in-app)
- [ ] Add haptics calls on key interactions (save, analysis done) to strengthen the native feel for App Review

Pending — Android release:
- [ ] Create release keystore (`keytool -genkey …`) — store in password manager, NEVER commit
- [ ] Add `android/keystore.properties` (gitignored) and signing config in `android/app/build.gradle`
- [ ] Bump `versionCode` / `versionName` in `android/app/build.gradle`
- [ ] `./gradlew bundleRelease` → upload AAB to Play Console
- [ ] Run internal test track with 12+ testers for 14 days (required for new dev accounts since 2023)

Pending — iOS release:
- [ ] Register Apple Distribution certificate + App ID `com.pooptracker.site` in developer.apple.com
- [ ] Create App Store Connect record (SKU `logio`, primary lang English)
- [ ] Apple Developer Program membership active ($99/yr)
- [ ] `npm run cap:open:ios` → Signing & Capabilities: select team, Automatic signing
- [ ] Set Version + Build number in Xcode target → General
- [ ] Product → Archive → Distribute → App Store Connect
- [ ] TestFlight a few days; submit for review

Pending — store listings (specs in [CAPACITOR.md](CAPACITOR.md)):
- [ ] App name, subtitle, short + long descriptions
- [ ] Screenshots: iPhone 6.9" (1320×2868) × 3–10; Android phone (≥1080×1920) × 2–8; Play feature graphic (exactly 1024×500)
- [ ] Play Data Safety form answers
- [ ] Apple Privacy Nutrition labels
- [ ] App Review Notes with a test-account email for OTP login
- [ ] Content rating questionnaire (expect Teen / 12+)
- [ ] Physical-device testing on at least one iPhone and one Android phone before submission
