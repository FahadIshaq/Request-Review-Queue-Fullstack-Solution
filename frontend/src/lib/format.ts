const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return DATE_FORMATTER.format(d);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${DATE_FORMATTER.format(d)} · ${TIME_FORMATTER.format(d)}`;
}

export function formatRelativeFromNow(iso: string | null | undefined): string {
  if (!iso) return "—";
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return "—";
  const diff = target - Date.now();
  const absMs = Math.abs(diff);
  const day = 24 * 60 * 60 * 1000;
  const hr = 60 * 60 * 1000;
  const min = 60 * 1000;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (absMs >= day) {
    return rtf.format(Math.round(diff / day), "day");
  }
  if (absMs >= hr) {
    return rtf.format(Math.round(diff / hr), "hour");
  }
  return rtf.format(Math.round(diff / min), "minute");
}
