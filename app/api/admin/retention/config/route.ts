import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-auth";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "ali@rumi.team").split(",");

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const authSupa = await createSupabaseServerClient();
  const {
    data: { user },
  } = await authSupa.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  // Get all config versions
  const { data: configs } = await supabase
    .schema("retention")
    .from("policy_config")
    .select("*")
    .order("published_at", { ascending: false });

  return NextResponse.json({ configs: configs || [] });
}

export async function POST(req: NextRequest) {
  const authSupa = await createSupabaseServerClient();
  const {
    data: { user },
  } = await authSupa.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { version, config_json, notes } = body;

  if (!version || !config_json) {
    return NextResponse.json(
      { error: "version and config_json required" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  // Deactivate current active config
  await supabase
    .schema("retention")
    .from("policy_config")
    .update({ is_active: false })
    .eq("is_active", true);

  // Insert new version
  const { data, error } = await supabase
    .schema("retention")
    .from("policy_config")
    .insert({
      version,
      config_json,
      published_by: user.email || "admin",
      is_active: true,
      notes: notes || "",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}
