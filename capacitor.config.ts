import type { CapacitorConfig } from "@capacitor/cli";

// IMPORTANT: replace PROD_URL with your real Vercel deployment before running
// `npx cap sync`. `server.url` makes the native shell load this URL inside a
// WebView instead of bundled web assets — this is what keeps the Next.js API
// routes, SSR, and Supabase cookie auth all working unchanged.
//
// If PROD_URL is not yet provisioned, Capacitor will still scaffold; just
// remember to sync again once the domain is live.
const PROD_URL = "https://app.pooptracker.site";

const config: CapacitorConfig = {
  appId: "com.pooptracker.site",
  appName: "Know Thy Poop",
  webDir: "out", // only used if/when we later switch to static export
  server: {
    url: PROD_URL,
    // Android requires this for non-HTTPS only; we're on HTTPS so keep false.
    cleartext: false,
    // Restrict which hosts the WebView will navigate to; prevents hijack to
    // a phishing URL if a link is ever opened in-app.
    allowNavigation: ["app.pooptracker.site", "*.pooptracker.site"],
  },
  ios: {
    // Prevent the WebView from zooming on input focus; matches web behavior.
    contentInset: "always",
  },
  android: {
    // Matches our CSP posture — no arbitrary http schemes.
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#fafaf9", // stone-50 — matches app bg
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: "LIGHT", // light content on our amber-tinted bars
      backgroundColor: "#fafaf9",
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#d97706",
    },
  },
};

export default config;
