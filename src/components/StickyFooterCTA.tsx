import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, X } from "lucide-react";
import { track } from "@/lib/mixpanel";

interface StickyFooterCTAProps {
  /** Scroll percentage (0-100) before showing */
  showAfterScroll?: number;
  /** Callback when CTA is clicked */
  onCtaClick?: () => void;
}

export const StickyFooterCTA = ({
  showAfterScroll = 30,
  onCtaClick,
}: StickyFooterCTAProps) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    const wasDismissed = sessionStorage.getItem("sticky_cta_dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (window.scrollY / scrollHeight) * 100;

      if (scrollPercent >= showAfterScroll && !dismissed) {
        if (!visible) {
          setVisible(true);
          track("Sticky CTA Shown", { scroll_percent: Math.round(scrollPercent) });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterScroll, dismissed, visible]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem("sticky_cta_dismissed", "true");
    track("Sticky CTA Dismissed", {});
  };

  const handleClick = () => {
    track("Sticky CTA Clicked", {});
    onCtaClick?.();
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-full duration-300">
      <div className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                Ready to work together? Let's talk.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleClick}
                className="whitespace-nowrap"
              >
                <Mail className="w-4 h-4 mr-2" />
                Get in Touch
              </Button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyFooterCTA;
