"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import type { Lab, LabItem, ClassAccount, Session, Alert, SessionItemStatus, LostItemReport, LabSchedule } from "./types";
import { MOCK_LABS, MOCK_ITEMS, MOCK_CLASSES, MOCK_SESSIONS, MOCK_ALERTS, MOCK_LOST_REPORTS, MOCK_SCHEDULES } from "./mock-data";
import { supabase } from "./supabase";

const SYNC_EVENT = "inv-storage-sync";

async function syncToSupabase<T extends { id: number }>(
  tableName: string,
  oldArr: T[],
  newArr: T[]
) {
  const oldMap = new Map(oldArr.map((item) => [item.id, item]));
  const newMap = new Map(newArr.map((item) => [item.id, item]));

  for (const [id] of oldMap) {
    if (!newMap.has(id)) {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) throw new Error(error.message);
    }
  }

  for (const [id, item] of newMap) {
    if (!oldMap.has(id)) {
      const { error } = await supabase.from(tableName).insert(item);
      if (error) throw new Error(error.message);
    } else if (JSON.stringify(oldMap.get(id)) !== JSON.stringify(item)) {
      const { error } = await supabase.from(tableName).update(item).eq("id", id);
      if (error) throw new Error(error.message);
    }
  }
}

function useSupabaseTable<T extends { id: number }>(tableName: string, initial: T[]) {
  const [value, setValue] = useState<T[]>(initial);
  const valueRef = useRef<T[]>(value);
  valueRef.current = value;

  useEffect(() => {
    // Initial fetch from Supabase
    supabase
      .from(tableName)
      .select("*")
      .then(({ data, error }) => {
        if (error) {
          toast.error("Gagal memuat data", { description: "Periksa koneksi internet Anda." });
          return;
        }
        if (data !== null) {
          setValue(data as T[]);
          valueRef.current = data as T[];
        }
      });

    // Realtime subscription — re-fetch on any external change
    const channel = supabase
      .channel(`${tableName}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: tableName }, () => {
        supabase.from(tableName).select("*").then(({ data }) => {
          if (data) {
            setValue(data as T[]);
            valueRef.current = data as T[];
          }
        });
      })
      .subscribe();

    // Same-browser cross-component sync via CustomEvent (no extra round-trip)
    function handleSync(e: Event) {
      const detail = (e as CustomEvent<{ key: string; data: T[] }>).detail;
      if (detail?.key !== tableName || !detail.data) return;
      setValue(detail.data);
      valueRef.current = detail.data;
    }
    window.addEventListener(SYNC_EVENT, handleSync);

    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
      supabase.removeChannel(channel);
    };
  }, [tableName]);

  const set = useCallback(
    (next: T[] | ((prev: T[]) => T[])) => {
      const oldArr = valueRef.current;
      const newArr = typeof next === "function" ? (next as (p: T[]) => T[])(oldArr) : next;

      // Optimistic update
      valueRef.current = newArr;
      setValue(newArr);

      syncToSupabase(tableName, oldArr, newArr)
        .then(() => {
          // Notify other components in same browser tab
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent(SYNC_EVENT, { detail: { key: tableName, data: newArr } })
            );
          }, 0);
        })
        .catch(() => {
          // Rollback optimistic update on failure
          valueRef.current = oldArr;
          setValue(oldArr);
          toast.error("Gagal menyimpan perubahan", {
            description: "Periksa koneksi internet Anda dan coba lagi.",
          });
        });
    },
    [tableName]
  );

  return [value, set] as const;
}

export function useLabs() { return useSupabaseTable<Lab>("labs", MOCK_LABS); }
export function useItems() { return useSupabaseTable<LabItem>("lab_items", MOCK_ITEMS); }
export function useClasses() { return useSupabaseTable<ClassAccount>("classes", MOCK_CLASSES); }
export function useSessions() { return useSupabaseTable<Session>("sessions", MOCK_SESSIONS); }
export function useAlerts() { return useSupabaseTable<Alert>("alerts", MOCK_ALERTS); }
export function useSessionItemStatuses() { return useSupabaseTable<SessionItemStatus>("session_item_statuses", []); }
export function useLostReports() { return useSupabaseTable<LostItemReport>("lost_item_reports", MOCK_LOST_REPORTS); }
export function useSchedules() { return useSupabaseTable<LabSchedule>("lab_schedules", MOCK_SCHEDULES); }
