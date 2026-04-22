import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ZodError, type ZodSchema } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Ctx<P> = {
  user: User;
  supabase: SupabaseClient<Database>;
  params: P;
};

export type Handler<P, B> = (
  req: Request,
  ctx: Ctx<P> & { body: B }
) => Promise<Response> | Response;

type RouteOptions<P, B> = {
  paramsSchema?: ZodSchema<P>;
  bodySchema?: ZodSchema<B>;
};

export function apiError(message: string, status: number, extra?: object) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * Wraps an authenticated API handler with zod validation and structured error
 * responses. Throws => 500; ZodError => 400; unauthorized => 401.
 */
export function withAuth<P = Record<string, never>, B = unknown>(
  handler: Handler<P, B>,
  opts: RouteOptions<P, B> = {}
) {
  return async (
    req: Request,
    routeCtx: { params: Promise<P> } = { params: Promise.resolve({} as P) }
  ): Promise<Response> => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return apiError("Unauthorized", 401);

      const rawParams = (await routeCtx.params) ?? ({} as P);
      const params = opts.paramsSchema
        ? opts.paramsSchema.parse(rawParams)
        : (rawParams as P);

      let body = undefined as unknown as B;
      if (opts.bodySchema) {
        const json = await req.json().catch(() => null);
        body = opts.bodySchema.parse(json);
      }

      return await handler(req, { user, supabase, params, body });
    } catch (err) {
      if (err instanceof ZodError) {
        return apiError("Invalid request", 400, {
          issues: err.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        });
      }
      console.error("[api] unhandled error", err);
      const message =
        process.env.NODE_ENV === "development" && err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      return apiError(message, 500);
    }
  };
}
