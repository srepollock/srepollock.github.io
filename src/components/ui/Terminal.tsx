"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { districtForPath } from "@/lib/districts";
import { setCityStatus } from "@/lib/cityStatus";
import { updateSettings, useSettings } from "@/lib/settings";
import { commonPrefix, complete, runCommand, type Effect, type Line } from "@/lib/terminal";
import { closeTerminal } from "@/lib/terminalStore";

type Entry = { id: number; input?: string; lines: Line[] };

const lineClass: Record<Line["kind"], string> = {
  out: "text-ink",
  ok: "text-accent",
  err: "text-amber",
  muted: "text-subtle",
};

const welcome: Entry = {
  id: 0,
  lines: [
    { kind: "out", text: "spollock.ca — interactive shell" },
    { kind: "muted", text: "Type `help` to see what I can do. Esc to close." },
  ],
};

export default function Terminal() {
  const router = useRouter();
  const pathname = usePathname();
  const settings = useSettings();
  const [entries, setEntries] = useState<Entry[]>([welcome]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const nextId = useRef(1);
  const titleId = useId();

  useEffect(() => {
    restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inputRef.current?.focus();
    const previous = restoreFocus;
    return () => previous.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  const apply = useCallback(
    (effects: Effect[]) => {
      for (const effect of effects) {
        switch (effect.type) {
          case "navigate":
            router.push(effect.href);
            break;
          case "external":
            window.location.assign(effect.href);
            break;
          case "settings":
            if (effect.patch.city === true) setCityStatus({ state: "pending" });
            updateSettings(effect.patch);
            break;
          case "clear":
            setEntries([]);
            break;
          case "close":
            closeTerminal();
            break;
        }
      }
    },
    [router],
  );

  const submit = () => {
    const command = input;
    const { lines, effects } = runCommand(command, { district: districtForPath(pathname), settings });
    setEntries((current) => [...current, { id: nextId.current++, input: command, lines }]);
    if (command.trim()) setHistory((current) => [...current, command]);
    setInput("");
    setCursor(null);
    apply(effects);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        submit();
        break;
      case "Escape":
        event.preventDefault();
        closeTerminal();
        break;
      case "Tab": {
        event.preventDefault();
        const options = complete(input);
        if (options.length === 1) setInput(`${options[0]} `);
        else if (options.length > 1) {
          const prefix = commonPrefix(options);
          if (prefix.length > input.length) setInput(prefix);
          else
            setEntries((current) => [
              ...current,
              { id: nextId.current++, input, lines: [{ kind: "muted", text: options.map((o) => o.split(" ").pop()).join("  ") }] },
            ]);
        }
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (history.length === 0) break;
        const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
        setCursor(next);
        setInput(history[next] ?? "");
        break;
      }
      case "ArrowDown": {
        event.preventDefault();
        if (cursor === null) break;
        const next = cursor + 1;
        if (next >= history.length) {
          setCursor(null);
          setInput("");
        } else {
          setCursor(next);
          setInput(history[next] ?? "");
        }
        break;
      }
      case "l":
        if (event.ctrlKey) {
          event.preventDefault();
          setEntries([]);
        }
        break;
    }
  };

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      data-testid="terminal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-accent/40 bg-surface-strong font-mono text-sm shadow-[0_-20px_60px_rgb(0_0_0/0.45)] backdrop-blur-xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) inputRef.current?.focus();
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 pt-3 text-xs text-subtle sm:px-8">
        <h2 id={titleId}>
          <span className="text-accent">●</span> shell — {districtForPath(pathname)}
        </h2>
        <button type="button" onClick={closeTerminal} className="rounded px-2 py-1 hover:text-ink" aria-label="Close terminal">
          esc ✕
        </button>
      </div>
      <div
        ref={scrollRef}
        className="mx-auto h-[min(40vh,22rem)] max-w-5xl overflow-y-auto px-4 py-3 sm:px-8"
        aria-live="polite"
        onClick={() => inputRef.current?.focus()}
      >
        {entries.map((entry) => (
          <div key={entry.id} className="mb-1">
            {entry.input !== undefined && (
              <p className="text-ink">
                <span className="text-accent">~$</span> {entry.input}
              </p>
            )}
            {entry.lines.map((line, index) => (
              <p key={index} className={`whitespace-pre-wrap break-words ${lineClass[line.kind]}`}>
                {line.text}
              </p>
            ))}
          </div>
        ))}
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label htmlFor={`${titleId}-input`} className="text-accent">
            ~$<span className="sr-only"> command</span>
          </label>
          <input
            id={`${titleId}-input`}
            ref={inputRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setCursor(null);
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            className="min-w-0 flex-1 bg-transparent text-ink caret-accent outline-none focus-visible:outline-none"
          />
        </form>
      </div>
    </div>
  );
}
