import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { User, TrendingUp, FileText, Award, Target, Brain, Database, Code, Users, Download, Share, Star, ArrowRight, CheckCircle, AlertCircle, Lightbulb, Camera } from "lucide-react";
import { type VariantProps } from "class-variance-authority";
import { toast } from "@/components/ui/use-toast";
import { FitScoreMatrix } from "./FitScoreMatrix";
import { SkillsBreakdown } from "./SkillsBreakdown";
import { CareerTimeline } from "./CareerTimeline";
import { EvidencePortfolio } from "./EvidencePortfolio";
const ProfileDashboard = () => {
  const profileImage = "/images/profile.png";
  type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
  const [shareOpen, setShareOpen] = React.useState(false);
  const handleShareProfile = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ralph Bautista", url });
      } catch {
        // User canceled or share failed; do nothing. Avoid opening modal after native sheet.
      }
      return;
    }
    // No native share support: open modal fallback
    setShareOpen(true);
  };

  const handleDownloadResume = async () => {
    const resumeUrl = "/resume.pdf";
    try {
      const response = await fetch(resumeUrl, { method: "HEAD" });
      if (response.ok) {
        const anchor = document.createElement("a");
        anchor.href = resumeUrl;
        anchor.download = "Ralph_Bautista_Resume.pdf";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } else {
        toast({ title: "Resume not found", description: "Add resume.pdf to the public/ folder." });
      }
    } catch {
      toast({ title: "Resume not found", description: "Add resume.pdf to the public/ folder." });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
    {/* Header */}
    <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-0">
          <div className="flex items-start gap-4 md:gap-6">
            <div className="relative">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 ring-4 ring-primary/20">
                <AvatarImage src={profileImage} alt="Ralph Bautista" className="object-cover object-center" />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-accent text-primary-foreground">RB</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Ralph Benedict Bautista</h1>
              <div className="text-lg text-muted-foreground">
                <span className="block"><b>Currently: Consulting with startups</b></span>
                <span className="block">Previously: Senior Director of Product</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>New York City, NY</span>
                <span className="hidden sm:inline">•</span>
                <a
                  href="mailto:ralphhhbenedict@gmail.com"
                  className="text-primary underline underline-offset-2 hover:opacity-90 font-medium"
                >
                  ralphhhbenedict@gmail.com
                </a>
                <span className="hidden sm:inline">•</span>
                <a
                  href="https://www.linkedin.com/in/ralphbenedict"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:opacity-90 font-medium break-all"
                >
                  www.linkedin.com/in/ralphbenedict
                </a>
              </div>
              <div className="flex items-center space-x-2 mt-3"></div>

              {/* Mobile actions (stack under profile info) */}
              <div className="mt-4 grid grid-cols-2 gap-2 md:hidden">
                <Button variant="outline" size="sm" className="w-full justify-center" onClick={handleShareProfile}>
                  <Share className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
                <Button size="sm" className="w-full justify-center" onClick={handleDownloadResume}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Resume
                </Button>
              </div>
            </div>
          </div>
          {/* Desktop actions (stay to the right) */}
          <div className="hidden md:flex space-x-3">
            <Button variant="outline" size="sm" onClick={handleShareProfile}>
              <Share className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
            <Button size="sm" onClick={handleDownloadResume}>
              <Download className="w-4 h-4 mr-2" />
              Download Resume
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div className="container mx-auto px-4 md:px-6 py-8">
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="w-full bg-muted/50 overflow-x-auto flex gap-2 [&>button]:shrink-0 scrollbar-none">
          <TabsTrigger value="overview" className="data-[state=active]:bg-card">Overview</TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-card">Skills Analysis</TabsTrigger>
          <TabsTrigger value="career" className="data-[state=active]:bg-card">Career Arc</TabsTrigger>
          <TabsTrigger value="evidence" className="data-[state=active]:bg-card">Evidence Portfolio</TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-card">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Professional Summary */}
            <Card className="lg:col-span-2 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-primary" />
                  <span>Professional Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/90">I’m a product and organizational leader who bridges strategy and execution to drive measurable business outcomes. I work closely with design, engineering, operations, and support teams to turn complex challenges into clear, actionable plans. My approach blends market insight with operational discipline—translating business goals into milestones, validating solutions with real-world feedback, and aligning technical delivery with strategic intent. By orchestrating cross-functional collaboration, I help clients bring products to market efficiently and with lasting impact.</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Profile Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profile Completeness</span>
                    <span className="font-semibold">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Evidence Files</span>
                    <span className="font-semibold">24 items (upon request)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Skills Verified</span>
                    <span className="font-semibold">47/52</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Career Progression</span>
                    <span className="font-semibold text-success">Strong</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fit Score Matrix */}
          <FitScoreMatrix />

          {/* Core Competencies */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <span>Core Competencies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Product Strategy & Road-mapping", "Client Discovery & Consulting", "Data & AI: Snowflake, dbt, SQL", "ML/Heuristics & MLOps", "Identity & Access Management", "GDPR/CCPA Compliance", "Cross-functional Leadership", "Agile/Scrum Methodologies"].map(skill => <Badge key={skill} variant="secondary" className="justify-center p-2 text-xs">
                  {skill}
                </Badge>)}
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Key Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[{
                  title: "AI Model Integration",
                  description: "Led AI model integration for personalized user journeys with 15% student prep time reduction",
                  impact: "30% reduction in support call volumes"
                }, {
                  title: "V4 Student Dashboard",
                  description: "Modernized front-end framework with React and Atomic Design principles",
                  impact: "400% improvement in project turn-around time"
                }, {
                  title: "Assessment Engine Enhancement",
                  description: "Built third iteration powering 30% traditional and 70% adaptive testing",
                  impact: "400% faster project delivery"
                }].map((achievement, index) => <div key={index} className="border-l-4 border-primary/20 pl-4 py-2">
                  <h4 className="font-semibold text-sm">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                  <p className="text-sm text-success font-medium mt-1">{achievement.impact}</p>
                </div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <SkillsBreakdown />
        </TabsContent>

        <TabsContent value="career">
          <CareerTimeline />
        </TabsContent>

        <TabsContent value="evidence">
          <EvidencePortfolio />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Action Items */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                <span>Recommended Actions</span>
              </CardTitle>
              <CardDescription>
                Based on your profile analysis, here are personalized recommendations to enhance your marketability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[{
                  priority: "High",
                  title: "Add Machine Learning Certifications",
                  description: "Your ML/Heuristics score could benefit from formal certifications in TensorFlow or PyTorch",
                  action: "Explore Coursera ML courses",
                  color: "destructive"
                }, {
                  priority: "Medium",
                  title: "Expand Data Engineering Portfolio",
                  description: "Add more evidence of large-scale data pipeline projects to strengthen this competency",
                  action: "Document recent dbt implementations",
                  color: "warning"
                }, {
                  priority: "Low",
                  title: "Leadership Testimonials",
                  description: "Gather LinkedIn recommendations from your direct reports at Princeton Review",
                  action: "Request recommendations",
                  color: "success"
                }].map((item, index) => <div key={index} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                  <Badge variant={item.color as BadgeVariant} className="mt-1">
                    {item.priority}
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <Button size="sm" variant="outline" className="w-fit">
                      {item.action}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>)}
              </div>
            </CardContent>
          </Card>

          {/* Market Positioning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Market Positioning</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm font-medium text-success">Strong Fit For:</p>
                    <ul className="text-sm text-foreground/80 mt-1 space-y-1">
                      <li>• Senior Product Manager (AI/ML)</li>
                      <li>• Director of Product Strategy</li>
                      <li>• VP of Product (EdTech)</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm font-medium text-warning">Growth Opportunities:</p>
                    <ul className="text-sm text-foreground/80 mt-1 space-y-1">
                      <li>• Technical Product Manager</li>
                      <li>• Chief Product Officer</li>
                      <li>• Product Strategy Consultant</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span>Learning Path</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[{
                    skill: "Advanced ML Operations",
                    current: 7.5,
                    target: 9.0,
                    timeframe: "3-6 months"
                  }, {
                    skill: "Executive Leadership",
                    current: 8.5,
                    target: 9.5,
                    timeframe: "6-12 months"
                  }, {
                    skill: "Technical Architecture",
                    current: 7.0,
                    target: 8.5,
                    timeframe: "3-6 months"
                  }].map((item, index) => <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.skill}</span>
                      <span className="text-muted-foreground">{item.timeframe}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={item.current / 10 * 100} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground">{item.current} → {item.target}</span>
                    </div>
                  </div>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>

    {/* Share Modal for desktop */}
    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share profile</DialogTitle>
          <DialogDescription>Share or copy the link to this profile.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => {
            const url = window.location.origin;
            const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            window.open(shareUrl, "_blank", "noopener,noreferrer");
          }}>LinkedIn</Button>
          <Button variant="outline" onClick={() => {
            const url = window.location.origin;
            const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out Ralph Bautista")}`;
            window.open(shareUrl, "_blank", "noopener,noreferrer");
          }}>X (Twitter)</Button>
          <Button variant="outline" onClick={async () => {
            const url = window.location.origin;
            try { await navigator.clipboard.writeText(url); toast({ title: "Link copied", description: url }); } catch { toast({ title: "Unable to copy", description: url }); }
          }}>Copy link</Button>
          <Button variant="outline" onClick={() => {
            const url = window.location.origin;
            const mailto = `mailto:?subject=${encodeURIComponent("Ralph Bautista Profile")}&body=${encodeURIComponent(url)}`;
            window.location.href = mailto;
          }}>Email</Button>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setShareOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
};
export default ProfileDashboard;