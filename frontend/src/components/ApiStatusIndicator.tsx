"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "online" | "offline";

const POLL_INTERVAL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 4_000;

export function ApiStatusIndicator({ healthUrl }: { healthUrl: string }) {
  const [status, setStatus] = useState<Status>("checking");
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setStatus((prev) => (prev === "checking" ? prev : prev));
      try {
        const controller = new AbortController();
        const timer = setTimeout(
          () => controller.abort(),
          REQUEST_TIMEOUT_MS
        );
        const res = await fetch(healthUrl, {
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (cancelled) return;
        setStatus(res.ok ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      } finally {
        if (!cancelled) setCheckedAt(new Date());
      }
    }

    check();
    const id = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [healthUrl]);

  const label =
    status === "online"
      ? "API online"
      : status === "offline"
        ? "API unreachable"
        : "Checking API…";

  const dotClass =
    status === "online"
      ? "bg-emerald-500"
      : status === "offline"
        ? "bg-red-500"
        : "bg-slate-400";

  const pulseClass =
    status === "online" ? "bg-emerald-400 animate-ping" : "hidden";

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-ink-muted dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      role="status"
      aria-live="polite"
      title={
        checkedAt
          ? `Last checked ${checkedAt.toLocaleTimeString()}`
          : "Checking…"
      }
    >
      <span className="relative inline-flex h-2 w-2 items-center justify-center">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dotClass}`} />
      </span>
      <span>{label}</span>
    </div>
  );
}
