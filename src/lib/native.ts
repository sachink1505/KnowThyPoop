import { Capacitor } from "@capacitor/core";

/** True when running inside the Capacitor native shell (iOS/Android). */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/** "ios" | "android" | "web" */
export function platform(): string {
  return Capacitor.getPlatform();
}
