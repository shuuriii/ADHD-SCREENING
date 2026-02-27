"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import Button from "@/components/ui/Button";
import { CheckCircle2, Circle, Zap, Gauge, BarChart3 } from "lucide-react";

export default function AssessmentHubPage() {
  const router = useRouter();
  const { state } = useAssessment();
  const { userData, completedQuestionnaires, completedGames } = state;

  const questionnairesCompleted = Object.values(completedQuestionnaires).filter(Boolean).length;
  const gamesCompleted = Object.values(completedGames).filter(Boolean).length;
  const canGetResults = questionnairesCompleted > 0;

  const handleGetResults = () => {
    router.push("/assessment/results");
  };

  const handleStartDSM5 = () => {
    router.push("/assessment/questionnaire?instrument=dsm5");
  };

  const handleStartASRS = () => {
    router.push("/assessment/questionnaire?instrument=asrs");
  };

  const handleStartFocusTask = () => {
    router.push("/assessment/focus-task");
  };

  const handleStartGoNogo = () => {
    router.push("/assessment/gonogo");
  };

  const handleStartChronosTask = () => {
    router.push("/assessment/chronos-task");
  };

  const handleStartFocusQuest = () => {
    router.push("/assessment/focus-quest");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Your Assessment Journey
        </h1>
        <p className="text-muted">
          {userData.name && userData.name !== "Anonymous"
            ? `Welcome back, ${userData.name}!`
            : "Let's explore your attention and executive function patterns."}
        </p>
        <p className="text-sm text-muted mt-2">
          Complete at least one questionnaire to generate your personalized report
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200/50"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-muted font-medium uppercase mb-1">
              Questionnaires
            </p>
            <p className="text-2xl font-bold text-foreground">
              {questionnairesCompleted}/{2}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase mb-1">
              Optional Games
            </p>
            <p className="text-2xl font-bold text-foreground">
              {gamesCompleted}/{4}
            </p>
          </div>
        </div>
        <div className="w-full bg-blue-200/30 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${(questionnairesCompleted / 2) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted mt-2">
          {canGetResults
            ? "✓ You can generate your report now!"
            : "Complete a questionnaire to generate your report"}
        </p>
      </motion.div>

      {/* Questionnaires Section */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-primary-600" />
          Questionnaires
        </h2>

        <div className="space-y-3 mb-8">
          {/* DSM-5 */}
          <motion.div
            variants={itemVariants}
            className={`rounded-xl p-4 border-2 transition-all ${
              completedQuestionnaires.dsm5
                ? "bg-green-50 border-green-300"
                : "bg-white border-border/50 hover:border-blue-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {completedQuestionnaires.dsm5 ? (
                  <CheckCircle2 size={24} className="text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <Circle size={24} className="text-muted mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    DSM-5 ADHD Assessment
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    Comprehensive diagnostic screener • 33 questions • ~10 minutes
                  </p>
                  {completedQuestionnaires.dsm5 && (
                    <p className="text-xs text-green-600 font-medium mt-2">✓ Completed</p>
                  )}
                </div>
              </div>
              {!completedQuestionnaires.dsm5 && (
                <Button
                  size="sm"
                  onClick={handleStartDSM5}
                  className="shrink-0 ml-4"
                >
                  Start
                </Button>
              )}
            </div>
          </motion.div>

          {/* ASRS */}
          <motion.div
            variants={itemVariants}
            className={`rounded-xl p-4 border-2 transition-all ${
              completedQuestionnaires.asrs
                ? "bg-green-50 border-green-300"
                : "bg-white border-border/50 hover:border-blue-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {completedQuestionnaires.asrs ? (
                  <CheckCircle2 size={24} className="text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <Circle size={24} className="text-muted mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    ASRS v1.1 Screener
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    Brief 6-question screener • Evidence-based • ~2 minutes
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-2">
                    💡 Better accuracy with both questionnaires
                  </p>
                  {completedQuestionnaires.asrs && (
                    <p className="text-xs text-green-600 font-medium mt-2">✓ Completed</p>
                  )}
                </div>
              </div>
              {!completedQuestionnaires.asrs && (
                <Button
                  size="sm"
                  onClick={handleStartASRS}
                  className="shrink-0 ml-4"
                  variant={completedQuestionnaires.dsm5 ? "default" : "secondary"}
                >
                  Start
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Optional Games Section */}
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap size={20} className="text-amber-600" />
          Optional: Cognitive Tasks
        </h2>
        <p className="text-sm text-muted mb-4">
          Strengthen your report with objective behavioral measures of attention and impulse control
        </p>

        <div className="space-y-3">
          {/* Focus Task */}
          <motion.div
            variants={itemVariants}
            className={`rounded-xl p-4 border-2 transition-all ${
              completedGames.focusTask
                ? "bg-green-50 border-green-300"
                : "bg-white border-border/50 hover:border-amber-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {completedGames.focusTask ? (
                  <CheckCircle2 size={24} className="text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <Gauge size={24} className="text-amber-600 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Go/No-Go Task</h3>
                  <p className="text-sm text-muted mt-1">
                    Measures impulse control and attention • ~15 minutes
                  </p>
                  {completedGames.focusTask && (
                    <p className="text-xs text-green-600 font-medium mt-2">✓ Completed</p>
                  )}
                </div>
              </div>
              {!completedGames.focusTask && (
                <Button
                  size="sm"
                  onClick={handleStartFocusTask}
                  variant="ghost"
                  className="shrink-0 ml-4"
                >
                  Try
                </Button>
              )}
            </div>
          </motion.div>

          {/* Go/No-Go */}
          <motion.div
            variants={itemVariants}
            className={`rounded-xl p-4 border-2 transition-all ${
              completedGames.goNogo
                ? "bg-green-50 border-green-300"
                : "bg-white border-border/50 hover:border-amber-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {completedGames.goNogo ? (
                  <CheckCircle2 size={24} className="text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <Gauge size={24} className="text-amber-600 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Speed & Accuracy</h3>
                  <p className="text-sm text-muted mt-1">
                    Tests processing speed and motor response • ~10 minutes
                  </p>
                  {completedGames.goNogo && (
                    <p className="text-xs text-green-600 font-medium mt-2">✓ Completed</p>
                  )}
                </div>
              </div>
              {!completedGames.goNogo && (
                <Button
                  size="sm"
                  onClick={handleStartGoNogo}
                  variant="ghost"
                  className="shrink-0 ml-4"
                >
                  Try
                </Button>
              )}
            </div>
          </motion.div>

          {/* Chronos Task */}
          <motion.div
            variants={itemVariants}
            className={`rounded-xl p-4 border-2 transition-all ${
              completedGames.chronosTask
                ? "bg-green-50 border-green-300"
                : "bg-white border-border/50 hover:border-amber-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {completedGames.chronosTask ? (
                  <CheckCircle2 size={24} className="text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <Gauge size={24} className="text-amber-600 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Time Perception Task</h3>
                  <p className="text-sm text-muted mt-1">
                    Assesses time judgment and estimation • ~8 minutes
                  </p>
                  {completedGames.chronosTask && (
                    <p className="text-xs text-green-600 font-medium mt-2">✓ Completed</p>
                  )}
                </div>
              </div>
              {!completedGames.chronosTask && (
                <Button
                  size="sm"
                  onClick={handleStartChronosTask}
                  variant="ghost"
                  className="shrink-0 ml-4"
                >
                  Try
                </Button>
              )}
            </div>
          </motion.div>

          {/* Focus Quest */}
          <motion.div
            variants={itemVariants}
            className={`rounded-xl p-4 border-2 transition-all ${
              completedGames.focusQuest
                ? "bg-green-50 border-green-300"
                : "bg-white border-border/50 hover:border-amber-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {completedGames.focusQuest ? (
                  <CheckCircle2 size={24} className="text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <Gauge size={24} className="text-amber-600 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Focus Quest</h3>
                  <p className="text-sm text-muted mt-1">
                    Interactive quest-style attention challenge • ~12 minutes
                  </p>
                  {completedGames.focusQuest && (
                    <p className="text-xs text-green-600 font-medium mt-2">✓ Completed</p>
                  )}
                </div>
              </div>
              {!completedGames.focusQuest && (
                <Button
                  size="sm"
                  onClick={handleStartFocusQuest}
                  variant="ghost"
                  className="shrink-0 ml-4"
                >
                  Try
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Get Results Button */}
      <motion.div
        className="mt-8 flex gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {canGetResults && (
          <Button
            onClick={handleGetResults}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            size="lg"
          >
            ✓ Get Your Results
          </Button>
        )}
        {!canGetResults && (
          <Button
            disabled
            className="flex-1 bg-gray-200 text-gray-500"
            size="lg"
          >
            Complete a questionnaire first
          </Button>
        )}
      </motion.div>

      {canGetResults && (
        <motion.p
          className="text-xs text-green-600 text-center mt-2 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Your report is ready! Optional games will enhance your insights further.
        </motion.p>
      )}
    </div>
  );
}
