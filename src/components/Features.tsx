import { motion } from "framer-motion";
import { Brain, MessageCircle, ShieldCheck, BarChart3, Clock, Users } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Compatibility Engine",
    description: "Our algorithm analyzes 24+ lifestyle factors to calculate a real compatibility score — not just basic filters.",
  },
  {
    icon: BarChart3,
    title: "Conflict Prediction",
    description: "Get warned about potential clash points before you sign a lease, so you can have honest conversations early.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    description: "Every user goes through ID verification, reducing scams and making the platform safer for everyone.",
  },
  {
    icon: Clock,
    title: "Lifestyle Matching",
    description: "Sleep schedules, cleanliness standards, noise levels — we match on the habits that actually matter day-to-day.",
  },
  {
    icon: MessageCircle,
    title: "Secure Messaging",
    description: "Chat with your matches in-app without sharing personal phone numbers until you're ready.",
  },
  {
    icon: Users,
    title: "Learning Algorithm",
    description: "The system improves over time using feedback from successful and unsuccessful matches.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">
            Smarter Than a Vibe Check
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            We go beyond surface-level filters to understand the daily habits that truly 
            determine whether two people can live together peacefully.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-card transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground font-sans mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
