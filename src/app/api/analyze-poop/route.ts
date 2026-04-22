import { z } from "zod";
import { NextResponse } from "next/server";
import { withAuth, apiError } from "@/lib/api";
import { getProvider } from "@/lib/llm";
import { calculateScore } from "@/lib/scoring";
import "@/lib/env";

const DAILY_LIMIT = 10;

const bodySchema = z.object({
  entry_id: z.string().uuid(),
});

export const POST = withAuth<Record<string, never>, z.infer<typeof bodySchema>>(
  async (_req, { user, supabase, body }) => {
    const { entry_id: entryId } = body;

    // Daily rate limit — count analyses tied to this user's entries today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: todaysEntries } = await supabase
      .from("poop_entries")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", startOfDay.toISOString());

    const todaysEntryIds = (todaysEntries ?? []).map((e) => e.id);
    if (todaysEntryIds.length > 0) {
      const { count } = await supabase
        .from("poop_analysis")
        .select("id", { count: "exact", head: true })
        .in("entry_id", todaysEntryIds);
      if ((count ?? 0) >= DAILY_LIMIT) {
        return apiError(
          `Daily analysis limit reached (${DAILY_LIMIT}/day). Please try again tomorrow.`,
          429
        );
      }
    }

    const { data: entry, error: entryErr } = await supabase
      .from("poop_entries")
      .select("*")
      .eq("id", entryId)
      .eq("user_id", user.id)
      .single();

    if (entryErr || !entry) return apiError("Entry not found", 404);
    if (!entry.image_path) {
      return apiError("Entry has no image to analyse", 400);
    }

    // Duplicate-image abuse check — same hash from this user in last 24h,
    // excluding the entry we're currently analysing.
    if (entry.image_hash) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: dup } = await supabase
        .from("poop_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("image_hash", entry.image_hash)
        .gte("logged_at", dayAgo)
        .neq("id", entry.id)
        .limit(1)
        .maybeSingle();

      if (dup) {
        return apiError("This image was already analysed.", 409, {
          stage: "duplicate",
        });
      }
    }

    const { data: signed, error: signErr } = await supabase.storage
      .from("poop-images")
      .createSignedUrl(entry.image_path, 60);
    if (signErr || !signed) return apiError("Failed to load image", 500);

    const imgRes = await fetch(signed.signedUrl);
    if (!imgRes.ok) return apiError("Failed to fetch image", 500);

    const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
    const bytes = await imgRes.arrayBuffer();
    const imageBase64 = Buffer.from(bytes).toString("base64");

    const provider = getProvider();

    let pass1;
    try {
      pass1 = await provider.validateImage(imageBase64, mimeType);
    } catch (e) {
      return apiError(
        `Validation failed: ${e instanceof Error ? e.message : "unknown"}`,
        502
      );
    }

    if (!pass1.is_stool || pass1.confidence < 0.6 || pass1.is_blurry) {
      return NextResponse.json(
        {
          ok: false,
          stage: "pass1",
          rejection_reason:
            pass1.rejection_reason ||
            (pass1.is_blurry
              ? "Image is too blurry to analyse."
              : "That doesn't look like a stool sample."),
          pass1,
        },
        { status: 200 }
      );
    }

    let pass2;
    try {
      pass2 = await provider.analyze(imageBase64, mimeType, {
        urgency: entry.urgency,
        straining: entry.straining,
        odour: entry.odour,
        notes: entry.notes,
      });
    } catch (e) {
      return apiError(
        `Analysis failed: ${e instanceof Error ? e.message : "unknown"}`,
        502
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { count: weeklyCount } = await supabase
      .from("poop_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("logged_at", sevenDaysAgo.toISOString());

    const breakdown = calculateScore({
      analysis: pass2.result,
      urgency: entry.urgency,
      straining: entry.straining,
      weeklyEntryCount: weeklyCount ?? 1,
    });

    const bristolLabel = `Type ${pass2.result.stool_form}`;

    const { error: insertErr } = await supabase.from("poop_analysis").insert({
      entry_id: entry.id,
      stool_form: bristolLabel,
      color: pass2.result.color,
      size: pass2.result.size,
      surface_texture: pass2.result.surface_texture,
      visible_elements: pass2.result.visible_elements,
      objective_summary: JSON.stringify(pass2.result.objective_summary),
      insights: JSON.stringify(pass2.result.insights),
      corrections: JSON.stringify(pass2.result.corrections),
      raw_response: pass2.raw as never,
    });

    if (insertErr) {
      return apiError(`Failed to save analysis: ${insertErr.message}`, 500);
    }

    await supabase
      .from("poop_entries")
      .update({ score: breakdown.total })
      .eq("id", entry.id);

    return NextResponse.json({
      ok: true,
      analysis: pass2.result,
      score: breakdown.total,
      breakdown,
    });
  },
  { bodySchema }
);
