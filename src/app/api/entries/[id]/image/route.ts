import { z } from "zod";
import { NextResponse } from "next/server";
import { withAuth, apiError } from "@/lib/api";

const paramsSchema = z.object({ id: z.string().uuid() });

export const GET = withAuth<z.infer<typeof paramsSchema>>(
  async (_req, { user, supabase, params }) => {
    const { data: entry } = await supabase
      .from("poop_entries")
      .select("image_path")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (!entry?.image_path) return apiError("No image", 404);

    const { data, error } = await supabase.storage
      .from("poop-images")
      .createSignedUrl(entry.image_path, 60);

    if (error || !data) return apiError("Failed to sign URL", 500);

    return NextResponse.json({ url: data.signedUrl });
  },
  { paramsSchema }
);
