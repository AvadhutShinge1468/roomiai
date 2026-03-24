import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your email for a reset link");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 font-display text-2xl font-bold text-foreground mb-4">
            <Heart className="h-7 w-7 text-primary fill-primary" />
            RoomieAI
          </button>
          <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="text-muted-foreground mt-1">We'll send you a link to reset it</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-foreground">Check your email for a password reset link.</p>
            <Button variant="outline" onClick={() => navigate("/auth")} className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <button type="button" onClick={() => navigate("/auth")} className="w-full text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="inline h-3 w-3 mr-1" /> Back to sign in
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
