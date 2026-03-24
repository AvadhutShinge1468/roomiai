import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import type { MatchProfile } from "@/pages/Matches";
import MatchCard from "@/components/MatchCard";

interface HistoryEntry {
  id: string;
  answers: Record<string, string | number>;
  created_at: string;
  matches: MatchProfile[] | null;
}

const MatchHistory = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      // Fetch all submissions with their match results
      const { data: submissions, error } = await supabase
        .from("questionnaire_submissions")
        .select("id, answers, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !submissions) {
        console.error("History fetch error:", error);
        setLoading(false);
        return;
      }

      // Fetch match results for all submissions
      const submissionIds = submissions.map((s) => s.id);
      const { data: matchResults } = await supabase
        .from("match_results")
        .select("submission_id, matches")
        .in("submission_id", submissionIds.length > 0 ? submissionIds : ["none"]);

      const matchMap = new Map<string, MatchProfile[]>();
      matchResults?.forEach((mr) => {
        matchMap.set(mr.submission_id, mr.matches as unknown as MatchProfile[]);
      });

      const history: HistoryEntry[] = submissions.map((s) => ({
        id: s.id,
        answers: s.answers as Record<string, string | number>,
        created_at: s.created_at,
        matches: matchMap.get(s.id) || null,
      }));

      setEntries(history);
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  if (authLoading) return null;

  const getAnswerSummary = (answers: Record<string, string | number>) => {
    const highlights = [answers.occupation, answers.sleep_schedule, answers.budget].filter(Boolean);
    return highlights.join(" · ") || "Questionnaire completed";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Match History</h1>
              <p className="text-muted-foreground mt-1">Your past questionnaires and match results</p>
            </div>
            <Button onClick={() => navigate("/questionnaire")} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 font-medium">
              <Sparkles className="mr-2 h-4 w-4" /> New Match
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-pulse text-muted-foreground">Loading history...</div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">No history yet</h2>
              <p className="text-muted-foreground">Take the questionnaire to find your first roommate matches!</p>
              <Button onClick={() => navigate("/questionnaire")} className="bg-primary text-primary-foreground rounded-full px-6">
                Get Started
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {/* Summary card */}
                  <button
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    className="w-full text-left p-5 rounded-2xl border border-border bg-card hover:shadow-card transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {getAnswerSummary(entry.answers)}
                        </p>
                        {entry.matches && (
                          <p className="text-xs text-primary mt-1">
                            {entry.matches.length} matches · Top: {entry.matches[0]?.compatibility}% compatibility
                          </p>
                        )}
                      </div>
                      <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${expandedId === entry.id ? "rotate-90" : ""}`} />
                    </div>
                  </button>

                  {/* Expanded matches */}
                  {expandedId === entry.id && entry.matches && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-3 pl-2"
                    >
                      {entry.matches.map((match, i) => (
                        <MatchCard key={i} match={{ ...match, id: i + 1 }} index={i} />
                      ))}
                    </motion.div>
                  )}

                  {expandedId === entry.id && !entry.matches && (
                    <div className="mt-3 p-4 rounded-xl bg-secondary text-sm text-muted-foreground text-center">
                      No match results available for this submission.
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MatchHistory;
