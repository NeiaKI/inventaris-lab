"use client";

import { useState } from "react";
import type { Lab, LabItem, ClassAccount, Session, Alert, SessionItemStatus, LostItemReport } from "./types";
import { MOCK_LABS, MOCK_ITEMS, MOCK_CLASSES, MOCK_SESSIONS, MOCK_ALERTS, MOCK_LOST_REPORTS } from "./mock-data";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored) as T;
    } catch {}
    return initial;
  });

  const set = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  };

  return [value, set] as const;
}

export function useLabs() { return useLocalStorage<Lab[]>("inv_labs", MOCK_LABS); }
export function useItems() { return useLocalStorage<LabItem[]>("inv_items", MOCK_ITEMS); }
export function useClasses() { return useLocalStorage<ClassAccount[]>("inv_classes", MOCK_CLASSES); }
export function useSessions() { return useLocalStorage<Session[]>("inv_sessions", MOCK_SESSIONS); }
export function useAlerts() { return useLocalStorage<Alert[]>("inv_alerts", MOCK_ALERTS); }
export function useSessionItemStatuses() { return useLocalStorage<SessionItemStatus[]>("inv_session_statuses", []); }
export function useLostReports() { return useLocalStorage<LostItemReport[]>("inv_lost_reports", MOCK_LOST_REPORTS); }
