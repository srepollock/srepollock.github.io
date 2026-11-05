"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { districtForPath, districts, navOrder } from "@/lib/districts";
import { setCityStatus } from "@/lib/cityStatus";
import { updateSettings, useSettings } from "@/lib/settings";
import { toggleTerminal, useTerminalOpen } from "@/lib/terminalStore";

function Toggle({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full border border-line text-muted transition hover:border-accent hover:text-accent aria-pressed:text-ink"
    >
      {children}
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const active = districtForPath(pathname);
  const settings = useSettings();
  const terminalOpen = useTerminalOpen();

  return (
    <header className="relative z-20">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3 font-mono text-sm text-ink">
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-md border border-accent text-accent transition group-hover:bg-accent group-hover:text-accent-ink">
            sp
          </span>
          <span className="hidden sm:inline">spencer@pollock<span className="text-accent">:~$</span></span>
        </Link>

        <nav aria-label="Primary" className="order-3 w-full sm:order-none sm:w-auto">
          <ul className="flex gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1 font-mono text-sm backdrop-blur">
            {navOrder.map((id) => {
              const district = districts[id];
              const isActive = id === active;
              return (
                <li key={id}>
                  <Link
                    href={district.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-full px-3 py-1.5 transition ${
                      isActive ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {district.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTerminal}
            aria-pressed={terminalOpen}
            aria-keyshortcuts="Control+K Meta+K"
            title="Open the shell (⌘K / Ctrl+K)"
            aria-label="Open the shell (⌘K / Ctrl+K)"
            className="hidden h-9 items-center gap-2 rounded-full border border-line px-3 font-mono text-xs text-muted transition hover:border-accent hover:text-accent aria-pressed:border-accent aria-pressed:text-accent sm:flex"
          >
            <span aria-hidden="true">&gt;_</span>
            <span>shell</span>
            <kbd className="rounded border border-line px-1 text-[10px] text-subtle">⌘K</kbd>
          </button>
          <span className="sm:hidden">
            <Toggle label="Open the shell" pressed={terminalOpen} onClick={toggleTerminal}>
              <span aria-hidden="true" className="font-mono text-xs">&gt;_</span>
            </Toggle>
          </span>
          <Toggle
            label={settings.theme === "dark" ? "Switch to day" : "Switch to dusk"}
            pressed={settings.theme === "light"}
            onClick={() => updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" })}
          >
            {settings.theme === "dark" ? (
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            )}
          </Toggle>
          <Toggle label={settings.rain ? "Stop the rain" : "Make it rain (it's Vancouver)"} pressed={settings.rain} onClick={() => updateSettings({ rain: !settings.rain })}>
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M7 15a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.4 1.6A3.5 3.5 0 0 1 17.5 15" />
              {settings.rain && <path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" />}
            </svg>
          </Toggle>
          <Toggle label={settings.city ? "Turn the city off" : "Turn the city on"} pressed={settings.city} onClick={() => {
              if (!settings.city) setCityStatus({ state: "pending" });
              updateSettings({ city: !settings.city });
            }}>
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M3 21h18M5 21V10h4v11M10 21V4h5v17M16 21v-8h3v8" />
              {!settings.city && <path d="M3 3l18 18" />}
            </svg>
          </Toggle>
        </div>
      </div>
    </header>
  );
}
