import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";

export const GET = withAuth(async (_req, { user, supabase }) => {
  const [{ data: profile }, { data: issues }, { data: entries }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_issues").select("*").eq("user_id", user.id),
      supabase
        .from("poop_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false }),
    ]);

  const entryIds = (entries ?? []).map((e) => e.id);
  const [{ data: analyses }, { data: feedback }] = await Promise.all([
    entryIds.length
      ? supabase.from("poop_analysis").select("*").in("entry_id", entryIds)
      : Promise.resolve({ data: [] }),
    entryIds.length
      ? supabase.from("analysis_feedback").select("*").in("entry_id", entryIds)
      : Promise.resolve({ data: [] }),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    profile,
    issues,
    entries,
    analyses,
    feedback,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="logio-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
});
