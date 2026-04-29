"use client";

import type { AuthUser, ClassAccount } from "./types";
import { ADMIN_CREDENTIALS } from "./mock-data";

const ADMIN_PWD_KEY = "inv_admin_password";

export function getAdminPassword(): string {
  if (typeof window === "undefined") return ADMIN_CREDENTIALS.password;
  try { return localStorage.getItem(ADMIN_PWD_KEY) || ADMIN_CREDENTIALS.password; } catch { return ADMIN_CREDENTIALS.password; }
}

export function setAdminPassword(pwd: string) {
  localStorage.setItem(ADMIN_PWD_KEY, pwd);
}

export function login(selected: string, password: string, classes: ClassAccount[]): AuthUser | null {
  if (selected === "admin") {
    return password === getAdminPassword() ? { id: 0, name: "Admin", role: "admin" } : null;
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
