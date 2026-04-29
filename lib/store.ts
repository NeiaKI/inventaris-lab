"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Lab, LabItem, ClassAccount, Session, Alert, SessionItemStatus, LostItemReport } from "./types";
import { MOCK_LABS, MOCK_ITEMS, MOCK_CLASSES, MOCK_SESSIONS, MOCK_ALERTS, MOCK_LOST_REPORTS } from "./mock-data";
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
      if (error) console.error(`[supabase] delete ${tableName}/${id}:`, error.message);
    }
  }

  for (const [id, item] of newMap) {
    if (!oldMap.has(id)) {
      const { error } = await supabase.from(tableName).insert(item);
      if (error) console.error(`[supabase] insert ${tableName}/${id}:`, error.message);
    } else if (JSON.stringify(oldMap.get(id)) !== JSON.stringify(item)) {
      const { error } = await supabase.from(tableName).update(item).eq("id", id);
      if (error) console.error(`[supabase] update ${tableName}/${id}:`, error.message);
    }
  }
}

function useSupabaseTable<T extends { id: number }>(tableName: string, initial: T[]) {
  const [value, setValue] = useState<T[]>(initial);
  const valueRef = useRef<T[]>(value);
  valueRef.current = value;

  useEffect(() => {
    supabase
      .from(tableName)
      .select("*")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setValue(data as T[]);
          valueRef.current = data as T[];
        }
      });

    function handleSync(e: Event) {
      const detail = (e as CustomEvent<{ key: string; data: T[] }>).detail;
      if (detail?.key !== tableName || !detail.data) return;
      setValue(detail.data);
      valueRef.current = detail.data;
    }
    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, [tableName]);

  const set = useCallback(
    (next: T[] | ((prev: T[]) => T[])) => {
      const oldArr = valueRef.current;
      const newArr = typeof next === "function" ? (next as (p: T[]) => T[])(oldArr) : next;

      valueRef.current = newArr;
      setValue(newArr);

      syncToSupabase(tableName, oldArr, newArr).then(() => {
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent(SYNC_EVENT, { detail: { key: tableName, data: newArr } })
          );
        }, 0);
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
