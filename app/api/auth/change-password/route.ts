import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { ADMIN_CREDENTIALS } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword || newPassword.length < 4) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  const { data } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "admin_password_hash")
    .single();

  let valid = false;
  if (data?.value) {
    valid = await bcrypt.compare(currentPassword, data.value);
  } else {
    valid = currentPassword === ADMIN_CREDENTIALS.password;
  }

  if (!valid) return NextResponse.json({ error: "Password saat ini salah" }, { status: 401 });

  const hash = await bcrypt.hash(newPassword, 10);
  await supabase
    .from("admin_settings")
    .upsert({ key: "admin_password_hash", value: hash });

  return NextResponse.json({ ok: true });
}
