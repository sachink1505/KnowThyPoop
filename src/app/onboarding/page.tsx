"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { scheduleDailyReminder } from "@/lib/notifications";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  age: z
    .string()
    .min(1, "Age is required")
    .refine((v) => Number(v) >= 1 && Number(v) <= 120, "Enter a valid age"),
});
type FormData = z.infer<typeof schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [reminderTime, setReminderTime] = useState("09:00");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit({ name, age }: FormData) {
    setIsLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const reminderValue =
      reminderEnabled && reminderTime ? `${reminderTime}:00` : null;

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        name,
        age: Number(age),
        reminder_time: reminderValue,
      })
      .eq("id", user.id);

    if (profileErr) {
      setError(profileErr.message);
      setIsLoading(false);
      return;
    }

    await scheduleDailyReminder(reminderEnabled ? reminderTime : null);

    router.push("/home");
  }

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 px-6 pt-16 pb-10">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Quick setup</h1>
          <p className="text-stone-500 text-sm mt-1">
            Takes 20 seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-stone-700">Your name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Alex"
              autoComplete="given-name"
              className="h-12 rounded-xl border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-500"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <Label htmlFor="age" className="text-stone-700">Your age</Label>
            <Input
              id="age"
              inputMode="numeric"
              placeholder="28"
              className="h-12 rounded-xl border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-500"
              {...register("age")}
            />
            {errors.age && (
              <p className="text-sm text-red-500">{errors.age.message}</p>
            )}
          </div>

          {/* Reminder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-stone-700">Daily reminder</Label>
              <button
                type="button"
                onClick={() => setReminderEnabled((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  reminderEnabled ? "bg-amber-600" : "bg-stone-300"
                }`}
                aria-label="Toggle reminder"
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    reminderEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {reminderEnabled ? (
              <>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-stone-400">
                  We&apos;ll nudge you every day at this time.
                </p>
              </>
            ) : (
              <p className="text-xs text-stone-400">
                You can set a reminder later in Profile.
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md shadow-amber-100 mt-2"
          >
            {isLoading ? "Saving…" : "Let's go →"}
          </Button>
        </form>
      </div>
    </main>
  );
}
