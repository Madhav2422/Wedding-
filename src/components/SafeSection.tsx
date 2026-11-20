"use client";

import { Component, type ReactNode } from "react";

/**
 * If one page of the invitation fails in some unusual browser, only that page disappears;
 * the gate and every other page keep working (without this, React would blank the whole site).
 */
export default class SafeSection extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
