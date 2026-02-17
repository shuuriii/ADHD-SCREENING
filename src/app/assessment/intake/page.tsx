"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Lock } from "lucide-react";
import type { Gender } from "@/questionnaire/types";

export default function IntakePage() {
  const router = useRouter();
  const { dispatch } = useAssessment();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [age, setAge] = useState("");
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

    dispatch({
      type: "SET_USER_DATA",
      payload: {
        name: name.trim() || "Anonymous",
        gender: gender as Gender,
        age: parseInt(age),
      },
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
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Name{" "}
              <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
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

          <div className="flex items-start gap-3 bg-primary-50 rounded-xl p-4">
            <Lock size={16} className="text-primary-600 mt-0.5 shrink-0" />
            <p className="text-xs text-primary-800 leading-relaxed">
              Your data stays on your device. We don&apos;t collect or send any
              personal information to external servers.
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
