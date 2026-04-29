import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { ADMIN_CREDENTIALS } from "@/lib/mock-data";
import type { AuthUser } from "@/lib/types";

// Simple in-memory rate limiter (resets on cold start — acceptable for school tool)
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (rec.count >= 50) return true;
  rec.count++;
  return false;
}

function makeSessionCookie(user: AuthUser): string {
  // base64url: no +, /, or = — safe for cookie values
  return Buffer.from(JSON.stringify(user))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi 1 menit." }, { status: 429 });
  }

  const { selected, password } = await req.json();
  let user: AuthUser | null = null;

  if (selected === "admin") {
    const { data } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "admin_password_hash")
      .single();

    const valid = data?.value
      ? await bcrypt.compare(password, data.value)
      : password === ADMIN_CREDENTIALS.password;

    if (!valid) return NextResponse.json({ error: "Credentials salah" }, { status: 401 });
    user = { id: 0, name: "Admin", role: "admin" };
  } else {
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
    user = { id: cls.id, name: cls.name, role: "kelas" };
  }

  const res = NextResponse.json(user);
  res.cookies.set("inv_session", makeSessionCookie(user), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
