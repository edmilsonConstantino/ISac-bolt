import { useEffect, useRef, useCallback } from "react";

interface UseAutoRefreshOptions {
  /** Poll interval in milliseconds. Default: 60000 (1 min). Set 0 to disable polling. */
  interval?: number;
  /** Refetch when the browser tab regains focus. Default: true */
  onFocus?: boolean;
  /** Whether the hook is active. Useful to pause when modal is open or user is idle. */
  enabled?: boolean;
}

/**
 * Automatically re-runs a fetch function:
 * - When the browser tab becomes visible again (visibilitychange)
 * - On a configurable polling interval
 *
 * Usage:
 *   useAutoRefresh(loadAllData);
 *   useAutoRefresh(loadUsers, { interval: 30000 });
 *   useAutoRefresh(fetch, { interval: 0, onFocus: true }); // focus-only
 */
export function useAutoRefresh(
  fetchFn: () => void | Promise<void>,
  options: UseAutoRefreshOptions = {}
) {
  const { interval = 60_000, onFocus = true, enabled = true } = options;

  // Keep a stable ref so we never need fetchFn in dependency arrays
  const fetchRef = useRef(fetchFn);
  useEffect(() => { fetchRef.current = fetchFn; });

  // Track whether the component is mounted
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const safeRefetch = useCallback(() => {
    if (!mountedRef.current || !enabled) return;
    fetchRef.current();
  }, [enabled]);

  // ── Window / tab visibility ──────────────────────────────────────────
  useEffect(() => {
    if (!onFocus || !enabled) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        safeRefetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [onFocus, enabled, safeRefetch]);

  // ── Polling ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!interval || !enabled) return;

    const id = setInterval(safeRefetch, interval);
    return () => clearInterval(id);
  }, [interval, enabled, safeRefetch]);
}
