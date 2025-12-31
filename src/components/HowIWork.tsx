import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Zap,
  Target,
  Settings,
  Code,
  ArrowRight,
  Clock,
  FileText,
  Brain,
  Sparkles,
} from "lucide-react";
import { track } from "@/lib/mixpanel";

const services = [
  {
    title: "AI Operations Architect",
    icon: Bot,
    description: "Agent swarms + deep IC work",
    color: "primary",
  },
  {
    title: "Fractional CPO",
    icon: Target,
    description: "Strategy AND execution",
    color: "success",
  },
  {
    title: "Startup Ops",
    icon: Settings,
    description: "Series A prep with deliverables",
    color: "warning",
  },
  {
    title: "Technical PM",
    icon: Code,
    description: "SQL, Python, APIs, not just slides",
    color: "destructive",
  },
];

const agentStats = [
  { value: "30", label: "AI Agents Deployed", icon: Bot },
  { value: "4,593", label: "Files Processed", icon: FileText },
  { value: "500K+", label: "Words Classified", icon: Brain },
  { value: "18", label: "Minutes to Consolidate", icon: Clock },
];

export const HowIWork = () => {
  const hasTrackedView = useRef(false);
  const trackedStats = useRef<Set<string>>(new Set());

  // Track section view on mount
  useEffect(() => {
    if (!hasTrackedView.current) {
      track("how_i_work_viewed", {
        timestamp: new Date().toISOString(),
      });
      hasTrackedView.current = true;
    }
  }, []);

  // Track stat engagement (first time only)
  const trackStatEngagement = (statLabel: string) => {
    if (!trackedStats.current.has(statLabel)) {
      track("how_i_work_stat_engaged", {
        stat_label: statLabel,
        timestamp: new Date().toISOString(),
      });
      trackedStats.current.add(statLabel);
    }
  };

  // Track service card interaction
  const trackServiceViewed = (serviceTitle: string) => {
    track("how_i_work_service_viewed", {
      service_title: serviceTitle,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* The 18-Minute Story */}
      <Card className="shadow-sm border-border/50 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-white">The 18-Minute Story</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-slate-300">
            <p className="text-lg">
              6 months of deep IC work. Strategy. Analysis. Execution.
            </p>
            <p>
              The problem? It was scattered across{" "}
              <span className="text-white font-semibold">4,593 files</span>.
            </p>
            <p>So I deployed 30 AI agents to consolidate it all:</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {agentStats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                onMouseEnter={() => trackStatEngagement(stat.label)}
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary/20 rounded-lg border border-primary/30">
            <Clock className="w-8 h-8 text-primary shrink-0" />
            <div>
              <p className="text-slate-300">Time to consolidate:</p>
              <p className="text-2xl font-bold text-white">18 minutes.</p>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            <p>Result: 8 investor-ready master documents. Complete data room delivered.</p>
          </div>
        </CardContent>
      </Card>

      {/* What this normally costs */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            What this packaging normally costs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium">Junior Analyst</div>
              <div className="text-xs text-muted-foreground mt-1">
                Organize files, data entry, formatting
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">3-4 weeks</span>
                <Badge variant="outline">$8K-$15K</Badge>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium">Management Consultant</div>
              <div className="text-xs text-muted-foreground mt-1">
                Synthesize insights, build narrative
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">2-3 weeks</span>
                <Badge variant="outline">$40K-$80K</Badge>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium">Big 4 Team</div>
              <div className="text-xs text-muted-foreground mt-1">
                Full data room, due diligence prep
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">4-6 weeks</span>
                <Badge variant="outline">$150K-$300K</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <div>
        <h3 className="text-lg font-semibold mb-4">What I Offer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <Card
              key={service.title}
              className="shadow-sm border-border/50 hover:shadow-md transition-shadow cursor-pointer"
              onMouseEnter={() => trackServiceViewed(service.title)}
            >
              <CardContent className="p-5 text-center">
                <div
                  className={`w-12 h-12 rounded-lg bg-${service.color}/10 flex items-center justify-center mx-auto`}
                >
                  <service.icon className={`w-6 h-6 text-${service.color}`} />
                </div>
                <h4 className="font-semibold mt-3">{service.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="shadow-sm border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-6 text-center">
          <p className="text-lg">
            I do both: <span className="font-semibold">the strategy</span> AND{" "}
            <span className="font-semibold">the systems to scale it</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HowIWork;
