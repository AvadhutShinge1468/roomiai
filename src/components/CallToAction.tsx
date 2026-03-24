import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-warm">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Ready to Find Your <span className="text-gradient-primary">Ideal</span> Roommate?
          </h2>
          <p className="text-muted-foreground text-lg">
            It takes less than 5 minutes to fill out your lifestyle profile. 
            Let our AI do the rest.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/questionnaire")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 text-base font-semibold shadow-elevated transition-all hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
