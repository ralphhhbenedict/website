import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Target,
  Database,
  Code,
  TrendingUp,
  FileText,
  Users,
  Rocket,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  trackPortfolioItemSelected,
  trackPortfolioPreviewOpened,
  trackPortfolioZoomAttempted,
  trackPortfolioPDFRequested,
  trackFormStarted,
  trackFormSuccess,
  trackEmailCaptured,
} from "@/lib/mixpanel";

const serviceOptions = [
  { value: "ai-ops", label: "AI Operations & Agent Swarms" },
  { value: "fractional-cpo", label: "Fractional CPO / Product Leadership" },
  { value: "series-a-prep", label: "Series A / Fundraise Prep" },
  { value: "technical-pm", label: "Technical PM Work" },
  { value: "product-strategy", label: "Product Strategy & Roadmapping" },
  { value: "data-analytics", label: "Data & Analytics" },
  { value: "just-browsing", label: "Just exploring / Not sure yet" },
];

const hats = [
  {
    title: "Product Manager",
    subtitle: "Director → Sr. Director",
    icon: Target,
    color: "primary",
    deliverables: [
      "30+ Products/Features shipped",
      "50+ PRDs written",
      "100+ user interviews",
    ],
    marketRate: "$180K-$400K",
    // Portfolio items with descriptions
    portfolioItems: [
      {
        label: "E2E Product Artifact",
        embedUrl: "https://www.figma.com/embed?embed_host=share&hide-ui=1&url=https://www.figma.com/design/mB1trxPIqaiTxEhF8zlY1N/Portfolio?node-id=157-179539",
        caption: "End-to-end product documentation showing user flows, wireframes, and design specs",
        type: "figma",
      },
      {
        label: "18-Month Platform Overhaul",
        embedUrl: "https://www.figma.com/embed?embed_host=share&hide-ui=1&url=https://www.figma.com/board/kMYjjnxIcGmplWQLAuuHp3/Guarantee-Automation-Final-Workflow?node-id=0-1",
        caption: "Complex workflow diagram mapping 18-month platform migration with dependencies",
        type: "figjam",
      },
      {
        label: "Discovery & Alignment",
        embedUrl: "https://miro.com/app/live-embed/uXjVJXoD4XQ=/?embedMode=view_only_without_ui&moveToViewport=-3259,-1205,8804,6682&embedId=970812397963",
        caption: "Strategic pitch board with competitive analysis, market positioning, and go-to-market strategy",
        type: "miro",
      },
      {
        label: "19-Page Technical PRD (sensitive info redacted)",
        embedUrl: "/portfolio/Guarantee_Automation_PRD.pdf#toolbar=0&navpanes=0&scrollbar=0",
        caption: "Technical product requirements document with architecture diagrams and API specs",
        type: "pdf",
      },
    ],
  },
  {
    title: "Data Analyst",
    icon: Database,
    color: "success",
    deliverables: [
      "90+ SQL queries",
      "Retention curves",
      "KPI frameworks",
    ],
    marketRate: "$100K-$160K",
  },
  {
    title: "Technical PM",
    icon: Code,
    color: "warning",
    deliverables: [
      "607 Python scripts",
      "20+ automated workflows",
      "API integrations",
    ],
    marketRate: "$150K-$200K",
  },
  {
    title: "Strategy Consultant",
    icon: TrendingUp,
    color: "destructive",
    deliverables: [
      "$700K pre-seed raise",
      "Series A prep",
      "$28.8M revenue impact",
    ],
    marketRate: "$190K-$285K",
  },
  {
    title: "Documentation Lead",
    icon: FileText,
    color: "secondary",
    deliverables: [
      "600+ slides",
      "45 Miro boards",
      "Investor data rooms",
    ],
    marketRate: "$90K-$135K",
  },
  {
    title: "Scrum Master",
    subtitle: "Project Manager",
    icon: Users,
    color: "accent",
    deliverables: [
      "Sprint planning",
      "Backlog grooming",
      "Team of 6 PMs managed",
    ],
    marketRate: "$100K-$150K",
  },
  {
    title: "Founder / CEO",
    icon: Rocket,
    color: "primary",
    featured: true,
    deliverables: [
      "Recruited 6 cofounders",
      "Cap table & legal",
      "Investor relations",
      "Company formation",
    ],
    marketRate: "$130K-$175K",
  },
];

export const SevenHats = () => {
  const regularHats = hats.filter((h) => !h.featured);
  const featuredHat = hats.find((h) => h.featured);

  // Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedHat, setSelectedHat] = useState<typeof hats[0] | null>(null);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<{
    label: string;
    embedUrl: string;
    staticImage?: string;
    caption?: string;
    type: string;
  } | null>(null);

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
  const [selectedPortfolioIndex, setSelectedPortfolioIndex] = useState<string | null>(null);

  // Block trackpad pinch-to-zoom for all portfolio previews
  useEffect(() => {
    if (!previewOpen) return;

    const handleWheel = (e: WheelEvent) => {
      // ctrlKey is true during trackpad pinch gestures on Mac
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        // Track zoom attempt
        if (selectedHat && selectedPortfolioItem) {
          trackPortfolioZoomAttempted(selectedHat.title, selectedPortfolioItem.label, 'pinch');
        }
        return false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Cmd/Ctrl + Plus/Minus/Zero for keyboard zoom
      if ((e.metaKey || e.ctrlKey) && ["+", "-", "=", "0"].includes(e.key)) {
        e.preventDefault();
        // Track zoom attempt
        if (selectedHat && selectedPortfolioItem) {
          trackPortfolioZoomAttempted(selectedHat.title, selectedPortfolioItem.label, 'keyboard');
        }
      }
    };

    // Capture phase to intercept before iframe gets it
    document.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener("wheel", handleWheel, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [previewOpen]);

  const openPreview = (hat: typeof hats[0], portfolioItem: { label: string; embedUrl: string; staticImage?: string; caption?: string; type: string }) => {
    setSelectedHat(hat);
    setSelectedPortfolioItem(portfolioItem);
    setShowForm(false);
    setSubmitted(false);
    // Prefill email from localStorage
    const savedEmail = localStorage.getItem("ralphhhbenedict_email");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    }
    setPreviewOpen(true);
    // Track preview opened
    trackPortfolioPreviewOpened(hat.title, portfolioItem.label, portfolioItem.type);
  };

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
          case_studies: [selectedHat?.title || "Portfolio"],
          source: "7hats-preview",
        },
      ]);

      localStorage.setItem("ralphhhbenedict_email", formData.email);
      setSubmitted(true);
      // Track success
      trackFormSuccess("portfolio_request");
      trackEmailCaptured("portfolio_request", formData.email.split("@")[1]);
      trackPortfolioPDFRequested(
        selectedHat?.title || "Unknown",
        selectedPortfolioItem?.label || "Unknown",
        formData.serviceInterest
      );
      toast({
        title: "Request received!",
        description: "I'll send the portfolio PDF to your email soon.",
      });
    } catch (err) {
      console.error("Form submission error:", err);
      setSubmitted(true);
      // Still track even on error (graceful degradation)
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

  return (
    <div className="space-y-6">
      {/* 6 hats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regularHats.map((hat) => (
          <Card
            key={hat.title}
            className="shadow-sm border-border/50 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-${hat.color}/10 flex items-center justify-center shrink-0`}
                >
                  <hat.icon className={`w-5 h-5 text-${hat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{hat.title}</h3>
                  {hat.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {hat.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <ul className="mt-3 space-y-1.5">
                {hat.deliverables.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Market rate:</span>
                  <Badge variant="outline" className="font-semibold">
                    {hat.marketRate}
                  </Badge>
                </div>
                {/* Portfolio dropdown + View button */}
                {hat.portfolioItems && hat.portfolioItems.length > 0 ? (
                  <div className="mt-3 flex items-center gap-2">
                    <Select
                      value={selectedPortfolioIndex || ""}
                      onValueChange={(value) => {
                        setSelectedPortfolioIndex(value);
                        if (hat.portfolioItems && value) {
                          trackPortfolioItemSelected(hat.title, hat.portfolioItems[parseInt(value)].label);
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="Select portfolio item..." />
                      </SelectTrigger>
                      <SelectContent>
                        {hat.portfolioItems.map((item, i) => (
                          <SelectItem key={i} value={String(i)} className="text-xs">
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant={selectedPortfolioIndex ? "default" : "ghost"}
                      className={selectedPortfolioIndex ? "shrink-0 h-8 px-3" : "text-muted-foreground shrink-0 h-8 px-3"}
                      onClick={() => {
                        if (selectedPortfolioIndex && hat.portfolioItems) {
                          openPreview(hat, hat.portfolioItems[parseInt(selectedPortfolioIndex)]);
                        }
                      }}
                      disabled={!selectedPortfolioIndex}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {selectedPortfolioIndex ? "View" : "Choose One"}
                    </Button>
                  </div>
                ) : (
                  <p className="mt-3 text-xs font-medium text-amber-500">
                    Portfolio Coming Soon
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured hat - Founder/CEO */}
      {featuredHat && (
        <Card className="shadow-sm border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <featuredHat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{featuredHat.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                    {featuredHat.deliverables.map((item, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-primary">•</span> {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="md:text-right">
                <span className="text-xs text-muted-foreground block">Market rate:</span>
                <Badge variant="outline" className="font-semibold mt-1">
                  {featuredHat.marketRate}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total value */}
      <Card className="shadow-sm border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
            <div>
              <p className="text-muted-foreground">
                Total if you hired separately:
              </p>
              <p className="text-3xl font-bold text-primary mt-1">
                $940K - $1.5M
              </p>
            </div>
            <div className="text-lg font-medium">
              You get: <span className="text-primary">One person. One rate.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0"
          onContextMenu={(e) => e.preventDefault()} // Disable right-click
        >
          <DialogHeader className="p-4 pb-2 border-b shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedPortfolioItem?.label || selectedHat?.title}</span>
            </DialogTitle>
          </DialogHeader>

          {!showForm ? (
            <>
              {/* Content area - Live embed with blur magnifier OR PDF iframe */}
              <div
                ref={embedContainerRef}
                className="flex-1 relative bg-gray-100 overflow-hidden"
                style={{
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  touchAction: "pan-y",
                }}
              >
                {selectedPortfolioItem && selectedPortfolioItem.type === "pdf" ? (
                  /* PDF: Use iframe with scroll */
                  <iframe
                    src={selectedPortfolioItem.embedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    style={{ pointerEvents: "auto", touchAction: "pan-y" }}
                  />
                ) : selectedPortfolioItem?.type === "miro" ? (
                  /* Miro: Crop bottom and right to hide all controls */
                  <div className="absolute inset-0 overflow-hidden">
                    <iframe
                      src={selectedPortfolioItem?.embedUrl}
                      className="absolute border-0"
                      allowFullScreen
                      style={{
                        pointerEvents: "none",
                        top: 0,
                        left: 0,
                        width: "calc(100% + 70px)", // Extra width to push right controls out of view
                        height: "calc(100% + 80px)", // Extra height to push bottom toolbar out of view
                      }}
                    />
                  </div>
                ) : (
                  /* Figma/FigJam: Live embed - view only */
                  <iframe
                    src={selectedPortfolioItem?.embedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    style={{ pointerEvents: "none" }}
                  />
                )}
              </div>

              {/* Caption + Request PDF button */}
              <div className="p-4 border-t bg-background shrink-0">
                {selectedPortfolioItem?.caption && (
                  <p className="text-sm text-foreground mb-3 font-medium">
                    {selectedPortfolioItem.caption}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedPortfolioItem?.type === "pdf"
                      ? "Full PRD document. Request access for editable version."
                      : "Preview only. Request PDF for full details."}
                  </p>
                  <Button onClick={() => {
                    setShowForm(true);
                    trackFormStarted("portfolio_request");
                  }}>
                    <FileText className="w-4 h-4 mr-2" />
                    Request PDF
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Request PDF Form */
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
                    <Label htmlFor="serviceInterest">What are you looking for help with?</Label>
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
                  <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
                  <p className="text-xl font-medium">Request received!</p>
                  <p className="text-muted-foreground">
                    {selectedPortfolioItem?.type === "pdf"
                      ? `I'll send you access details at ${formData.email} soon.`
                      : `I'll send the portfolio PDF to ${formData.email} soon.`}
                  </p>
                  <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SevenHats;
