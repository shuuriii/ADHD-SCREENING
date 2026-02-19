"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Mail } from "lucide-react";
import type { Gender, PetPreference } from "@/questionnaire/types";
import { saveSession } from "@/lib/supabase/sessions";
import { createClient } from "@/lib/supabase/client";
import { initBundle } from "@/lib/report-bundle";

export default function IntakePage() {
  const router = useRouter();
  const { dispatch } = useAssessment();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [petPreference, setPetPreference] = useState<PetPreference | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!gender) newErrors.push("Please select your gender");
    if (!age || parseInt(age) < 18)
      newErrors.push("Age must be 18 or older");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.push("Please enter a valid email address");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const resolvedName = name.trim() || "Anonymous";

    // Get or create a persistent session ID for this user
    let sessionId = localStorage.getItem("fayth-session-id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("fayth-session-id", sessionId);
    }

    dispatch({
      type: "SET_USER_DATA",
      payload: {
        name: resolvedName,
        gender: gender as Gender,
        age: parseInt(age),
        petPreference: petPreference,
        email: email.trim() || undefined,
      },
    });

    // Initialise the unified report bundle for this session
    initBundle(
      { name: resolvedName, gender: gender as Gender, age: parseInt(age), petPreference, email: email.trim() || undefined },
      sessionId
    );

    // Save session to Supabase (fire-and-forget)
    createClient().auth.getUser().then(({ data }) => {
      saveSession(
        parseInt(age),
        gender as Gender,
        petPreference,
        "dsm5",
        sessionId,
        data.user?.id ?? null
      );
    });

    router.push("/assessment/map");
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Before we begin
        </h1>
        <p className="text-muted mb-8">
          A few quick details to personalize your screening experience.
        </p>
      </motion.div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              {errors.map((err) => (
                <p key={err} className="text-sm text-red-600">
                  {err}
                </p>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-0.5">
              Pick your profile picture
            </label>
            <p className="text-xs text-muted mb-3">
              This shows as your avatar throughout the app.
            </p>
            <div className="grid grid-cols-4 gap-3">
              {(
                [
                  { id: "fox",   emoji: "🦊", label: "Fox"   },
                  { id: "panda", emoji: "🐼", label: "Panda" },
                  { id: "frog",  emoji: "🐸", label: "Frog"  },
                  { id: "bunny", emoji: "🐰", label: "Bunny" },
                ] as { id: PetPreference; emoji: string; label: string }[]
              ).map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setPetPreference(avatar.id)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    petPreference === avatar.id
                      ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                      : "border-border bg-white hover:border-primary-300"
                  }`}
                >
                  {/* Placeholder — swap for <Image> when artwork is ready */}
                  {/* Image path: /images/avatars/{avatar.id}.png */}
                  <div className="w-14 h-14 rounded-full bg-primary-50 border border-border/60 flex items-center justify-center text-3xl shadow-sm">
                    {avatar.emoji}
                  </div>
                  <span className="text-xs font-medium text-muted">
                    {avatar.label}
                  </span>
                  {petPreference === avatar.id && (
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
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-0.5">
              Gender <span className="text-severity-high">*</span>
            </label>
            <p className="text-xs text-muted mb-3">
              ADHD presents differently across genders — helps us tailor your results.
            </p>
            <div className="grid grid-cols-4 gap-3">
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
                  onClick={() => setGender(g.id)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
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
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
            />
          </div>

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
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Continue to Assessment
          </Button>
        </form>
      </Card>
    </div>
  );
}
