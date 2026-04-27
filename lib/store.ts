"use client";

import { useState, useEffect } from "react";
import type { Lab, LabItem, ClassAccount, Session, Alert, SessionItemStatus } from "./types";
import { MOCK_LABS, MOCK_ITEMS, MOCK_CLASSES, MOCK_SESSIONS, MOCK_ALERTS } from "./mock-data";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setValue(JSON.parse(stored));
    } catch {}
  }, [key]);

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
