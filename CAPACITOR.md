# Capacitor — Native Build & Store Submission

This project ships as a Next.js app on Vercel with a thin Capacitor shell wrapping it for iOS and Android. The native shell loads `https://app.pooptracker.site` inside a WebView; API routes and Supabase auth stay exactly as they are on the web.

**App identity**
- App name: `Logio`
- Bundle ID / App ID: `com.pooptracker.site`
- Production URL: `https://app.pooptracker.site` (set in `capacitor.config.ts`)

---

## 0. One-time setup (after install)

```bash
# Deploy the Next.js app to Vercel and confirm https://app.pooptracker.site loads.
# Then, from the project root:

# Generate all icon + splash assets from resources/*.svg into native projects.
# This is what creates AppIcon.appiconset + mipmaps.
npm run cap:assets

# Add the native platforms (creates ios/ and android/ folders, tracked in git).
npm run cap:add:ios
npm run cap:add:android

# Copy config + assets into both platforms.
npm run cap:sync
```

Re-run `npm run cap:sync` any time you change `capacitor.config.ts`, add/remove plugins, or update resources.

---

## 1. Android — building the AAB for Play Store

Play Store requires an Android App Bundle (`.aab`), not an APK.

### First-time: create a release keystore

```bash
# Generate a keystore. STORE THIS FILE AND ITS PASSWORDS IN A PASSWORD MANAGER.
# If you lose it, you cannot publish updates to the same app listing — ever.
keytool -genkey -v -keystore ~/keystores/logio-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias logio

# Move/keep it OUTSIDE the repo. Never commit a keystore.
```

Create `android/keystore.properties` (gitignored) with:

```
storeFile=/Users/sachin/keystores/logio-release.jks
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=logio
keyPassword=YOUR_KEY_PASSWORD
```

Edit `android/app/build.gradle` — add above `android { ... }`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('keystore.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside `android { ... }` add:

```gradle
signingConfigs {
    release {
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Every release

Bump version in `android/app/build.gradle`:
```gradle
versionCode 2       // integer, +1 every upload
versionName "1.0.1" // user-visible
```

Then:

```bash
npm run cap:sync
cd android
./gradlew clean
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

For a quick test APK:
```bash
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Upload to Play Console

1. Play Console → your app → **Release → Production → Create new release**
2. Upload `app-release.aab`
3. Add release notes, save, review, roll out.
4. First release also needs internal test track + closed test track participants per Play's 2023+ policy for new developer accounts. Use the internal test track with 12+ testers for 14 days before production.

---

## 2. iOS — building the IPA for App Store

**Requirements you have / need:**
- Mac with Xcode 16.2 ✓ (confirmed)
- Apple Developer account ($99/year) — needed to sign, distribute, and submit
- Physical iPhone for testing (simulator is fine for dev but App Review won't accept screenshots/videos that look like simulators)
- App Store Connect record for `com.pooptracker.site`

### First-time setup

1. In [developer.apple.com](https://developer.apple.com) → Certificates → register an **Apple Distribution** certificate.
2. In **Identifiers** → register App ID `com.pooptracker.site`, with capabilities: Push Notifications (if you add later), Associated Domains (if you add auth deep links).
3. In **App Store Connect** → My Apps → **New App** with that bundle ID, SKU = `logio`, primary language = English.

### Open the project

```bash
npm run cap:sync
npm run cap:open:ios
```

Xcode opens. First run:
- Select the `App` target → **Signing & Capabilities**
- Team: your Apple Developer team
- Bundle Identifier: `com.pooptracker.site`
- Toggle **Automatically manage signing** ON (easiest path; Xcode provisions for you)

Set version + build number (target → **General**):
- Version: `1.0.0` (user-visible)
- Build: `1` (monotonic integer; bump every upload to App Store Connect)

### Every release — archive & upload

1. In Xcode, top bar: select **Any iOS Device (arm64)** as the destination (not a simulator).
2. Menu **Product → Archive** (takes a couple of minutes).
3. Organizer window opens → select the new archive → **Distribute App**.
4. Choose **App Store Connect** → **Upload** → follow through. Xcode signs + uploads.
5. In App Store Connect, the build appears under **TestFlight** within 10–30 minutes (after processing).
6. Submit to external testers via TestFlight for a few days, then submit for review from **App Store → + Version**.

---

## 3. Store pre-submission checklists

### Shared (prep once, reuse for both stores)

| Asset | Spec |
|---|---|
| App name | `Logio` — 30 chars max (Play: 30, Apple: 30) |
| Subtitle (iOS) | 30 chars max. e.g. "Gut health, tracked simply." |
| Short description (Play) | 80 chars max. e.g. "Track your gut health with private, AI-assisted poop logging." |
| Long description | 4000 chars max (both stores) — template below |
| Privacy Policy URL | `https://app.pooptracker.site/privacy` ([src/app/privacy/](src/app/privacy/)) |
| Terms URL | `https://app.pooptracker.site/terms` ([src/app/terms/](src/app/terms/)) |
| Support URL | `https://app.pooptracker.site/` or a support email |
| Category | Health & Fitness (primary), Medical (secondary — optional) |
| Content rating | 12+ (iOS) / Teen (Play) — see rating notes below |

### Long description template

```
Logio is a private gut-health tracker that helps you understand your
digestive patterns over time. Log each bathroom visit with optional
details — urgency, straining, odour, notes — and an optional photo
for AI-assisted analysis of stool form, colour, and consistency
based on the Bristol scale.

Features
• Quick one-tap logging with flexible optional fields
• Optional photo analysis for stool form, colour, and size
• Daily wellness score with trends over time
• Calendar view of past entries
• Full data export as JSON — your data is yours
• Full account deletion with complete data removal
• Private by default: images are encrypted, never shared, never sold

Logio is not a medical device. It provides informational insights
only and is not a substitute for medical advice, diagnosis, or
treatment. Always consult a qualified healthcare provider for any
medical concerns.
```

### Screenshots

**iOS — required sizes (upload via App Store Connect)**

| Device class | Size | Count |
|---|---|---|
| iPhone 6.9" (15/16 Pro Max) | 1320 × 2868 px | 3–10 |
| iPhone 6.5" (11 Pro Max / XS Max) | 1242 × 2688 px | 3–10 (often auto-derived now) |
| iPad 13" (required if iPad build is submitted) | 2064 × 2752 px | 3–10 |

Use the iPhone 15/16 Pro Max simulator at 1x, take screenshots with `⌘S`, output lands at the correct size.

**Android — required sizes (upload via Play Console)**

| Asset | Size | Count |
|---|---|---|
| Phone screenshots | Min 1080 × 1920 (9:16 or 16:9) | 2–8 |
| 7" tablet (optional) | Min 1024 × 600 | 1–8 |
| 10" tablet (optional) | Min 1080 × 1920 | 1–8 |
| Feature graphic | **Exactly 1024 × 500 PNG/JPG** (required) | 1 |
| App icon | 512 × 512 PNG (required) | 1 |

**Suggested screenshot set (same 4–6 for both stores):**
1. Home — streak + recent entries
2. Log form with Bristol/notes
3. Photo capture or preview
4. Insight page with score ring
5. Calendar / past insights
6. Privacy / data export screen

### Google Play — Data Safety form answers

| Question | Answer |
|---|---|
| Does your app collect or share user data? | Yes, collect; no, not shared |
| Data types collected | Email (Account), Photos (Optional), Health info (digestive notes), User IDs |
| Purposes | App functionality, Account management |
| Shared with third parties? | **No.** (Gemini is a processor, not a third-party data share, per Play's definitions. List the LLM API in your privacy policy.) |
| Encrypted in transit? | **Yes.** (HTTPS everywhere, HSTS set.) |
| Can users request deletion? | **Yes.** ([/profile](src/app/profile/) → Delete account, backed by [/api/account](src/app/api/account/route.ts)) |
| Committed to Play Families Policy? | No (not aimed at children) |

### Google Play — Content rating

Fill out the IARC questionnaire. Expected result: **Teen** (mature themes — bodily functions).

### Apple App Store — Privacy nutrition labels

In App Store Connect → App Privacy:
- **Data Used to Track You**: None.
- **Data Linked to You**: Contact Info (Email), User Content (Photos, Notes), Health & Fitness (Health data), Identifiers (User ID).
- **Data Not Linked to You**: Diagnostics (if you add analytics later).

### Apple App Store — App Review notes

Add in **App Review Information → Notes**:

```
Logio is a gut health tracker. It does not provide medical diagnoses;
all AI-generated insights are clearly hedged ("may indicate") and
accompanied by a disclaimer to consult a healthcare provider.

Test account:
  Email: appreview@pooptracker.site
  OTP: (deliver via the provided email — we use one-time passwords, no
  static password. Please check the inbox on each review attempt.)

No sign-in wall for Terms, Privacy, or the welcome page.
```

### Apple — "minimum functionality" / web-wrapper pushback mitigation

Apple sometimes rejects web-wrapper apps under guideline 4.2. Logio's defense:
- Native camera via `@capacitor/camera` (not HTML `<input>`)
- Native splash + status bar theming
- Offline-capable error screen
- Haptics on key interactions (add via `@capacitor/haptics`)
- Account deletion inside the app (required anyway)

If rejected, reply with a list of native integrations and emphasise the health-data domain + local camera capture.

---

## 4. Version bump cheat-sheet

Every submission needs monotonically increasing build numbers:

| Platform | File | Field to bump |
|---|---|---|
| Android | `android/app/build.gradle` | `versionCode` +1, `versionName` for users |
| iOS | Xcode target → General | `Build` +1, `Version` for users |
| Web | `package.json` | `version` (for your own tracking) |

---

## 5. Troubleshooting

- **"Unable to resolve @capacitor/camera" after install** — run `npx cap sync` again; plugin native code gets copied then.
- **White screen in native app** — `server.url` is unreachable or CSP blocks it. Check the URL loads in Safari/Chrome, and confirm `pooptracker.site` is in `allowNavigation`.
- **iOS archive grayed out** — you're on a simulator destination. Switch to "Any iOS Device (arm64)".
- **Play Console rejects AAB: "signed with debug key"** — you skipped the signing config in `build.gradle`. Re-check `signingConfigs.release` is applied to `buildTypes.release`.
- **"Your app targets API level too low"** — Capacitor 8 targets API 35. If Google bumps the minimum, update `android/variables.gradle` → `targetSdkVersion`.
