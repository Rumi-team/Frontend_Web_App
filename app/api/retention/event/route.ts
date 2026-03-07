import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-auth";
import { createServerSupabaseClient } from "@/lib/supabase";
import { trackEvent } from "@/lib/retention/client";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { event_type, properties } = body;
  if (!event_type) {
    return NextResponse.json({ error: "Missing event_type" }, { status: 400 });
  }

  // Resolve provider_user_id (retention system key) from Supabase user
  const serviceClient = createServerSupabaseClient();
  const { data: identity } = await serviceClient
    .from("user_identities")
    .select("provider_user_id")
    .eq("user_id", user.id)
    .single();
  const providerUserId = identity?.provider_user_id ?? user.id;

  await trackEvent(providerUserId, event_type, properties);
  return NextResponse.json({ status: "ok" });
}
