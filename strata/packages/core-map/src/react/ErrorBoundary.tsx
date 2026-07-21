/**
 * ErrorBoundary — a React error boundary so one broken widget/panel doesn't take down the whole app (MIT).
 *
 * Wrap any subtree (a map, a panel, a chart) in `<ErrorBoundary>`. If a descendant throws during render,
 * the boundary catches it and shows a fallback instead of unmounting the entire React tree. Pass a custom
 * `fallback` (a node, or a function of the error) and/or an `onError` reporter; the default is a small,
 * self-contained "Something went wrong" card.
 */
import React from "react";

export interface ErrorBoundaryProps {
  /** What to render when a descendant throws. A node, or a function of the caught error. */
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  /** Called when an error is caught (e.g. to log/report it). `info` is React's error info object. */
  onError?: (error: Error, info: unknown) => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** A class component (error boundaries must be classes) that renders `fallback` on a caught render error. */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: unknown): void {
    this.props.onError?.(error, info);
  }

  override render(): React.ReactNode {
    const { error } = this.state;
    if (error) {
      const { fallback } = this.props;
      if (typeof fallback === "function") return fallback(error);
      if (fallback !== undefined) return fallback;
      return <DefaultFallback error={error} />;
    }
    return this.props.children;
  }
}

/** The built-in fallback card, shown when no `fallback` prop is provided. */
function DefaultFallback(props: { error: Error }): React.ReactElement {
  return (
    <div role="alert" style={cardStyle}>
      <strong style={{ display: "block", marginBottom: 4 }}>Something went wrong</strong>
      <span style={{ opacity: 0.8, fontSize: 13 }}>{props.error.message}</span>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  padding: "12px 14px",
  margin: 8,
  border: "1px solid rgba(220, 38, 38, 0.4)",
  borderRadius: 8,
  background: "rgba(220, 38, 38, 0.08)",
  color: "inherit",
  font: "14px system-ui, sans-serif",
};

export default ErrorBoundary;
