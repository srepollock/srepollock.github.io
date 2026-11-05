"use client";

import { Component, type ReactNode } from "react";
import { setCityStatus } from "@/lib/cityStatus";

type Props = { children: ReactNode };
type State = { failed: boolean };

// Error boundaries still require a class component in React 19.
export class CityErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    setCityStatus({ state: "failed", reason: error instanceof Error ? error.message : String(error) });
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
