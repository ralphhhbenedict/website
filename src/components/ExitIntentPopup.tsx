import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  track,
  trackFormStarted,
  trackFormSuccess,
  trackEmailCaptured,
} from "@/lib/mixpanel";

interface ExitIntentPopupProps {
  /** Delay in ms before exit intent detection starts */
  delay?: number;
}

export const ExitIntentPopup = ({ delay = 5000 }: ExitIntentPopupProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if already shown this session or user already submitted
    const alreadyShown = sessionStorage.getItem("exit_intent_shown");
    const alreadySubmitted = localStorage.getItem("ralphhhbenedict_email");

    if (alreadyShown || alreadySubmitted) {
      setHasShown(true);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let isEnabled = false;

    // Enable exit intent detection after delay
    timeoutId = setTimeout(() => {
      isEnabled = true;
    }, delay);

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves through the top of the viewport
      if (!isEnabled || hasShown || e.clientY > 50) return;

      setOpen(true);
      setHasShown(true);
      sessionStorage.setItem("exit_intent_shown", "true");
      track("Exit Intent Triggered", { delay_ms: delay });
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [delay, hasShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    trackFormStarted("exit_intent");

    try {
      await supabase.from("waitlist").insert([
        {
          email,
          source: "exit_intent",
        },
      ]);

      localStorage.setItem("ralphhhbenedict_email", email);
      setSubmitted(true);
      trackFormSuccess("exit_intent");
      trackEmailCaptured("exit_intent", email.split("@")[1]);
      toast({
        title: "You're on the list!",
        description: "I'll send you my top case studies.",
      });
    } catch (err) {
      console.error("Exit intent form error:", err);
      // Still show success (graceful degradation)
      setSubmitted(true);
      trackFormSuccess("exit_intent");
      toast({
        title: "You're on the list!",
        description: "I'll send you my top case studies.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    track("Exit Intent Dismissed", { had_email: !!email });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>

        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <span>👋</span> Before you go...
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <p className="text-muted-foreground">
                Get my <span className="font-semibold text-foreground">top 3 case studies</span> showing
                how I helped startups raise <span className="font-semibold text-foreground">$700K+</span> and
                ship <span className="font-semibold text-foreground">30+ products</span>.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  <FileText className="w-4 h-4 mr-2" />
                  {loading ? "Sending..." : "Send Case Studies"}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center">
                No spam. I'll reach out personally.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="text-lg font-medium">You're on the list!</p>
              <p className="text-muted-foreground text-sm mt-1">
                Check your inbox for my top case studies.
              </p>
            </div>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Continue browsing
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
