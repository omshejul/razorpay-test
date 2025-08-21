import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  type BasicUser = { email?: string | null };
  type BasicSession = { user?: BasicUser | null };
  const session = (await getServerSession(authOptions)) as BasicSession | null;
  const email = session?.user?.email ?? null;

  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan_id, plan_name, status, created_at")
    .eq("email", email)
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ subscriptions: data ?? [] });
}
