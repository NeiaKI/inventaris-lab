import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { ADMIN_CREDENTIALS } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const { selected, password } = await req.json();

  if (selected === "admin") {
    const { data } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "admin_password_hash")
      .single();

    let valid = false;
    if (data?.value) {
      valid = await bcrypt.compare(password, data.value);
    } else {
      valid = password === ADMIN_CREDENTIALS.password;
    }

    if (!valid) return NextResponse.json({ error: "Credentials salah" }, { status: 401 });
    return NextResponse.json({ id: 0, name: "Admin", role: "admin" });
  }

  const { data: cls } = await supabase
    .from("classes")
    .select("id, name, password")
    .eq("username", selected)
    .single();

  if (!cls) return NextResponse.json({ error: "Credentials salah" }, { status: 401 });

  const valid = cls.password.startsWith("$2")
    ? await bcrypt.compare(password, cls.password)
    : password === cls.password;

  if (!valid) return NextResponse.json({ error: "Credentials salah" }, { status: 401 });
  return NextResponse.json({ id: cls.id, name: cls.name, role: "kelas" });
}
