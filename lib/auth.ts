"use client";

import type { AuthUser } from "./types";

export async function loginAsync(selected: string, password: string): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected, password }),
    });
    if (!res.ok) {
      if (res.status === 429) throw new Error("rate_limited");
      return null;
    }
    return res.json();
  } catch (e) {
    if ((e as Error).message === "rate_limited") throw e;
    return null;
  }
}

export function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("inv_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveSession(user: AuthUser) {
  sessionStorage.setItem("inv_user", JSON.stringify(user));
}

export function clearSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("inv_user");
    // Clear server-side cookie (fire and forget)
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }
}
