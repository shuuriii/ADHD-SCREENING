"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || "/assessment/intake";
  // Prevent open redirect: only allow relative paths within the app
  const redirectTo = (!rawNext.startsWith("/") || rawNext.startsWith("//") || rawNext.includes("://"))
    ? "/assessment/intake"
    : rawNext;
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send OTP on mount
  useEffect(() => {
    sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendOtp() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/otp/send", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send code");
      }
    } catch {
      setError("Failed to send verification code");
    } finally {
      setSending(false);
    }
  }

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  }

  async function handleSubmit() {
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.verified) {
        router.push(redirectTo);
      } else {
        setError(data.error || "Verification failed");
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-border p-8">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-foreground">Verify your email</h1>
        <p className="text-sm text-muted mt-1">
          {sending
            ? "Sending a 6-digit code to your email..."
            : "Enter the 6-digit code sent to your email"}
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste} role="group" aria-label="6-digit verification code">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-label={`Digit ${i + 1} of 6`}
            autoComplete="one-time-code"
            className="w-11 h-13 text-center text-xl font-semibold border-2 border-border rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center mb-4">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || digits.join("").length !== 6}
        className="w-full py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      <button
        onClick={() => {
          setDigits(["", "", "", "", "", ""]);
          setError("");
          sendOtp();
          inputRefs.current[0]?.focus();
        }}
        disabled={sending}
        className="w-full mt-3 py-2 text-sm text-primary-600 hover:text-primary-800 transition-colors"
      >
        {sending ? "Sending..." : "Resend code"}
      </button>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4">
      <Suspense>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}
