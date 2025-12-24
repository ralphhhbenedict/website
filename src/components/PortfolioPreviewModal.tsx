import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  trackPortfolioZoomAttempted,
  trackPortfolioPDFRequested,
  trackFormStarted,
  trackFormSuccess,
  trackEmailCaptured,
} from "@/lib/mixpanel";

export interface PortfolioItem {
  label: string;
  embedUrl: string;
  staticImage?: string;
  caption?: string;
  type: "figma" | "figjam" | "miro" | "pdf";
}

export interface PortfolioPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioItem: PortfolioItem | null;
  hatTitle?: string;
  /** Override iframe styles for Storybook testing */
  iframeStyle?: React.CSSProperties;
  /** Miro crop settings */
  miroCrop?: {
    extraWidth: number;
    extraHeight: number;
  };
}

const serviceOptions = [
  { value: "ai-ops", label: "AI Operations & Agent Swarms" },
  { value: "fractional-cpo", label: "Fractional CPO / Product Leadership" },
  { value: "series-a-prep", label: "Series A / Fundraise Prep" },
  { value: "technical-pm", label: "Technical PM Work" },
  { value: "product-strategy", label: "Product Strategy & Roadmapping" },
  { value: "data-analytics", label: "Data & Analytics" },
  { value: "just-browsing", label: "Just exploring / Not sure yet" },
];

export const PortfolioPreviewModal = ({
  open,
  onOpenChange,
  portfolioItem,
  hatTitle = "Portfolio",
  iframeStyle,
  miroCrop = { extraWidth: 70, extraHeight: 80 },
}: PortfolioPreviewModalProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    serviceInterest: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const embedContainerRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setShowForm(false);
      setSubmitted(false);
      const savedEmail = localStorage.getItem("ralphhhbenedict_email");
      if (savedEmail) {
        setFormData((prev) => ({ ...prev, email: savedEmail }));
      }
    }
  }, [open]);

  // Block trackpad pinch-to-zoom
  useEffect(() => {
    if (!open) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (portfolioItem) {
          trackPortfolioZoomAttempted(hatTitle, portfolioItem.label, "pinch");
        }
        return false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && ["+", "-", "=", "0"].includes(e.key)) {
        e.preventDefault();
        if (portfolioItem) {
          trackPortfolioZoomAttempted(hatTitle, portfolioItem.label, "keyboard");
        }
      }
    };

    document.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener("wheel", handleWheel, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [open, portfolioItem, hatTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    setLoading(true);
    try {
      await supabase.from("pdf_requests").insert([
        {
          full_name: formData.fullName,
          email: formData.email,
          company: formData.company,
          service_interest: formData.serviceInterest,
          case_studies: [hatTitle],
          source: "7hats-preview",
        },
      ]);

      localStorage.setItem("ralphhhbenedict_email", formData.email);
      setSubmitted(true);
      trackFormSuccess("portfolio_request");
      trackEmailCaptured("portfolio_request", formData.email.split("@")[1]);
      trackPortfolioPDFRequested(
        hatTitle,
        portfolioItem?.label || "Unknown",
        formData.serviceInterest
      );
      toast({
        title: "Request received!",
        description: "I'll send the portfolio PDF to your email soon.",
      });
    } catch (err) {
      console.error("Form submission error:", err);
      setSubmitted(true);
      trackFormSuccess("portfolio_request");
      trackEmailCaptured("portfolio_request", formData.email.split("@")[1]);
      toast({
        title: "Request received!",
        description: "I'll send the portfolio PDF to your email soon.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderEmbed = () => {
    if (!portfolioItem) return null;

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      border: 0,
      ...iframeStyle,
    };

    if (portfolioItem.type === "pdf") {
      return (
        <iframe
          src={portfolioItem.embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          style={{ ...baseStyle, pointerEvents: "auto", touchAction: "pan-y" }}
        />
      );
    }

    if (portfolioItem.type === "miro") {
      return (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src={portfolioItem.embedUrl}
            className="absolute"
            allowFullScreen
            style={{
              ...baseStyle,
              pointerEvents: "none",
              top: 0,
              left: 0,
              width: `calc(100% + ${miroCrop.extraWidth}px)`,
              height: `calc(100% + ${miroCrop.extraHeight}px)`,
            }}
          />
        </div>
      );
    }

    // Figma/FigJam
    return (
      <iframe
        src={portfolioItem.embedUrl}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        style={{ ...baseStyle, pointerEvents: "none" }}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0"
        onContextMenu={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-4 pb-2 border-b shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{portfolioItem?.label || hatTitle}</span>
          </DialogTitle>
        </DialogHeader>

        {!showForm ? (
          <>
            <div
              ref={embedContainerRef}
              className="flex-1 relative bg-gray-100 overflow-hidden"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "pan-y",
              }}
            >
              {renderEmbed()}
            </div>

            <div className="p-4 border-t bg-background shrink-0">
              {portfolioItem?.caption && (
                <p className="text-sm text-foreground mb-3 font-medium">
                  {portfolioItem.caption}
                </p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {portfolioItem?.type === "pdf"
                    ? "Full PRD document. Request access for editable version."
                    : "Preview only. Request PDF for full details."}
                </p>
                <Button
                  onClick={() => {
                    setShowForm(true);
                    trackFormStarted("portfolio_request");
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Request PDF
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-auto p-6">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Smith"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Acme Inc."
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceInterest">
                    What are you looking for help with?
                  </Label>
                  <Select
                    value={formData.serviceInterest}
                    onValueChange={(value) =>
                      setFormData({ ...formData, serviceInterest: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service area..." />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Back to Preview
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Sending..." : "Request PDF"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <p className="text-xl font-medium">Request received!</p>
                <p className="text-muted-foreground">
                  {portfolioItem?.type === "pdf"
                    ? `I'll send you access details at ${formData.email} soon.`
                    : `I'll send the portfolio PDF to ${formData.email} soon.`}
                </p>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioPreviewModal;
