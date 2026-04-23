"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft, AlertCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ImageUpload";
import { AnalysisLoader } from "@/components/AnalysisLoader";
import { PoopPicker, type PickerOption } from "@/components/PoopPicker";
import { Stopwatch } from "@/components/Stopwatch";
import { createClient } from "@/lib/supabase/client";
import { sha256Hex } from "@/lib/hash";
import { playFlush } from "@/lib/sound";
import {
  computeHeuristicScore,
  type PoopColor,
  type PoopVolume,
  type PoopComposition,
} from "@/lib/scoring";

const COLOR_OPTIONS: PickerOption<PoopColor>[] = [
  { value: "brown", label: "Brown", visual: <span className="w-7 h-7 rounded-full" style={{ background: "#8b4513" }} /> },
  { value: "dark_brown", label: "Dark brown", visual: <span className="w-7 h-7 rounded-full" style={{ background: "#4a2310" }} /> },
  { value: "yellow", label: "Yellow", visual: <span className="w-7 h-7 rounded-full" style={{ background: "#d4a017" }} /> },
  { value: "green", label: "Green", visual: <span className="w-7 h-7 rounded-full" style={{ background: "#4a7a3a" }} /> },
  { value: "red", label: "Red", visual: <span className="w-7 h-7 rounded-full" style={{ background: "#9a2a2a" }} /> },
  { value: "black", label: "Black", visual: <span className="w-7 h-7 rounded-full" style={{ background: "#1a1a1a" }} /> },
  { value: "pale", label: "Pale", visual: <span className="w-7 h-7 rounded-full border border-stone-300" style={{ background: "#e8d6b0" }} /> },
];

const VOLUME_OPTIONS: PickerOption<PoopVolume>[] = [
  { value: "small", label: "Small", visual: "🥜" },
  { value: "childlike", label: "Child-like", visual: "👶" },
  { value: "normal", label: "Normal", visual: "👍" },
  { value: "large", label: "Large", visual: "💪" },
];

const COMPOSITION_OPTIONS: PickerOption<PoopComposition>[] = [
  { value: "rock", label: "Rocks", visual: <Image src="/poop-icons/rock.svg" alt="" width={32} height={32} /> },
  { value: "pellets", label: "Pellets", visual: <Image src="/poop-icons/pellets.svg" alt="" width={32} height={32} /> },
  { value: "smooth", label: "Smooth", visual: <Image src="/poop-icons/smooth.svg" alt="" width={32} height={32} /> },
  { value: "mushy", label: "Mushy", visual: <Image src="/poop-icons/mushy.svg" alt="" width={32} height={32} /> },
];

const ODOUR_OPTIONS: PickerOption<"none" | "mild" | "strong">[] = [
  { value: "none", label: "None", visual: "😊" },
  { value: "mild", label: "Mild", visual: "🙂" },
  { value: "strong", label: "Strong", visual: "🤢" },
];
const ODOUR_VALUES = { none: 0, mild: 1, strong: 5 } as const;

const URGENCY_OPTIONS: PickerOption<"low" | "medium" | "high">[] = [
  { value: "low", label: "Low", visual: "😌" },
  { value: "medium", label: "Medium", visual: "🙂" },
  { value: "high", label: "High", visual: "😰" },
];
const URGENCY_VALUES = { low: 1, medium: 3, high: 5 } as const;

const STRAIN_OPTIONS: PickerOption<"no" | "yes">[] = [
  { value: "no", label: "No", visual: "😌" },
  { value: "yes", label: "Yes", visual: "😣" },
];

type Stage = "idle" | "saving" | "analysing" | "rejected";

export default function LogPage() {
  const router = useRouter();

  const [time, setTime] = useState(format(new Date(), "HH:mm"));
  const [duration, setDuration] = useState<number | null>(null);
  const [color, setColor] = useState<PoopColor | null>(null);
  const [volume, setVolume] = useState<PoopVolume | null>(null);
  const [composition, setComposition] = useState<PoopComposition | null>(null);
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | null>(null);
  const [straining, setStraining] = useState<"no" | "yes" | null>(null);
  const [odour, setOdour] = useState<"none" | "mild" | "strong" | null>(null);

  const [notes, setNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingEntryId, setPendingEntryId] = useState<string | null>(null);

  const isBusy = stage === "saving" || stage === "analysing";

  function computeScore(): number | null {
    const u = urgency ? URGENCY_VALUES[urgency] : null;
    const s = straining === null ? null : straining === "yes" ? 5 : 1;
    const o = odour ? ODOUR_VALUES[odour] : null;
    return computeHeuristicScore({
      color,
      volume,
      composition,
      urgency: u,
      straining: s,
      odour: o,
    }).total;
  }

  async function runAnalysis(entryId: string) {
    setStage("analysing");
    setError("");
    try {
      const res = await fetch("/api/analyze-poop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_id: entryId }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setError(body.error || "Daily analysis limit reached.");
        setStage("idle");
        router.push(`/insight/${entryId}`);
        return;
      }
      if (res.status === 409) {
        setError(body.error || "This image was already analysed.");
        setStage("idle");
        router.push(`/insight/${entryId}`);
        return;
      }
      if (!res.ok) {
        setError(body.error || "Analysis failed. Entry saved.");
        setStage("idle");
        router.push(`/insight/${entryId}`);
        return;
      }
      if (body.ok === false && body.stage === "pass1") {
        setRejectionReason(body.rejection_reason || "The uploaded picture is not of a poop. Try a different image.");
        setPendingEntryId(entryId);
        setStage("rejected");
        return;
      }
      router.push(`/insight/${entryId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
      setStage("idle");
      router.push(`/insight/${entryId}`);
    }
  }

  async function handleSave() {
    if (isBusy) return;
    setStage("saving");
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }

    let imageHash: string | null = null;
    if (image) {
      try {
        imageHash = await sha256Hex(image);
      } catch {
        imageHash = null;
      }
      if (imageHash) {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: dup } = await supabase
          .from("poop_entries")
          .select("id")
          .eq("user_id", user.id)
          .eq("image_hash", imageHash)
          .gte("logged_at", dayAgo)
          .limit(1)
          .maybeSingle();
        if (dup) {
          setError("This image was already analysed in the last 24 hours.");
          setStage("idle");
          return;
        }
      }
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const loggedAt = new Date(`${today}T${time}`).toISOString();
    const computedScore = computeScore();

    const { data, error: err } = await supabase
      .from("poop_entries")
      .insert({
        user_id: user.id,
        logged_at: loggedAt,
        urgency: urgency ? URGENCY_VALUES[urgency] : null,
        straining: straining === null ? null : straining === "yes" ? 5 : 1,
        odour: odour ? ODOUR_VALUES[odour] : null,
        notes: notes.trim() || null,
        image_hash: imageHash,
        score: computedScore,
        poop_color: color,
        poop_volume: volume,
        poop_composition: composition,
        duration_seconds: duration,
      })
      .select("id")
      .single();

    if (err) {
      setError(err.message);
      setStage("idle");
      return;
    }

    playFlush();
    if (typeof window !== "undefined") {
      localStorage.removeItem("ktp.stopwatch");
    }

    if (image) {
      const path = `${user.id}/${data.id}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from("poop-images")
        .upload(path, image, { contentType: image.type, upsert: true });

      if (uploadErr) {
        await supabase.from("poop_entries").delete().eq("id", data.id);
        setError(`Image upload failed: ${uploadErr.message}`);
        setStage("idle");
        return;
      }

      const { error: updateErr } = await supabase
        .from("poop_entries")
        .update({ image_path: path })
        .eq("id", data.id);

      if (updateErr) {
        await supabase.storage.from("poop-images").remove([path]);
        await supabase.from("poop_entries").delete().eq("id", data.id);
        setError(`Failed to save image: ${updateErr.message}`);
        setStage("idle");
        return;
      }

      await runAnalysis(data.id);
      return;
    }

    router.push(`/insight/${data.id}`);
  }

  async function handleReplaceAndRetry(newFile: File) {
    if (!pendingEntryId) return;
    setStage("saving");
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }
    let newHash: string | null = null;
    try {
      newHash = await sha256Hex(newFile);
    } catch {
      newHash = null;
    }
    const path = `${user.id}/${pendingEntryId}.jpg`;
    const { error: uploadErr } = await supabase.storage
      .from("poop-images")
      .upload(path, newFile, { contentType: newFile.type, upsert: true });
    if (uploadErr) {
      setError(`Image upload failed: ${uploadErr.message}`);
      setStage("rejected");
      return;
    }
    if (newHash) {
      await supabase
        .from("poop_entries")
        .update({ image_hash: newHash })
        .eq("id", pendingEntryId);
    }
    setImage(newFile);
    await runAnalysis(pendingEntryId);
  }

  function handleSaveWithoutAnalysis() {
    if (pendingEntryId) router.push(`/insight/${pendingEntryId}`);
  }

  return (
    <main className="flex flex-col min-h-screen bg-stone-50">
      {stage === "analysing" && <AnalysisLoader />}

      <header className="flex items-center gap-3 px-5 pt-12 pb-5">
        <Link href="/home">
          <button className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-stone-800">Log a poop</h1>
          <p className="text-xs text-stone-400">
            {format(new Date(), "EEEE, d MMMM")}
          </p>
        </div>
      </header>

      <div className="flex-1 px-5 pb-32 space-y-6">
        {/* Time + Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">Time</Label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-12 rounded-xl border border-stone-200 bg-white px-4 text-stone-800 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">
              Duration
            </Label>
            <Stopwatch value={duration} onChange={setDuration} />
          </div>
        </div>

        {/* Photo */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">
            Photo <span className="text-stone-400 font-normal">(auto-fills traits)</span>
          </Label>
          <ImageUpload value={image} onChange={setImage} />
        </div>

        {/* Colour */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">
            Colour
          </Label>
          <PoopPicker
            options={COLOR_OPTIONS}
            value={color}
            onChange={setColor}
            columns={4}
          />
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">
            Volume
          </Label>
          <PoopPicker
            options={VOLUME_OPTIONS}
            value={volume}
            onChange={setVolume}
            columns={4}
          />
        </div>

        {/* Composition */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">
            Composition
          </Label>
          <PoopPicker
            options={COMPOSITION_OPTIONS}
            value={composition}
            onChange={setComposition}
            columns={4}
          />
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">
            Urgency
          </Label>
          <PoopPicker
            options={URGENCY_OPTIONS}
            value={urgency}
            onChange={setUrgency}
            columns={3}
          />
        </div>

        {/* Straining */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">
            Straining
          </Label>
          <PoopPicker
            options={STRAIN_OPTIONS}
            value={straining}
            onChange={setStraining}
            columns={4}
          />
        </div>

        {/* Odour */}
        <div className="space-y-2">
          <Label className="text-stone-700 font-medium">
            Odour
          </Label>
          <PoopPicker
            options={ODOUR_OPTIONS}
            value={odour}
            onChange={setOdour}
            columns={3}
          />
        </div>

        {/* Notes collapsible */}
        <div className="space-y-2">
          {!notesOpen ? (
            <button
              type="button"
              onClick={() => setNotesOpen(true)}
              className="w-full h-12 rounded-xl border border-dashed border-stone-300 bg-white text-sm text-stone-500 hover:border-amber-400 hover:text-amber-700 active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              <ChevronDown className="w-4 h-4" />
              Add notes (optional)
            </button>
          ) : (
            <>
              <Label className="text-stone-700 font-medium">
                Notes
              </Label>
              <Textarea
                placeholder="Anything to note?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                autoFocus
                className="rounded-xl border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-500 resize-none"
              />
            </>
          )}
        </div>

        {stage === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Couldn&apos;t analyse this image
                </p>
                <p className="text-sm text-red-600 mt-1 leading-relaxed">
                  {rejectionReason}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleReplaceAndRetry(f);
                  }}
                />
                <span className="block w-full h-11 rounded-xl bg-amber-600 text-white text-sm font-medium flex items-center justify-center active:scale-95 transition-transform cursor-pointer">
                  Try different image
                </span>
              </label>
              <button
                type="button"
                onClick={handleSaveWithoutAnalysis}
                className="flex-1 h-11 rounded-xl bg-white border border-stone-200 text-stone-600 text-sm font-medium active:scale-95 transition-transform"
              >
                Save without analysis
              </button>
            </div>
          </div>
        )}

        {error && stage !== "rejected" && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
      </div>

      {stage !== "rejected" && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
          <Button
            onClick={handleSave}
            disabled={isBusy}
            className="w-full h-14 rounded-2xl text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200 active:scale-95 transition-transform"
          >
            {stage === "saving" ? "Saving…" : "Save entry →"}
          </Button>
        </div>
      )}
    </main>
  );
}
