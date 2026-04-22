import { isNative } from "./native";

const REMINDER_ID = 1;

function parseTime(time: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

/**
 * Schedule (or cancel) a daily local notification at HH:MM.
 * Pass null to cancel.
 * No-op on web — web users see in-app UI only.
 */
export async function scheduleDailyReminder(time: string | null): Promise<void> {
  if (!isNative()) return;

  const { LocalNotifications } = await import("@capacitor/local-notifications");

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: REMINDER_ID }],
    });
  } catch {
    // ignore — nothing to cancel
  }

  if (!time) return;
  const parsed = parseTime(time);
  if (!parsed) return;

  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") {
    const req = await LocalNotifications.requestPermissions();
    if (req.display !== "granted") return;
  }

  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: "Time to log your poop 💩",
        body: "Keep your streak going.",
        extra: { route: "/log" },
        schedule: {
          on: { hour: parsed.hour, minute: parsed.minute },
          allowWhileIdle: true,
        },
      },
    ],
  });
}

/**
 * Register once on app boot. When the user taps a notification, navigate
 * to the route carried in its `extra.route` payload.
 */
export async function registerNotificationTapHandler(
  onNavigate: (route: string) => void,
): Promise<void> {
  if (!isNative()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.addListener(
    "localNotificationActionPerformed",
    (action) => {
      const route = action.notification.extra?.route;
      if (typeof route === "string" && route.startsWith("/")) {
        onNavigate(route);
      }
    },
  );
}
