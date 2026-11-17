// Recovers in-progress admin forms (new resource, new event, etc.) after the
// page is closed or navigated away from before the user clicks Save. Backed by
// localStorage so it's per-browser and needs no server round trip.
import { useEffect, useRef } from "react";

const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // drafts older than this are treated as stale

export type StoredDraft<T> = { data: T; savedAt: number };

export function readDraft<T>(key: string): StoredDraft<T> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft<T>;
    if (!parsed || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeDraft<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
  } catch {
    // best-effort convenience feature — ignore quota/availability errors
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// Debounced persist-on-change for whatever the admin is currently typing.
export function useAutosaveDraft<T>(key: string, value: T | null, enabled: boolean) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!enabled || value == null) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => writeDraft(key, value), 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [key, value, enabled]);
}
