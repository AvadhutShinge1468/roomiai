import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, AlertTriangle, MessageCircle, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface MatchProfile {
  id: number;
  name: string;
  age: number;
  occupation: string;
  compatibility: number;
  avatar: string;
  sharedTraits: string[];
  clashPoints: string[];
}

const generateMockMatches = (): MatchProfile[] => [
  {
    id: 1, name: "Priya Sharma", age: 24, occupation: "Software Engineer",
    compatibility: 94, avatar: "PS",
    sharedTraits: ["Night Owl", "High Cleanliness", "Rarely has guests", "Loves cooking"],
    clashPoints: ["Slightly different noise tolerance"],
  },
  {
    id: 2, name: "Arjun Mehta", age: 26, occupation: "UX Designer",
    compatibility: 87, avatar: "AM",
    sharedTraits: ["Non-smoker", "Pet-friendly", "Similar budget range"],
    clashPoints: ["Different sleep schedules", "Guest frequency varies"],
  },
  {
    id: 3, name: "Sneha Reddy", age: 23, occupation: "Graduate Student",
    compatibility: 82, avatar: "SR",
    sharedTraits: ["Introvert-leaning", "Quiet home preference", "Budget-friendly"],
    clashPoints: ["Cooking habits differ", "Cleanliness standards vary slightly"],
  },
  {
    id: 4, name: "Rahul Verma", age: 28, occupation: "Freelance Writer",
    compatibility: 76, avatar: "RV",
    sharedTraits: ["Flexible schedule", "Pet lover", "Non-smoker"],
    clashPoints: ["Different social energy", "Guest preferences differ", "Noise level mismatch"],
  },
  {
    id: 5, name: "Kavya Nair", age: 25, occupation: "Marketing Analyst",
    compatibility: 71, avatar: "KN",
    sharedTraits: ["Similar age group", "Working professional"],
    clashPoints: ["Sleep schedule conflict", "Different cleanliness standards", "Social habits differ"],
  },
];

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-primary";
  if (score >= 70) return "text-amber-500";
  return "text-muted-foreground";
};

const getScoreBg = (score: number) => {
  if (score >= 90) return "bg-green-50 border-green-200";
  if (score >= 80) return "bg-accent border-primary/20";
  if (score >= 70) return "bg-amber-50 border-amber-200";
  return "bg-secondary border-border";
};

const Matches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI processing
    const timer = setTimeout(() => {
      setMatches(generateMockMatches());
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-3xl">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-accent mx-auto flex items-center justify-center animate-pulse-soft">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Analyzing Your Profile...</h2>
            <p className="text-muted-foreground">Our AI is comparing your lifestyle with potential roommates</p>
            <div className="w-48 h-2 bg-secondary rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <Button
                variant="ghost"
                onClick={() => navigate("/questionnaire")}
                className="mb-4 text-muted-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Your Top Matches
              </h1>
              <p className="text-muted-foreground mt-2">
                Based on 24 lifestyle factors analyzed by our AI
              </p>
            </motion.div>

            <div className="space-y-5">
              {matches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl border ${getScoreBg(match.compatibility)} transition-all hover:shadow-card`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                      {match.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{match.name}</h3>
                          <p className="text-sm text-muted-foreground">{match.age} • {match.occupation}</p>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(match.compatibility)}`}>
                          {match.compatibility}%
                        </div>
                      </div>

                      {/* Shared traits */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {match.sharedTraits.map((trait) => (
                          <span
                            key={trait}
                            className="inline-flex items-center gap-1 text-xs font-medium bg-card px-2.5 py-1 rounded-full border border-border text-foreground"
                          >
                            <Heart className="h-3 w-3 text-primary" />
                            {trait}
                          </span>
                        ))}
                      </div>

                      {/* Clash points */}
                      {match.clashPoints.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {match.clashPoints.map((clash) => (
                            <span
                              key={clash}
                              className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-amber-700"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {clash}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex gap-3">
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 text-xs"
                        >
                          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                          Message
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full px-5 text-xs"
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Matches;
