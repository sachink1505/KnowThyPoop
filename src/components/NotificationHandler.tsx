"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerNotificationTapHandler } from "@/lib/notifications";

export function NotificationHandler() {
  const router = useRouter();
  useEffect(() => {
    registerNotificationTapHandler((route) => {
      router.push(route);
    });
  }, [router]);
  return null;
}
