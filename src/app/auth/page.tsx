"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type EmailForm = z.infer<typeof emailSchema>;

const RESEND_SECONDS = 20;

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });

  // Resend countdown
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (otp.every((d) => d !== "")) {
      verifyOtp(otp.join(""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  async function sendOtp({ email: emailValue }: EmailForm) {
    setIsLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: emailValue,
      options: { shouldCreateUser: true },
    });
    setIsLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setEmail(emailValue);
    setStep("otp");
    setResendSeconds(RESEND_SECONDS);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }

  async function verifyOtp(code: string) {
    setIsLoading(true);
    setError("");
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    if (err) {
      setIsLoading(false);
      setError(err.message);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
      return;
    }
    // Check if profile is complete
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .single();
    router.push(profile?.name ? "/home" : "/onboarding");
  }

  async function resendOtp() {
    setIsLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setIsLoading(false);
    if (err) { setError(err.message); return; }
    setResendSeconds(RESEND_SECONDS);
    setOtp(["", "", "", "", "", ""]);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">💩</div>
          <h1 className="text-2xl font-bold text-stone-800">
            {step === "email" ? "Welcome to Logio" : "Check your inbox"}
          </h1>
          <p className="text-stone-500 mt-2 text-sm leading-relaxed">
            {step === "email"
              ? "Enter your email and we'll send you a one-time code."
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {/* Email step */}
        {step === "email" && (
          <form onSubmit={handleSubmit(sendOtp)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-stone-700">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 rounded-xl border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-500"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md shadow-amber-100"
            >
              {isLoading ? "Sending…" : "Send OTP"}
            </Button>

            <p className="text-center text-xs text-stone-400 mt-4">
              By proceeding you agree to our{" "}
              <a href="/terms" className="underline text-stone-500 hover:text-amber-700">
                Terms & Conditions
              </a>
            </p>
          </form>
        )}

        {/* OTP step */}
        {step === "otp" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-stone-700 text-sm">Enter 6-digit code</Label>
              <div
                className="flex gap-2 justify-between"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={isLoading}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            {isLoading && (
              <p className="text-sm text-stone-400 text-center">Verifying…</p>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={resendOtp}
                disabled={resendSeconds > 0 || isLoading}
                className="text-sm text-stone-500 disabled:text-stone-300 hover:text-amber-700 disabled:cursor-not-allowed transition-colors"
              >
                {resendSeconds > 0
                  ? `Resend code in ${resendSeconds}s`
                  : "Resend OTP"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setStep("email"); setError(""); setOtp(["","","","","",""]); }}
              className="w-full text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              ← Use a different email
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
