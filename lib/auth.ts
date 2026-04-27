"use client";

import type { AuthUser, ClassAccount } from "./types";
import { ADMIN_CREDENTIALS } from "./mock-data";

export function login(selected: string, password: string, classes: ClassAccount[]): AuthUser | null {
  if (selected === "admin") {
    return password === ADMIN_CREDENTIALS.password ? { id: 0, name: "Admin", role: "admin" } : null;
  }
  const kelas = classes.find((c) => c.username === selected);
  if (kelas && kelas.password === password) {
    return { id: kelas.id, name: kelas.name, role: "kelas" };
  }
  return null;
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
