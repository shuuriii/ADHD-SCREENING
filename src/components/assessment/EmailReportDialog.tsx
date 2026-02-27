"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { Mail, X, Check } from "lucide-react";

interface EmailReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<boolean>;
  userName?: string;
}

export default function EmailReportDialog({
  isOpen,
  onClose,
  onSubmit,
  userName,
}: EmailReportDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const success = await onSubmit(email);
      if (success) {
        setSubmitted(true);
        setTimeout(() => {
          setEmail("");
          setSubmitted(false);
          onClose();
        }, 2000);
      } else {
        setError("Failed to send email. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Mail size={24} className="text-blue-600" />
                Get Your Report
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {!submitted ? (
              <>
                <p className="text-sm text-muted mb-4">
                  {userName
                    ? `Hi ${userName}! We'll send your comprehensive assessment report to your email.`
                    : "We'll send your comprehensive assessment report to your email."}
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      Skip
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="flex-1"
                    >
                      {isLoading ? "Sending..." : "Send Report"}
                    </Button>
                  </div>
                </form>

                <p className="text-xs text-muted mt-4">
                  ✓ Free of charge
                  <br />✓ Comprehensive clinical insights
                  <br />✓ Ready to share with your healthcare provider
                </p>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                  <Check size={24} className="text-green-600" />
                </div>
                <p className="font-semibold text-foreground mb-2">
                  Report Sent!
                </p>
                <p className="text-sm text-muted">
                  Check your email for your comprehensive assessment report.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
