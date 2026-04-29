"use client";

import type { AuthUser } from "./types";

export async function loginAsync(selected: string, password: string): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected, password }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
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
  sessionStorage.removeItem("inv_user");
}
