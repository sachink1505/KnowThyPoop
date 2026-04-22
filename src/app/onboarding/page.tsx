"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";

const ISSUES = [
  { id: "multiple_times", label: "Poop multiple times a day" },
  { id: "constipation", label: "Irregular poop – constipation" },
  { id: "piles", label: "Piles" },
  { id: "other", label: "Other" },
  { id: "none", label: "No issues" },
];

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

  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [customIssue, setCustomIssue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function toggleIssue(id: string) {
    setSelectedIssues((prev) => {
      if (id === "none") return prev.includes("none") ? [] : ["none"];
      const withoutNone = prev.filter((i) => i !== "none");
      return withoutNone.includes(id)
        ? withoutNone.filter((i) => i !== id)
        : [...withoutNone, id];
    });
  }

  async function onSubmit({ name, age }: FormData) {
    setIsLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ name, age: Number(age) })
      .eq("id", user.id);

    if (profileErr) {
      setError(profileErr.message);
      setIsLoading(false);
      return;
    }

    if (selectedIssues.length > 0) {
      const issueRows = selectedIssues.map((id) => ({
        user_id: user.id,
        issue_type: id,
        custom_issue: id === "other" ? customIssue || null : null,
      }));
      const { error: issueErr } = await supabase
        .from("user_issues")
        .insert(issueRows);
      if (issueErr) {
        setError(issueErr.message);
        setIsLoading(false);
        return;
      }
    }

    router.push("/home");
  }

  const showOther = selectedIssues.includes("other");

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 px-6 pt-16 pb-10">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Let's get to know you</h1>
          <p className="text-stone-500 text-sm mt-1">
            This helps us personalise your insights.
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

          {/* Issues */}
          <div className="space-y-3">
            <Label className="text-stone-700">Any issues with your poop?</Label>
            <div className="space-y-2">
              {ISSUES.map(({ id, label }) => (
                <label
                  key={id}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 bg-white cursor-pointer hover:border-amber-300 hover:bg-amber-50 transition-colors"
                  style={{
                    borderColor: selectedIssues.includes(id) ? "rgb(217 119 6)" : undefined,
                    backgroundColor: selectedIssues.includes(id) ? "rgb(255 251 235)" : undefined,
                  }}
                >
                  <Checkbox
                    checked={selectedIssues.includes(id)}
                    onCheckedChange={() => toggleIssue(id)}
                    className="border-stone-300 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <span className="text-sm text-stone-700">{label}</span>
                </label>
              ))}
            </div>

            {showOther && (
              <Input
                placeholder="Describe your issue…"
                value={customIssue}
                onChange={(e) => setCustomIssue(e.target.value)}
                className="h-11 rounded-xl border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-500"
              />
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
