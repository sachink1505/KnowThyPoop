"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  fallback?: (err: Error, reset: () => void) => React.ReactNode;
};

type State = { error: Error | null };

/**
 * Client-side React error boundary. Next's `error.tsx` handles route errors,
 * but this is useful for isolating a single widget (e.g. a chart) so a failure
 * there doesn't crash the whole page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[error-boundary]", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 mx-auto flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-sm font-semibold text-stone-800">
            This section hit an error
          </p>
          <p className="text-xs text-stone-500 mt-1">
            The rest of the page still works.
          </p>
          <Button
            onClick={this.reset}
            className="mt-4 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
