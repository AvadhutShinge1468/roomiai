import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MatchCard from "@/components/MatchCard";

export interface MatchProfile {
  id?: number;
  name: string;
  age: number;
  occupation: string;
  compatibility: number;
  avatar: string;
  sharedTraits: string[];
  clashPoints: string[];
}

const Matches = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchMatches = async () => {
      try {
        const sessionData = localStorage.getItem("roomie_session");
        if (!sessionData) {
          // Check if user has previous matches
          const { data: prevMatches } = await supabase
            .from("match_results")
            .select("matches, submission_id")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (prevMatches?.matches) {
            const matchData = (prevMatches.matches as MatchProfile[]).map((m, i) => ({ ...m, id: i + 1 }));
            setMatches(matchData);
            setLoading(false);
            return;
          }

          navigate("/questionnaire");
          return;
        }

        const { submission_id, answers } = JSON.parse(sessionData);

        const { data, error: fnError } = await supabase.functions.invoke(
          "generate-matches",
          { body: { submission_id, answers } }
        );

        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        const matchData = (data.matches || []).map((m: MatchProfile, i: number) => ({
          ...m,
          id: i + 1,
        }));

        setMatches(matchData);
        // Clear session data after successful match generation
        localStorage.removeItem("roomie_session");
      } catch (err) {
        console.error("Match fetch error:", err);
        const message = err instanceof Error ? err.message : "Failed to generate matches";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-3xl">
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent mx-auto flex items-center justify-center animate-pulse-soft">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">AI is Analyzing Your Profile...</h2>
            <p className="text-muted-foreground">Our AI is comparing your lifestyle habits with potential roommates</p>
            <div className="w-48 h-2 bg-secondary rounded-full mx-auto overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: "90%" }} transition={{ duration: 8, ease: "easeOut" }} />
            </div>
          </motion.div>
        ) : error ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-32 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate("/questionnaire")} className="rounded-full">Try Again</Button>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <Button variant="ghost" onClick={() => navigate("/questionnaire")} className="mb-4 text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retake Quiz
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Your Top Matches</h1>
              <p className="text-muted-foreground mt-2">AI-generated matches based on your lifestyle questionnaire</p>
            </motion.div>
            <div className="space-y-5">
              {matches.map((match, index) => (
                <MatchCard key={match.id} match={match} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Matches;
