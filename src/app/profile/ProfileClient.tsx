"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Pencil,
  Share2,
  Trash2,
  LogOut,
  Check,
  X,
  Bell,
} from "lucide-react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { AvatarPicker, AVATAR_SEEDS, avatarUrl } from "@/components/AvatarPicker";
import { scheduleDailyReminder } from "@/lib/notifications";
import type { Profile, UserIssue } from "@/types/database";

const APP_VERSION = "0.3.0";

const ISSUE_OPTIONS = [
  { id: "multiple_times", label: "Poop multiple times a day" },
  { id: "constipation", label: "Irregular poop – constipation" },
  { id: "piles", label: "Piles" },
  { id: "other", label: "Other" },
  { id: "none", label: "No issues" },
];

function issueLabel(id: string, custom: string | null) {
  if (id === "other" && custom) return custom;
  return ISSUE_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

type Props = {
  email: string;
  profile: Profile;
  issues: UserIssue[];
};

export function ProfileClient({ email, profile, issues }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [editingBasics, setEditingBasics] = useState(false);
  const [editingIssues, setEditingIssues] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingReminder, setEditingReminder] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);

  const [name, setName] = useState(profile.name ?? "");
  const [age, setAge] = useState(profile.age?.toString() ?? "");
  const [phone, setPhone] = useState<string | undefined>(profile.phone ?? undefined);
  const [reminderTime, setReminderTime] = useState(
    profile.reminder_time ? profile.reminder_time.slice(0, 5) : ""
  );
  const [avatarSeed, setAvatarSeed] = useState<string>(
    profile.avatar_seed ?? AVATAR_SEEDS[0]
  );

  const [selectedIssues, setSelectedIssues] = useState<string[]>(
    issues.map((i) => i.issue_type)
  );
  const [customIssue, setCustomIssue] = useState(
    issues.find((i) => i.issue_type === "other")?.custom_issue ?? ""
  );

  const [savedName, setSavedName] = useState(profile.name ?? "");
  const [savedAge, setSavedAge] = useState(profile.age);
  const [savedPhone, setSavedPhone] = useState(profile.phone ?? "");
  const [savedReminder, setSavedReminder] = useState(
    profile.reminder_time ? profile.reminder_time.slice(0, 5) : ""
  );
  const [savedAvatar, setSavedAvatar] = useState<string>(
    profile.avatar_seed ?? AVATAR_SEEDS[0]
  );
  const [savedIssues, setSavedIssues] = useState<UserIssue[]>(issues);

  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function saveBasics() {
    if (!name.trim() || !age || Number(age) < 1 || Number(age) > 120) {
      flash("Enter a valid name and age");
      return;
    }
    setBusy("basics");
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), age: Number(age) })
      .eq("id", profile.id);
    setBusy(null);
    if (error) {
      flash(error.message);
      return;
    }
    setSavedName(name.trim());
    setSavedAge(Number(age));
    setEditingBasics(false);
    flash("Saved");
  }

  async function savePhone() {
    const value = phone ?? "";
    if (value && !isValidPhoneNumber(value)) {
      flash("Enter a valid phone number");
      return;
    }
    setBusy("phone");
    const { error } = await supabase
      .from("profiles")
      .update({ phone: value || null })
      .eq("id", profile.id);
    setBusy(null);
    if (error) {
      flash(error.message);
      return;
    }
    setSavedPhone(value);
    setEditingPhone(false);
    flash("Saved");
  }

  async function saveReminder() {
    setBusy("reminder");
    const value = reminderTime ? `${reminderTime}:00` : null;
    const { error } = await supabase
      .from("profiles")
      .update({ reminder_time: value })
      .eq("id", profile.id);
    setBusy(null);
    if (error) {
      flash(error.message);
      return;
    }
    await scheduleDailyReminder(reminderTime || null);
    setSavedReminder(reminderTime);
    setEditingReminder(false);
    flash(reminderTime ? "Reminder set" : "Reminder off");
  }

  async function saveAvatar() {
    setBusy("avatar");
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_seed: avatarSeed })
      .eq("id", profile.id);
    setBusy(null);
    if (error) {
      flash(error.message);
      return;
    }
    setSavedAvatar(avatarSeed);
    setEditingAvatar(false);
    flash("Avatar updated");
  }

  async function saveIssues() {
    setBusy("issues");
    const { error: delErr } = await supabase
      .from("user_issues")
      .delete()
      .eq("user_id", profile.id);
    if (delErr) {
      setBusy(null);
      flash(delErr.message);
      return;
    }
    const rows = selectedIssues.map((id) => ({
      user_id: profile.id,
      issue_type: id,
      custom_issue: id === "other" ? customIssue || null : null,
    }));
    if (rows.length > 0) {
      const { data, error } = await supabase
        .from("user_issues")
        .insert(rows)
        .select();
      setBusy(null);
      if (error) {
        flash(error.message);
        return;
      }
      setSavedIssues(data ?? []);
    } else {
      setBusy(null);
      setSavedIssues([]);
    }
    setEditingIssues(false);
    flash("Saved");
  }

  function toggleIssue(id: string) {
    setSelectedIssues((prev) => {
      if (id === "none") return prev.includes("none") ? [] : ["none"];
      const withoutNone = prev.filter((i) => i !== "none");
      return withoutNone.includes(id)
        ? withoutNone.filter((i) => i !== id)
        : [...withoutNone, id];
    });
  }

  async function handleShare() {
    const url =
      typeof window !== "undefined" ? window.location.origin : "https://pooptracker.site";
    const shareData = {
      title: "Know Thy Poop — gut health tracker",
      text: "I'm tracking my gut with Know Thy Poop. Join me!",
      url,
    };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled — fall through
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied");
    } catch {
      flash("Could not share — copy: " + url);
    }
  }

  async function handleDelete() {
    setBusy("delete");
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to delete account");
      }
      router.push("/");
    } catch (e) {
      setBusy(null);
      flash(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleSignOut() {
    setBusy("signout");
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main className="flex flex-col min-h-screen bg-stone-50 pb-10">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-12 pb-5">
        <Link href="/home">
          <button className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
        </Link>
        <h1 className="text-lg font-bold text-stone-800">Profile</h1>
      </header>

      <div className="px-5 space-y-4">
        {/* Avatar + email */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setEditingAvatar((v) => !v)}
              className="shrink-0 w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 overflow-hidden active:scale-95 transition"
              aria-label="Change avatar"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl(savedAvatar)}
                alt="Avatar"
                className="w-full h-full"
              />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-stone-400 mb-0.5">Signed in as</p>
              <p className="text-sm font-medium text-stone-700 break-all">{email}</p>
            </div>
          </div>

          {editingAvatar && (
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
              <AvatarPicker value={avatarSeed} onChange={setAvatarSeed} />
              <div className="flex gap-2">
                <Button
                  onClick={saveAvatar}
                  disabled={busy === "avatar"}
                  className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {busy === "avatar" ? "Saving…" : "Save"}
                </Button>
                <Button
                  onClick={() => {
                    setAvatarSeed(savedAvatar);
                    setEditingAvatar(false);
                  }}
                  variant="outline"
                  className="h-10 rounded-xl border-stone-200 text-stone-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Basics: name + age */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-700">About you</h2>
            {!editingBasics && (
              <button
                onClick={() => setEditingBasics(true)}
                className="text-stone-400 hover:text-amber-700 active:scale-95 transition"
                aria-label="Edit name and age"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {!editingBasics ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-stone-400">Name</span>
                <span className="text-sm font-medium text-stone-700">
                  {savedName || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-stone-400">Age</span>
                <span className="text-sm font-medium text-stone-700">
                  {savedAge ?? "—"}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-stone-500">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl border-stone-200 bg-stone-50 focus-visible:ring-amber-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-xs text-stone-500">
                  Age
                </Label>
                <Input
                  id="age"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
                  className="h-11 rounded-xl border-stone-200 bg-stone-50 focus-visible:ring-amber-500"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={saveBasics}
                  disabled={busy === "basics"}
                  className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {busy === "basics" ? "Saving…" : "Save"}
                </Button>
                <Button
                  onClick={() => {
                    setName(savedName);
                    setAge(savedAge?.toString() ?? "");
                    setEditingBasics(false);
                  }}
                  variant="outline"
                  className="h-10 rounded-xl border-stone-200 text-stone-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Reminder */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-stone-700">Daily reminder</h2>
            </div>
            {!editingReminder && (
              <button
                onClick={() => setEditingReminder(true)}
                className="text-stone-400 hover:text-amber-700 active:scale-95 transition"
                aria-label="Edit reminder"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {!editingReminder ? (
            <p className="text-sm font-medium text-stone-700">
              {savedReminder || <span className="text-stone-400 italic">Off</span>}
            </p>
          ) : (
            <div className="space-y-3">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full h-11 rounded-xl border border-stone-200 bg-stone-50 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {reminderTime && (
                <button
                  type="button"
                  onClick={() => setReminderTime("")}
                  className="text-xs text-stone-500 underline"
                >
                  Turn off
                </button>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={saveReminder}
                  disabled={busy === "reminder"}
                  className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {busy === "reminder" ? "Saving…" : "Save"}
                </Button>
                <Button
                  onClick={() => {
                    setReminderTime(savedReminder);
                    setEditingReminder(false);
                  }}
                  variant="outline"
                  className="h-10 rounded-xl border-stone-200 text-stone-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Issues */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-700">
              Gut health issues
            </h2>
            {!editingIssues && (
              <button
                onClick={() => setEditingIssues(true)}
                className="text-stone-400 hover:text-amber-700 active:scale-95 transition"
                aria-label="Edit issues"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {!editingIssues ? (
            savedIssues.length > 0 ? (
              <ul className="space-y-1.5">
                {savedIssues.map((i) => (
                  <li
                    key={i.id}
                    className="text-sm text-stone-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-stone-400"
                  >
                    {issueLabel(i.issue_type, i.custom_issue)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-400 italic">None declared</p>
            )
          ) : (
            <div className="space-y-2">
              {ISSUE_OPTIONS.map(({ id, label }) => (
                <label
                  key={id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer"
                  style={{
                    borderColor: selectedIssues.includes(id)
                      ? "rgb(217 119 6)"
                      : undefined,
                    backgroundColor: selectedIssues.includes(id)
                      ? "rgb(255 251 235)"
                      : undefined,
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
              {selectedIssues.includes("other") && (
                <Input
                  placeholder="Describe your issue…"
                  value={customIssue}
                  onChange={(e) => setCustomIssue(e.target.value)}
                  className="h-10 rounded-xl border-stone-200 bg-stone-50 focus-visible:ring-amber-500"
                />
              )}
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={saveIssues}
                  disabled={busy === "issues"}
                  className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {busy === "issues" ? "Saving…" : "Save"}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedIssues(savedIssues.map((i) => i.issue_type));
                    setCustomIssue(
                      savedIssues.find((i) => i.issue_type === "other")
                        ?.custom_issue ?? ""
                    );
                    setEditingIssues(false);
                  }}
                  variant="outline"
                  className="h-10 rounded-xl border-stone-200 text-stone-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-stone-700">Phone</h2>
              <p className="text-xs text-stone-400 mt-0.5">Optional</p>
            </div>
            {!editingPhone && (
              <button
                onClick={() => setEditingPhone(true)}
                className="text-stone-400 hover:text-amber-700 active:scale-95 transition"
                aria-label="Edit phone"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {!editingPhone ? (
            <p className="text-sm font-medium text-stone-700">
              {savedPhone || <span className="text-stone-400 italic">Not set</span>}
            </p>
          ) : (
            <div className="space-y-3">
              <div className="ktp-phone-input">
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={phone}
                  onChange={setPhone}
                  placeholder="Phone number"
                />
              </div>
              <p className="text-xs text-stone-400">
                Pick country, enter digits only.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={savePhone}
                  disabled={busy === "phone"}
                  className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {busy === "phone" ? "Saving…" : "Save"}
                </Button>
                <Button
                  onClick={() => {
                    setPhone(savedPhone || undefined);
                    setEditingPhone(false);
                  }}
                  variant="outline"
                  className="h-10 rounded-xl border-stone-200 text-stone-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 divide-y divide-stone-100 overflow-hidden">
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-stone-50 active:bg-stone-100 transition"
          >
            <Share2 className="w-5 h-5 text-stone-500" />
            <span className="text-sm font-medium text-stone-700">
              Share with friends
            </span>
          </button>
          <button
            onClick={handleSignOut}
            disabled={busy === "signout"}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-stone-50 active:bg-stone-100 transition disabled:opacity-50"
          >
            <LogOut className="w-5 h-5 text-stone-500" />
            <span className="text-sm font-medium text-stone-700">
              {busy === "signout" ? "Signing out…" : "Sign out"}
            </span>
          </button>
        </div>

        {/* Delete */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 active:bg-red-100 transition text-red-600"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-sm font-medium">Delete my account</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 text-center space-y-2">
          <p className="text-xs text-stone-400">Know Thy Poop v{APP_VERSION}</p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <Link href="/terms" className="text-stone-500 hover:text-amber-700 underline">
              Terms
            </Link>
            <span className="text-stone-300">·</span>
            <Link
              href="/privacy"
              className="text-stone-500 hover:text-amber-700 underline"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-5">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">
              Delete your account?
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed mb-4">
              Permanently deletes your profile, entries, analyses, and images.
              Can&apos;t be undone.
            </p>
            <Label className="text-xs text-stone-500 mb-1.5 block">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm
            </Label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="h-11 rounded-xl border-stone-200 focus-visible:ring-red-500 mb-4"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                variant="outline"
                className="flex-1 h-11 rounded-xl border-stone-200 text-stone-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteConfirmText !== "DELETE" || busy === "delete"}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {busy === "delete" ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
