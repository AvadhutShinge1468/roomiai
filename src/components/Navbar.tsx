import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          RoomieAI
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
          >
            How It Works
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/questionnaire")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 font-medium"
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
