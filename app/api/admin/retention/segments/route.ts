import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-auth";
import { computeSegments } from "@/lib/retention/segments";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "ali@rumi.team").split(",");

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const segments = await computeSegments();
    return NextResponse.json({ segments });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to compute segments" },
      { status: 500 }
    );
  }
}
