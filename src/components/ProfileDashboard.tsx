import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Share2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { CaseStudies } from "./CaseStudies";
import { SevenHats } from "./SevenHats";
import { HowIWork } from "./HowIWork";
import Waitlist from "./Waitlist";
const ProfileDashboard = () => {
  const profileImage = "/images/profile.png";
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
                <span className="flex items-center gap-3 flex-wrap">
                  <b>Currently: Building 2 Startups</b>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    <span className="text-gray-600">Accepting 1 more client</span>
                  </span>
                </span>
                <span className="block">Previously: Senior Director of Product</span>
              </div>
              <div className="text-sm text-muted-foreground">
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
              <div className="flex items-center space-x-2 mt-3"></div>

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
    <Waitlist />

    <div className="container mx-auto px-4 md:px-6 py-8">
      <Tabs defaultValue="case-studies" className="space-y-8">
        <TabsList className="w-full bg-muted/50 overflow-x-auto flex gap-2 [&>button]:shrink-0 scrollbar-none">
          <TabsTrigger value="case-studies" className="data-[state=active]:bg-card">Case Studies</TabsTrigger>
          <TabsTrigger value="seven-hats" className="data-[state=active]:bg-card">The 7 Hats</TabsTrigger>
          <TabsTrigger value="how-i-work" className="data-[state=active]:bg-card">How I Work</TabsTrigger>
        </TabsList>

        <TabsContent value="case-studies">
          <CaseStudies />
        </TabsContent>

        <TabsContent value="seven-hats">
          <SevenHats />
        </TabsContent>

        <TabsContent value="how-i-work">
          <HowIWork />
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