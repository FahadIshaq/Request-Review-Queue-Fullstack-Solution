"use client";

import { useEffect, useState } from "react";
import { useTheme, type Theme } from "./ThemeProvider";

type Option = {
  value: Theme;
  label: string;
  Icon: (props: { className?: string }) => JSX.Element;
};

const OPTIONS: Option[] = [
  { value: "light", label: "Light theme", Icon: SunIcon },
  { value: "system", label: "Match system theme", Icon: MonitorIcon },
  { value: "dark", label: "Dark theme", Icon: MoonIcon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch: render the static markup on first paint
  // and only reflect the active theme after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-900"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={[
              "inline-flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150",
              active
                ? "bg-white text-brand-900 shadow-soft dark:bg-slate-700 dark:text-brand-200"
                : "text-ink-subtle hover:text-ink dark:text-slate-500 dark:hover:text-slate-100",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a.7.7 0 0 0-.93.81A9 9 0 1 0 20.19 13.73a.7.7 0 0 0 .81-.93z" />
    </svg>
  );
}
