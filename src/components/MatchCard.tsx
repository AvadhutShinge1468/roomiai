import { motion } from "framer-motion";
import { Heart, AlertTriangle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MatchProfile } from "@/pages/Matches";

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

interface MatchCardProps {
  match: MatchProfile;
  index: number;
}

const MatchCard = ({ match, index }: MatchCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className={`p-6 rounded-2xl border ${getScoreBg(match.compatibility)} transition-all hover:shadow-card`}
  >
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
        {match.avatar}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{match.name}</h3>
            <p className="text-sm text-muted-foreground">
              {match.age} • {match.occupation}
            </p>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(match.compatibility)}`}>
            {match.compatibility}%
          </div>
        </div>

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

        <div className="mt-4 flex gap-3">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 text-xs"
          >
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
            Message
          </Button>
          <Button size="sm" variant="outline" className="rounded-full px-5 text-xs">
            View Profile
          </Button>
        </div>
      </div>
    </div>
  </motion.div>
);

export default MatchCard;
