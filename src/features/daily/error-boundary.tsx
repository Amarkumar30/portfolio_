"use client";

/**
 * DailyErrorBoundary renders nothing if anything inside the Daily feature fails,
 * so the rest of the page is never affected.
 */
import { Component } from "react";

export class DailyErrorBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[daily] hidden after an error", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
