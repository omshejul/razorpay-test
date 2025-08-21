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

  if ((data?.length ?? 0) > 0) {
    return NextResponse.json({ subscriptions: data! });
  }

  // Fallback: look up active subscriptions by user_id via auth.admin if email match fails
  // Requires service role key (already used for supabase client)
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users?.find((u) => u.email === email);
  if (!user) {
    return NextResponse.json({ subscriptions: [] });
  }

  const { data: byUser, error: byUserErr } = await supabase
    .from("subscriptions")
    .select("plan_id, plan_name, status, created_at")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (byUserErr) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ subscriptions: byUser ?? [] });
}
