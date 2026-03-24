import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type QuestionType = "single" | "slider";

interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

const steps: { title: string; questions: Question[] }[] = [
  {
    title: "About You",
    questions: [
      { id: "age_range", question: "What's your age range?", type: "single", options: ["18-22", "23-27", "28-35", "36+"] },
      { id: "occupation", question: "What do you do?", type: "single", options: ["Student", "Working Professional", "Freelancer", "Other"] },
      { id: "gender_pref", question: "Preferred roommate gender?", type: "single", options: ["Male", "Female", "No Preference"] },
    ],
  },
  {
    title: "Daily Habits",
    questions: [
      { id: "sleep_schedule", question: "What's your sleep schedule?", type: "single", options: ["Early Bird (before 10 PM)", "Normal (10 PM - 12 AM)", "Night Owl (after 12 AM)", "Irregular"] },
      { id: "cleanliness", question: "How clean do you keep shared spaces?", type: "slider", min: 1, max: 5, minLabel: "Relaxed", maxLabel: "Spotless" },
      { id: "noise_level", question: "Your typical noise level at home?", type: "slider", min: 1, max: 5, minLabel: "Silent", maxLabel: "Loud" },
    ],
  },
  {
    title: "Social & Lifestyle",
    questions: [
      { id: "guests", question: "How often do you have guests over?", type: "single", options: ["Rarely", "Once a week", "Several times a week", "Almost daily"] },
      { id: "smoking", question: "Do you smoke?", type: "single", options: ["No", "Occasionally", "Yes, outside only", "Yes"] },
      { id: "pets", question: "Are you comfortable with pets?", type: "single", options: ["Love them!", "Okay with it", "Prefer not", "Allergic"] },
    ],
  },
  {
    title: "Preferences & Budget",
    questions: [
      { id: "budget", question: "Monthly rent budget?", type: "single", options: ["Under ₹5,000", "₹5,000 - ₹10,000", "₹10,000 - ₹20,000", "₹20,000+"] },
      { id: "cooking", question: "Do you cook at home?", type: "single", options: ["Daily", "A few times a week", "Rarely", "Never"] },
      { id: "introvert_extrovert", question: "How social are you?", type: "slider", min: 1, max: 5, minLabel: "Introvert", maxLabel: "Extrovert" },
    ],
  },
];

const Questionnaire = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const setAnswer = (id: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const canProceed = step.questions.every((q) => answers[q.id] !== undefined);

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setSubmitting(true);
      try {
        // Generate a session ID for this submission
        const sessionId = crypto.randomUUID();

        // Save answers to database
        const { data: submission, error: submitError } = await supabase
          .from("questionnaire_submissions")
          .insert({ session_id: sessionId, answers })
          .select("id")
          .single();

        if (submitError) throw submitError;

        // Store session info for the matches page
        localStorage.setItem("roomie_session", JSON.stringify({
          submission_id: submission.id,
          session_id: sessionId,
          answers,
        }));

        navigate("/matches");
      } catch (error) {
        console.error("Submission error:", error);
        toast.error("Failed to save your answers. Please try again.");
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{step.title}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-10">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i <= currentStep ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{step.title}</h2>

            {step.questions.map((q) => (
              <div key={q.id} className="space-y-3">
                <label className="text-base font-medium text-foreground">{q.question}</label>

                {q.type === "single" && q.options && (
                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswer(q.id, opt)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                          answers[q.id] === opt
                            ? "border-primary bg-accent text-accent-foreground shadow-sm"
                            : "border-border bg-card text-foreground hover:border-primary/30"
                        }`}
                      >
                        {answers[q.id] === opt && <Check className="inline h-4 w-4 mr-1.5 text-primary" />}
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === "slider" && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={q.min}
                      max={q.max}
                      value={(answers[q.id] as number) ?? q.min}
                      onChange={(e) => setAnswer(q.id, parseInt(e.target.value))}
                      className="w-full accent-primary h-2 rounded-full cursor-pointer"
                      style={{ accentColor: "hsl(347 77% 50%)" }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{q.minLabel}</span>
                      <span className="font-semibold text-foreground">
                        {(answers[q.id] as number) ?? q.min}
                      </span>
                      <span>{q.maxLabel}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <Button
            variant="outline"
            onClick={() => currentStep > 0 ? setCurrentStep((s) => s - 1) : navigate("/")}
            className="rounded-full px-6"
            disabled={submitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed || submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 font-semibold shadow-elevated disabled:opacity-50 disabled:shadow-none"
          >
            {submitting ? (
              <>Saving...</>
            ) : currentStep === totalSteps - 1 ? (
              <>Find Matches</>
            ) : (
              <>Next</>
            )}
            {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
