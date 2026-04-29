import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import {
  MOCK_LABS, MOCK_ITEMS, MOCK_CLASSES, MOCK_SESSIONS,
  MOCK_ALERTS, MOCK_LOST_REPORTS, ADMIN_CREDENTIALS,
} from "@/lib/mock-data";

export async function POST() {
  // Delete all rows from all tables (order matters due to potential FK deps)
  await supabase.from("lost_item_reports").delete().neq("id", 0);
  await supabase.from("session_item_statuses").delete().neq("id", 0);
  await supabase.from("alerts").delete().neq("id", 0);
  await supabase.from("sessions").delete().neq("id", 0);
  await supabase.from("lab_items").delete().neq("id", 0);
  await supabase.from("labs").delete().neq("id", 0);
  await supabase.from("classes").delete().neq("id", 0);
  await supabase.from("admin_settings").delete().neq("key", "");

  const adminHash = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

  const ops = [
    supabase.from("labs").insert(MOCK_LABS),
    supabase.from("lab_items").insert(MOCK_ITEMS),
    supabase.from("classes").insert(MOCK_CLASSES),
    supabase.from("sessions").insert(MOCK_SESSIONS),
    supabase.from("alerts").insert(MOCK_ALERTS),
    supabase.from("admin_settings").insert({ key: "admin_password_hash", value: adminHash }),
  ];

  const results = await Promise.all(ops);
  const errors = results.map((r) => r.error).filter(Boolean);

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors: errors.map((e) => e!.message) }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
