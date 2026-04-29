import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SESSION_TTL_HOURS = 24;

export async function GET() {
  const { data: activeSessions, error } = await supabase
    .from("sessions")
    .select("id, started_at")
    .eq("status", "aktif");

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!activeSessions?.length) return NextResponse.json({ ok: true, expired: 0 });

  const cutoff = new Date(Date.now() - SESSION_TTL_HOURS * 60 * 60 * 1000);
  const toExpire = activeSessions.filter((s) => new Date(s.started_at) < cutoff);

  if (toExpire.length === 0) return NextResponse.json({ ok: true, expired: 0 });

  const now = new Date().toISOString();
  const ids = toExpire.map((s) => s.id);

  const { error: updateError } = await supabase
    .from("sessions")
    .update({ status: "pending", ended_at: now })
    .in("id", ids);

  if (updateError) return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true, expired: toExpire.length, ids });
}
