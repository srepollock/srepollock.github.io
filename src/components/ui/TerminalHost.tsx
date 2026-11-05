"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { toggleTerminal, useTerminalOpen } from "@/lib/terminalStore";

const Terminal = dynamic(() => import("./Terminal"), { ssr: false });

export function TerminalHost() {
  const open = useTerminalOpen();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleTerminal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return open ? <Terminal /> : null;
}
