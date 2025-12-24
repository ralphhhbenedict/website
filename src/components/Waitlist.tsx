import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Zap, Target, Users, Brain } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { trackFormStarted, trackFormSubmitted, trackFormSuccess, trackFormError } from "@/lib/mixpanel";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formStarted, setFormStarted] = useState(false);

  const handleFocus = () => {
    if (!formStarted) {
      trackFormStarted("waitlist");
      setFormStarted(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    trackFormSubmitted("waitlist", { email_domain: email.split("@")[1] });

    try {
      const { error } = await supabase
        .from("waitlist")
        .insert([{ email, source: "website" }]);

      if (error) {
        if (error.code === "23505") {
          // Still save email for form prefill even if duplicate
          localStorage.setItem("ralphhhbenedict_email", email);
          trackFormSuccess("waitlist"); // Already on list = success
          toast({
            title: "Already on the list",
            description: "You're already signed up. I'll be in touch soon.",
          });
        } else {
          throw error;
        }
      } else {
        // Save email to localStorage for prefilling other forms
        localStorage.setItem("ralphhhbenedict_email", email);
        setSubmitted(true);
        trackFormSuccess("waitlist");
        toast({
          title: "You're on the list",
          description: "I'll reach out when I have availability.",
        });
      }
    } catch (err) {
      trackFormError("waitlist", "submission_failed");
      toast({
        title: "Something went wrong",
        description: "Please try again or email me directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const services = [
    { icon: Brain, label: "AI Operations Architect", desc: "Agent swarms + deep IC work" },
    { icon: Target, label: "Fractional CPO", desc: "Strategy AND execution" },
    { icon: Zap, label: "Startup Ops", desc: "Series A prep with deliverables" },
    { icon: Users, label: "Technical PM", desc: "SQL, Python, APIs, not just slides" },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/50 text-primary">
              Now Accepting Clients
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              The Swiss Army Knife<br />Your Company Needs
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              8+ years as a PM. From IC to Senior Director to Founder/CEO.
              <br />
              I do both: the strategy AND the systems to scale it.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {services.map((service) => (
              <Card key={service.label} className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-4 flex items-start gap-3">
                  <service.icon className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold text-white">{service.label}</div>
                    <div className="text-sm text-slate-400">{service.desc}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Value Prop */}
          <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/50 max-w-2xl mx-auto">
            <div className="text-lg text-slate-300">
              7 hats I've worn. <span className="text-primary font-semibold">$540K-$912K</span> if you hired separately.
            </div>
            <div className="text-slate-500 mt-2">
              1-3 clients per quarter. Limited availability.
            </div>
          </div>

          {/* Waitlist Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleFocus}
                  required
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
                <Button type="submit" disabled={loading} className="shrink-0">
                  {loading ? "..." : "Get in Touch"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                Or DM me on{" "}
                <a
                  href="https://www.linkedin.com/in/ralphbenedict"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  LinkedIn
                </a>
              </p>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-primary">
              <CheckCircle className="w-5 h-5" />
              <span className="text-lg">You're on the list. I'll be in touch.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Waitlist;
