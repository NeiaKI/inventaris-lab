"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Lab, LabItem, ClassAccount, Session, Alert, SessionItemStatus, LostItemReport } from "./types";
import { MOCK_LABS, MOCK_ITEMS, MOCK_CLASSES, MOCK_SESSIONS, MOCK_ALERTS, MOCK_LOST_REPORTS } from "./mock-data";

const SYNC_EVENT = "inv-storage-sync";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored) as T;
    } catch {}
    return initial;
  });

  // Track current value in a ref so `set` can read it outside React's updater
  const valueRef = useRef<T>(value);
  valueRef.current = value;

  // Listen for changes made by other components with the same key
  useEffect(() => {
    function handleSync(e: Event) {
      if ((e as CustomEvent).detail?.key !== key) return;
      try {
        const stored = localStorage.getItem(key);
        if (stored) setValue(JSON.parse(stored) as T);
      } catch {}
    }
    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, [key]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    const resolved = typeof next === "function" ? (next as (p: T) => T)(valueRef.current) : next;
    valueRef.current = resolved;
    localStorage.setItem(key, JSON.stringify(resolved));
    setValue(resolved);
    // Defer dispatch so it fires after React commits — never inside a render/updater
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key } }));
    }, 0);
  }, [key]);

  return [value, set] as const;
}

export function useLabs() { return useLocalStorage<Lab[]>("inv_labs", MOCK_LABS); }
export function useItems() { return useLocalStorage<LabItem[]>("inv_items", MOCK_ITEMS); }
export function useClasses() { return useLocalStorage<ClassAccount[]>("inv_classes", MOCK_CLASSES); }
export function useSessions() { return useLocalStorage<Session[]>("inv_sessions", MOCK_SESSIONS); }
export function useAlerts() { return useLocalStorage<Alert[]>("inv_alerts", MOCK_ALERTS); }
export function useSessionItemStatuses() { return useLocalStorage<SessionItemStatus[]>("inv_session_statuses", []); }
export function useLostReports() { return useLocalStorage<LostItemReport[]>("inv_lost_reports", MOCK_LOST_REPORTS); }
