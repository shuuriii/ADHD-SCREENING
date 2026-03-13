"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || String(error) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
          <div className="text-4xl mb-4">:(</div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-muted mb-4 max-w-md">
            An unexpected error occurred. Your assessment data is safe — try
            refreshing the page.
          </p>
          {process.env.NODE_ENV === "development" && this.state.errorMessage && (
            <pre className="text-xs text-red-500 bg-red-50 rounded-lg p-3 mb-6 max-w-md overflow-auto text-left whitespace-pre-wrap">
              {this.state.errorMessage}
            </pre>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="bg-primary-600 text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
