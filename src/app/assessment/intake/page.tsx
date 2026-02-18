"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Lock } from "lucide-react";
import Image from "next/image";
import type { Gender, InstrumentType, PetPreference } from "@/questionnaire/types";
import { saveProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/client";

export default function IntakePage() {
  const router = useRouter();
  const { dispatch } = useAssessment();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [age, setAge] = useState("");
  const [instrument, setInstrument] = useState<InstrumentType>("dsm5");
  const [petPreference, setPetPreference] = useState<PetPreference | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!gender) newErrors.push("Please select your gender");
    if (!age || parseInt(age) < 18)
      newErrors.push("Age must be 18 or older");

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

    dispatch({ type: "SET_INSTRUMENT", payload: instrument });
    dispatch({
      type: "SET_USER_DATA",
      payload: {
        name: resolvedName,
        gender: gender as Gender,
        age: parseInt(age),
        petPreference: petPreference,
      },
    });

    // Save to Supabase with optional user_id if signed in (fire-and-forget)
    createClient().auth.getUser().then(({ data }) => {
      saveProfile({
        name: name.trim() || null,
        age: parseInt(age),
        gender: gender as Gender,
        pet_preference: petPreference,
        session_id: sessionId,
        user_id: data.user?.id ?? null,
      });
    });

    router.push("/assessment/questionnaire");
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
              Are you a cat person or a dog person?
            </label>
            <p className="text-xs text-muted mb-3">
              Pick one — this sets your profile picture (dp) throughout the app.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(["cat", "dog"] as PetPreference[]).map((pet) => (
                <button
                  key={pet}
                  type="button"
                  onClick={() => setPetPreference(pet)}
                  className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    petPreference === pet
                      ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                      : "border-border bg-white hover:border-primary-300"
                  }`}
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white shadow-md">
                    <Image
                      src={`/images/${pet}-avatar.png`}
                      alt={pet === "cat" ? "Cat avatar" : "Dog avatar"}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground capitalize">
                    {pet} person
                  </span>
                  {petPreference === pet && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs">
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
              How do we call you?{" "}
              <span className="text-muted font-normal">(optional)</span>
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
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Gender <span className="text-severity-high">*</span>
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            <p className="mt-1.5 text-xs text-muted">
              ADHD presents differently across genders. This helps us provide
              more relevant follow-up questions.
            </p>
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
            <label className="block text-sm font-medium text-foreground mb-3">
              Screening instrument
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInstrument("dsm5")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  instrument === "dsm5"
                    ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                    : "border-border bg-white hover:border-primary-300"
                }`}
              >
                <span className="block font-semibold text-foreground text-sm">
                  DSM-5
                </span>
                <span className="block text-xs text-muted mt-1">
                  30 questions — full clinical domains
                </span>
              </button>
              <button
                type="button"
                onClick={() => setInstrument("asrs")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  instrument === "asrs"
                    ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                    : "border-border bg-white hover:border-primary-300"
                }`}
              >
                <span className="block font-semibold text-foreground text-sm">
                  ASRS v1.1
                </span>
                <span className="block text-xs text-muted mt-1">
                  18 questions — WHO-validated screener
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-primary-50 rounded-xl p-4">
            <Lock size={16} className="text-primary-600 mt-0.5 shrink-0" />
            <p className="text-xs text-primary-800 leading-relaxed">
              Basic profile info (name, age, gender) is saved securely to
              personalize your experience. Assessment responses stay on your
              device only.
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Continue to Assessment
          </Button>
        </form>
      </Card>
    </div>
  );
}
