"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Mail, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Gender, PetPreference } from "@/questionnaire/types";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { initBundle } from "@/lib/report-bundle";
import { saveSessionViaAPI } from "@/lib/api-client";
import type { User } from "@supabase/supabase-js";

type OtpStep = "idle" | "sending" | "sent" | "verifying" | "verified";

export default function IntakePage() {
  const router = useRouter();
  const { dispatch } = useAssessment();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [petPreference, setPetPreference] = useState<PetPreference | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // OTP state
  const [otpStep, setOtpStep] = useState<OtpStep>("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Stash validated form data so we can proceed after OTP
  const pendingSubmitRef = useRef<{
    resolvedName: string;
    sanitizedEmail: string;
    sessionId: string;
  } | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const u = data.user ?? null;
        setUser(u);
        if (u?.email) setEmail(u.email);
        if (u?.user_metadata?.full_name) setName(u.user_metadata.full_name);
      })
      .catch(() => {
        // Auth not available — continue as anonymous
      });
  }, []);

  // Focus OTP input when it appears
  useEffect(() => {
    if (otpStep === "sent") {
      otpInputRef.current?.focus();
    }
  }, [otpStep]);

  const validateForm = (): string[] => {
    const newErrors: string[] = [];
    if (!consent) newErrors.push("Please agree to the Privacy Policy and Terms of Service");
    if (!gender) newErrors.push("Please select your gender");
    if (!age || parseInt(age) < 18 || parseInt(age) > 120)
      newErrors.push("Age must be between 18 and 120");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.push("Please enter a valid email address");
    return newErrors;
  };

  const proceedToAssessment = () => {
    const pending = pendingSubmitRef.current;
    if (!pending) return;
    const { resolvedName, sanitizedEmail, sessionId } = pending;

    dispatch({
      type: "SET_USER_DATA",
      payload: {
        name: resolvedName,
        gender: gender as Gender,
        age: parseInt(age),
        petPreference,
        email: sanitizedEmail || undefined,
      },
    });

    initBundle(
      { name: resolvedName, gender: gender as Gender, age: parseInt(age), petPreference, email: email.trim() || undefined },
      sessionId
    );

    saveSessionViaAPI({
      sessionId,
      age: parseInt(age),
      gender: gender as Gender,
      petPreference,
      instrument: "dsm5",
      name: resolvedName,
    });

    dispatch({ type: "SET_INSTRUMENT", payload: "dsm5" });
    router.push("/assessment/questionnaire");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors([]);

    const resolvedName = name.trim().replace(/[<>&"']/g, "") || "Anonymous";
    const sanitizedEmail = email.trim().replace(/[<>&"']/g, "");

    let sessionId = localStorage.getItem("fayth-session-id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("fayth-session-id", sessionId);
    }

    pendingSubmitRef.current = { resolvedName, sanitizedEmail, sessionId };

    // If user is signed in via Google or no email entered, skip OTP
    if (user || !sanitizedEmail) {
      proceedToAssessment();
      return;
    }

    // Send OTP to the entered email
    setOtpStep("sending");
    setOtpError("");
    try {
      const res = await fetch("/api/otp/send-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail }),
      });
      let data: { error?: string; sent?: boolean } = {};
      try {
        data = await res.json();
      } catch {
        // non-JSON response
      }
      if (!res.ok) {
        const msg = data.error || `Failed to send verification code (${res.status})`;
        console.error("[OTP] send-intake failed:", res.status, data);
        setOtpError(msg);
        setOtpStep("idle");
        return;
      }
      setOtpStep("sent");
    } catch (err) {
      console.error("[OTP] Network error:", err);
      setOtpError("Network error. Please try again.");
      setOtpStep("idle");
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;

    setOtpStep("verifying");
    setOtpError("");
    try {
      const res = await fetch("/api/otp/verify-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Verification failed");
        setOtpStep("sent");
        return;
      }
      setOtpStep("verified");
      // Brief success state, then proceed
      setTimeout(proceedToAssessment, 600);
    } catch {
      setOtpError("Network error. Please try again.");
      setOtpStep("sent");
    }
  };

  const handleResendOtp = async () => {
    const sanitizedEmail = email.trim().replace(/[<>&"']/g, "");
    setOtpStep("sending");
    setOtpError("");
    setOtpCode("");
    try {
      const res = await fetch("/api/otp/send-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Failed to resend code");
        setOtpStep("sent");
        return;
      }
      setOtpStep("sent");
    } catch {
      setOtpError("Network error. Please try again.");
      setOtpStep("sent");
    }
  };

  const handleSkipOtp = () => {
    proceedToAssessment();
  };

  const showOtpSection = otpStep !== "idle";

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {user ? `Welcome, ${user.user_metadata?.full_name?.split(" ")[0] ?? "there"}!` : "Before we begin"}
        </h1>
        <p className="text-muted mb-8">
          {user
            ? "Just a few more details to personalize your screening."
            : "A few quick details to personalize your screening experience."}
        </p>
      </motion.div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {(errors.length > 0 || (otpError && otpStep === "idle")) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              {errors.map((err) => (
                <p key={err} className="text-sm text-red-600">
                  {err}
                </p>
              ))}
              {otpError && otpStep === "idle" && (
                <p className="text-sm text-red-600">{otpError}</p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              How do we call you?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name or nickname"
              disabled={showOtpSection}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-0.5">
              Gender <span className="text-severity-high">*</span>
            </label>
            <p className="text-xs text-muted mb-3">
              ADHD presents differently across genders — helps us tailor your results.
            </p>
            <div className="grid grid-cols-4 gap-3" role="radiogroup" aria-label="Gender selection">
              {(
                [
                  { id: "female",            emoji: "🌸", label: "Female"     },
                  { id: "male",              emoji: "🌊", label: "Male"       },
                  { id: "non-binary",        emoji: "🌈", label: "Non-binary" },
                  { id: "prefer-not-to-say", emoji: "🤍", label: "Private"   },
                ] as { id: Gender; emoji: string; label: string }[]
              ).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="radio"
                  aria-checked={gender === g.id}
                  disabled={showOtpSection}
                  onClick={() => setGender(g.id)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all disabled:opacity-50 ${
                    gender === g.id
                      ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                      : "border-border bg-white hover:border-primary-300"
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-primary-50 border border-border/60 flex items-center justify-center text-3xl shadow-sm">
                    {g.emoji}
                  </div>
                  <span className="text-xs font-medium text-muted text-center leading-tight">
                    {g.label}
                  </span>
                  {gender === g.id && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center text-white text-[9px]">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-0.5">
              Choose your companion
            </label>
            <p className="text-xs text-muted mb-3">
              A friendly avatar to keep you company through the assessment.
            </p>
            <div className="grid grid-cols-4 gap-3" role="radiogroup" aria-label="Companion selection">
              {(
                [
                  { id: "fox",   emoji: "🦊", label: "Fox"   },
                  { id: "panda", emoji: "🐼", label: "Panda" },
                  { id: "frog",  emoji: "🐸", label: "Frog"  },
                  { id: "bunny", emoji: "🐰", label: "Bunny" },
                ] as { id: PetPreference; emoji: string; label: string }[]
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={petPreference === p.id}
                  disabled={showOtpSection}
                  onClick={() => setPetPreference(p.id)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all disabled:opacity-50 ${
                    petPreference === p.id
                      ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                      : "border-border bg-white hover:border-primary-300"
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-primary-50 border border-border/60 flex items-center justify-center text-3xl shadow-sm">
                    {p.emoji}
                  </div>
                  <span className="text-xs font-medium text-muted text-center leading-tight">
                    {p.label}
                  </span>
                  {petPreference === p.id && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center text-white text-[9px]">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Age <span className="text-severity-high">*</span>
            </label>
            <input
              id="age"
              type="number"
              min={18}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="18+"
              disabled={showOtpSection}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow disabled:opacity-50"
            />
          </div>

          {!user && (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  disabled={showOtpSection}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow disabled:opacity-50"
                />
              </div>
              {!showOtpSection && (
                <p className="text-xs text-muted mt-1.5">
                  We&apos;ll send a quick verification code to confirm your email.
                </p>
              )}
            </div>
          )}

          {/* Inline OTP verification section */}
          <AnimatePresence>
            {showOtpSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
                  {otpStep === "sending" && (
                    <div className="flex items-center gap-3 text-sm text-primary-700">
                      <Loader2 size={18} className="animate-spin" />
                      Sending verification code to {email}...
                    </div>
                  )}

                  {(otpStep === "sent" || otpStep === "verifying") && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                        <Mail size={16} />
                        Code sent to {email}
                      </div>
                      <p className="text-xs text-primary-600">
                        Enter the 6-digit code from your email to verify.
                      </p>
                      <div className="flex gap-2">
                        <input
                          ref={otpInputRef}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && otpCode.length === 6) {
                              e.preventDefault();
                              handleVerifyOtp();
                            }
                          }}
                          placeholder="000000"
                          disabled={otpStep === "verifying"}
                          className="w-36 px-4 py-2.5 rounded-lg border border-primary-300 bg-white text-foreground text-center text-lg tracking-[6px] font-mono placeholder:tracking-[6px] focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                          aria-label="Verification code"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpCode.length !== 6 || otpStep === "verifying"}
                          size="sm"
                        >
                          {otpStep === "verifying" ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                      {otpError && (
                        <p className="text-xs text-red-600">{otpError}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-primary-600 underline hover:text-primary-700"
                        >
                          Resend code
                        </button>
                        <span className="text-muted">or</span>
                        <button
                          type="button"
                          onClick={handleSkipOtp}
                          className="text-muted underline hover:text-foreground"
                        >
                          Skip verification
                        </button>
                      </div>
                    </div>
                  )}

                  {otpStep === "verified" && (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                      <ShieldCheck size={18} />
                      Email verified! Continuing...
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
            This is a screening tool, not a diagnosis. Only a qualified healthcare professional can
            diagnose ADHD. Please share your results with your doctor for proper evaluation.
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={showOtpSection}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
            />
            <span className="text-xs text-muted leading-relaxed">
              I understand this is a screening tool and not a diagnosis. I agree to the{" "}
              <Link href="/privacy" target="_blank" className="text-primary-600 underline">Privacy Policy</Link> and{" "}
              <Link href="/terms" target="_blank" className="text-primary-600 underline">Terms of Service</Link>.
            </span>
          </label>

          {!showOtpSection && (
            <Button type="submit" className="w-full" size="lg">
              Continue to Assessment
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}
