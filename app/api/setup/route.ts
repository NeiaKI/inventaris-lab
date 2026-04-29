import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import {
  MOCK_LABS, MOCK_ITEMS, MOCK_CLASSES, MOCK_SESSIONS,
  MOCK_ALERTS, MOCK_LOST_REPORTS, ADMIN_CREDENTIALS,
} from "@/lib/mock-data";

export async function GET() {
  const { data: existing } = await supabase.from("labs").select("id").limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true, message: "Database sudah ada datanya. Gunakan /api/reset untuk mereset." });
  }
  return seed();
}

export async function POST() {
  return seed();
}

async function seed() {
  const adminHash = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

  const ops = [
    supabase.from("labs").upsert(MOCK_LABS),
    supabase.from("lab_items").upsert(MOCK_ITEMS),
    supabase.from("classes").upsert(MOCK_CLASSES),
    supabase.from("sessions").upsert(MOCK_SESSIONS),
    supabase.from("alerts").upsert(MOCK_ALERTS),
    supabase.from("lost_item_reports").upsert(MOCK_LOST_REPORTS),
    supabase.from("admin_settings").upsert({ key: "admin_password_hash", value: adminHash }),
  ];

  const results = await Promise.all(ops);
  const errors = results.map((r) => r.error).filter(Boolean);

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors: errors.map((e) => e!.message) }, { status: 500 });
  }
  return NextResponse.json({ ok: true, message: "Database berhasil di-seed." });
}
