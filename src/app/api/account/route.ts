import { NextResponse } from "next/server";
import { createClient as createJsClient } from "@supabase/supabase-js";
import { withAuth, apiError } from "@/lib/api";
import { env, requireServiceRoleKey } from "@/lib/env";

export const DELETE = withAuth(async (_req, { user, supabase }) => {
  const admin = createJsClient(env.NEXT_PUBLIC_SUPABASE_URL, requireServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: entries, error: entriesErr } = await admin
    .from("poop_entries")
    .select("id, image_path")
    .eq("user_id", user.id);
  if (entriesErr) return apiError(entriesErr.message, 500);

  const entryIds = (entries ?? []).map((e) => e.id);
  const imagePaths = (entries ?? [])
    .map((e) => e.image_path)
    .filter((p): p is string => !!p);

  if (imagePaths.length > 0) {
    await admin.storage.from("poop-images").remove(imagePaths);
  }

  if (entryIds.length > 0) {
    await admin.from("analysis_feedback").delete().in("entry_id", entryIds);
    await admin.from("poop_analysis").delete().in("entry_id", entryIds);
  }

  await admin.from("poop_entries").delete().eq("user_id", user.id);
  await admin.from("user_issues").delete().eq("user_id", user.id);
  await admin.from("profiles").delete().eq("id", user.id);

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return apiError(delErr.message, 500);

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
});
