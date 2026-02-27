"use client";

import { Component, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import { Download, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class SafePDFDownloadWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("PDF component failed to load:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="shrink-0" />
          <span>PDF generation is temporarily unavailable. Your data is safe.</span>
        </div>
      );
    }

    return this.props.children;
  }
}
