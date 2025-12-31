import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Share2, Sparkles, Briefcase, Mail } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { CaseStudies } from "./CaseStudies";
import { SevenHats } from "./SevenHats";
import { HowIWork } from "./HowIWork";
import Waitlist from "./Waitlist";
import { ExitIntentPopup } from "./ExitIntentPopup";
import { StickyFooterCTA } from "./StickyFooterCTA";
import { trackTabChanged, trackShareClicked, trackCTAClick } from "@/lib/mixpanel";
import { usePortfolioAnalytics } from "@/hooks/usePortfolioAnalytics";

const ProfileDashboard = () => {
  const profileImage = "/images/profile.png";
  const [shareOpen, setShareOpen] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState<string>("case-studies");
  const tabsRef = useRef<HTMLDivElement>(null);
  const waitlistRef = useRef<HTMLDivElement>(null);

  // V1.2 Portfolio Analytics - Profile Page Tracking
  const {
    trackPageViewed,
    trackCtaClicked: trackPortfolioCta,
    createSectionRef,
  } = usePortfolioAnalytics();

  // Track page view on mount
  useEffect(() => {
    trackPageViewed();
  }, [trackPageViewed]);

  // Section refs for viewport tracking
  const caseStudiesRef = createSectionRef('case-studies');
  const sevenHatsRef = createSectionRef('seven-hats');
  const howIWorkRef = createSectionRef('how-i-work');

  const scrollToWork = () => {
    trackCTAClick("see_my_work", "See My Work", "header");
    trackPortfolioCta("see_my_work", "See My Work", "header");
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToContact = () => {
    trackCTAClick("get_in_touch", "Get in Touch", "header");
    trackPortfolioCta("get_in_touch", "Get in Touch", "header");
    waitlistRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const handleShareProfile = async () => {
    const url = window.location.origin;
    trackShareClicked("native_or_modal");
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ralph Bautista", url });
        trackShareClicked("native_share");
      } catch {
        // User canceled or share failed; do nothing. Avoid opening modal after native sheet.
      }
      return;
    }
    // No native share support: open modal fallback
    setShareOpen(true);
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
              <div className="mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-full text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-green-700">Accepting 1 more client</span>
                </span>
              </div>
              <div className="text-lg text-muted-foreground">
                <span className="block"><b>Currently: Building 2 Startups</b></span>
                <span className="block">Previously: Senior Director of Product</span>
              </div>
              <div className="text-sm font-semibold text-foreground/80">
                NYC | LA | SF | MNL
              </div>
              <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground mt-2">
                <a
                  href="mailto:ralphhhbenedict@gmail.com"
                  className="text-primary underline underline-offset-2 hover:opacity-90 font-medium"
                >
                  Email
                </a>
                <span>|</span>
                <a
                  href="https://www.linkedin.com/in/ralphbenedict"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:opacity-90 font-medium"
                >
                  LinkedIn
                </a>
                <span>|</span>
                <a
                  href="https://www.instagram.com/ralphhhbenedict/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:opacity-90 font-medium"
                >
                  Instagram
                </a>
              </div>
              {/* Above-fold CTA buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Button
                  size="sm"
                  onClick={scrollToWork}
                  className="group"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  See My Work
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={scrollToContact}
                  className="group hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Get in Touch
                </Button>
              </div>

              {/* Mobile actions */}
              <div className="mt-4 md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center group hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  onClick={handleShareProfile}
                >
                  <Share2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Share Profile
                  <Sparkles className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </div>
            </div>
          </div>
          {/* Desktop actions */}
          <div className="hidden md:flex">
            <Button
              variant="outline"
              size="sm"
              className="group hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              onClick={handleShareProfile}
            >
              <Share2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Share Profile
              <Sparkles className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Waitlist CTA Section */}
    <div ref={waitlistRef}>
      <Waitlist />
    </div>

    <div ref={tabsRef} className="container mx-auto px-4 md:px-6 py-8">
      <Tabs
          defaultValue="case-studies"
          className="space-y-8"
          onValueChange={(value) => {
            trackTabChanged(currentTab, value);
            setCurrentTab(value);
          }}
        >
        <TabsList className="w-full bg-muted/50 overflow-x-auto flex gap-2 [&>button]:shrink-0 scrollbar-none">
          <TabsTrigger value="case-studies" className="data-[state=active]:bg-card">Case Studies</TabsTrigger>
          <TabsTrigger value="seven-hats" className="data-[state=active]:bg-card">The 7 Hats</TabsTrigger>
          <TabsTrigger value="how-i-work" className="data-[state=active]:bg-card">How I Work</TabsTrigger>
        </TabsList>

        <TabsContent value="case-studies">
          <div ref={caseStudiesRef}>
            <CaseStudies />
          </div>
        </TabsContent>

        <TabsContent value="seven-hats">
          <div ref={sevenHatsRef}>
            <SevenHats />
          </div>
        </TabsContent>

        <TabsContent value="how-i-work">
          <div ref={howIWorkRef}>
            <HowIWork />
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
            trackShareClicked("linkedin");
            const url = window.location.origin;
            const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            window.open(shareUrl, "_blank", "noopener,noreferrer");
          }}>LinkedIn</Button>
          <Button variant="outline" onClick={() => {
            trackShareClicked("twitter");
            const url = window.location.origin;
            const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out Ralph Bautista")}`;
            window.open(shareUrl, "_blank", "noopener,noreferrer");
          }}>X (Twitter)</Button>
          <Button variant="outline" onClick={async () => {
            trackShareClicked("copy_link");
            const url = window.location.origin;
            try { await navigator.clipboard.writeText(url); toast({ title: "Link copied", description: url }); } catch { toast({ title: "Unable to copy", description: url }); }
          }}>Copy link</Button>
          <Button variant="outline" onClick={() => {
            trackShareClicked("email");
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

    {/* Optimization components */}
    <ExitIntentPopup delay={5000} />
    <StickyFooterCTA showAfterScroll={30} onCtaClick={scrollToContact} />
  </div>;
};
export default ProfileDashboard;
