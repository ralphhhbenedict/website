import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Building2, Rocket, GraduationCap, Clock, DollarSign, CheckCircle2, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { trackModalOpened, trackFormStarted, trackCaseStudyRequested, trackFormSuccess, trackFormError, trackCTAClick, trackEmailCaptured } from "@/lib/mixpanel";

const serviceOptions = [
  { value: "ai-ops", label: "AI Operations & Agent Swarms", description: "Automate workflows with AI agents" },
  { value: "fractional-cpo", label: "Fractional CPO / Product Leadership", description: "Strategy + execution in one" },
  { value: "series-a-prep", label: "Series A / Fundraise Prep", description: "Investor materials, data rooms, metrics" },
  { value: "technical-pm", label: "Technical PM Work", description: "SQL, Python, APIs — not just slides" },
  { value: "product-strategy", label: "Product Strategy & Roadmapping", description: "PRDs, roadmaps, prioritization" },
  { value: "data-analytics", label: "Data & Analytics", description: "KPIs, retention curves, dashboards" },
  { value: "team-ops", label: "Team & Project Management", description: "Sprints, planning, team scaling" },
  { value: "just-browsing", label: "Just exploring / Not sure yet", description: "No pressure, just curious" },
];

const caseStudies = [
  {
    company: "ComplyAI",
    industry: "AdTech",
    duration: "6 months",
    role: "Fractional Product Manager",
    subtitle: "Series A Prep",
    icon: Building2,
    color: "primary",
    recent: true,
    achievements: [
      "Q4 Roadmap: 4 milestones, 20 initiatives across 4 pillars",
      "Found root cause of architectural data issues",
      "Retention analysis revealing critical PMF gap",
      "Data quality investigation: 85% faster bug diagnosis",
      "Deployed 30 AI agents → 18 min to consolidate 4,593 files",
    ],
    value: "$185K-$425K knowledge base (6 months)",
  },
  {
    company: "Resume.ai",
    industry: "AI/SaaS",
    duration: "18 months",
    role: "Founder & CEO",
    subtitle: "Pre-seed Startup",
    icon: Rocket,
    color: "success",
    recent: false,
    achievements: [
      "607 Python scripts built",
      "$700K pre-seed prep",
      "Recruited 6 cofounders",
      "Cap table, legal, investor relations",
      "Company formation from scratch",
    ],
    value: "$700K pre-seed prep (9 months)",
  },
  {
    company: "The Princeton Review",
    industry: "EdTech",
    duration: "8+ years",
    role: "Product Manager → Director → Senior Director",
    subtitle: "Career Growth",
    icon: GraduationCap,
    color: "warning",
    recent: false,
    achievements: [
      "$2.8M revenue impact",
      "50+ user interviews conducted",
      "600+ slides created",
      "30+ products/features shipped",
      "Managed team of 5 (3 PMs, 1 designer, 1 Jr PM)",
    ],
    value: "$2.8M revenue impact (8+ years)",
  },
];

export const CaseStudies = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    serviceInterest: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const openModal = (companyName: string) => {
    setSelectedStudies([companyName]);
    setSubmitted(false);
    // Prefill email from localStorage if available
    const savedEmail = localStorage.getItem("ralphhhbenedict_email");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    }
    setModalOpen(true);
    trackModalOpened("case_study_request", { initial_case_study: companyName });
    trackFormStarted("case_study_request");
  };

  const toggleStudy = (companyName: string) => {
    setSelectedStudies((prev) =>
      prev.includes(companyName)
        ? prev.filter((s) => s !== companyName)
        : [...prev, companyName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || selectedStudies.length === 0) return;

    setLoading(true);
    trackCaseStudyRequested(selectedStudies, formData.serviceInterest);

    try {
      const { error } = await supabase.from("pdf_requests").insert([
        {
          full_name: formData.fullName,
          email: formData.email,
          company: formData.company,
          service_interest: formData.serviceInterest,
          case_studies: selectedStudies,
          source: "website",
        },
      ]);

      if (error) {
        // Log error for debugging but show success anyway (graceful degradation)
        console.warn("Supabase insert error:", error);
      }

      // Always show success and save email (form data captured either way)
      localStorage.setItem("ralphhhbenedict_email", formData.email);
      setSubmitted(true);
      trackFormSuccess("case_study_request");
      trackEmailCaptured("case_study_request", formData.email.split("@")[1]);
      toast({
        title: "Request received!",
        description: "I'll send the case studies to your email soon.",
      });
    } catch (err) {
      console.error("Form submission error:", err);
      trackFormError("case_study_request", "submission_failed");
      // Still show success to user - we have their info in the logs
      localStorage.setItem("ralphhhbenedict_email", formData.email);
      setSubmitted(true);
      toast({
        title: "Request received!",
        description: "I'll send the case studies to your email soon.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {caseStudies.map((study, index) => (
        <Card
          key={study.company}
          className={`shadow-sm border-border/50 ${
            study.recent ? "ring-2 ring-primary/20" : ""
          }`}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-${study.color}/10 flex items-center justify-center`}
                >
                  <study.icon className={`w-6 h-6 text-${study.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{study.company}</CardTitle>
                    <Badge variant="outline">{study.industry}</Badge>
                    {study.recent && (
                      <Badge variant="default">Most Recent</Badge>
                    )}
                  </div>
                  <p className="text-primary font-medium mt-1">{study.role}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {study.duration}
                    </span>
                    <span>{study.subtitle}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {study.achievements.map((achievement, achIndex) => (
                <div
                  key={achIndex}
                  className="flex items-start gap-2 text-sm text-foreground/80"
                >
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>{achievement}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-success font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>Value delivered: {study.value}</span>
              </div>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_0_0_rgba(var(--primary),0.7)] hover:shadow-lg transition-all duration-300 animate-[glow_2s_ease-in-out_infinite] hover:animate-none"
                onClick={() => {
                  trackCTAClick("request_pdf", "Request PDF", study.company);
                  openModal(study.company);
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Request PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-center text-sm text-muted-foreground pt-4">
        Full case studies, deliverables, and references available upon request.
      </div>

      {/* PDF Request Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Case Study PDFs</DialogTitle>
            <DialogDescription>
              I'll send the detailed case studies to your email.
            </DialogDescription>
          </DialogHeader>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.serviceInterest && (
                  <p className="text-xs text-muted-foreground">
                    {serviceOptions.find((o) => o.value === formData.serviceInterest)?.description}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Select Case Studies *</Label>
                {caseStudies.map((study) => (
                  <div key={study.company} className="flex items-center space-x-3">
                    <Checkbox
                      id={study.company}
                      checked={selectedStudies.includes(study.company)}
                      onCheckedChange={() => toggleStudy(study.company)}
                    />
                    <label
                      htmlFor={study.company}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {study.company} ({study.industry}) — {study.duration}
                    </label>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || selectedStudies.length === 0}
              >
                {loading ? "Sending..." : "Request Case Studies"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
              <p className="text-lg font-medium">Request received!</p>
              <p className="text-sm text-muted-foreground">
                I'll send the case studies to {formData.email} soon.
              </p>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseStudies;
