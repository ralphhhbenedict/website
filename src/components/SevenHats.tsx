import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Database,
  Code,
  TrendingUp,
  FileText,
  Users,
  Rocket,
} from "lucide-react";

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
    marketRate: "$90K-$150K",
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
    marketRate: "$60K-$90K",
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
    marketRate: "$72K-$120K",
  },
  {
    title: "Strategy Consultant",
    icon: TrendingUp,
    color: "destructive",
    deliverables: [
      "$700K pre-seed raise",
      "Series A prep",
      "$2.8M revenue impact",
    ],
    marketRate: "$120K-$240K",
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
    marketRate: "$48K-$72K",
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
    marketRate: "$60K-$90K",
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
    marketRate: "$90K-$150K",
  },
];

export const SevenHats = () => {
  const regularHats = hats.filter((h) => !h.featured);
  const featuredHat = hats.find((h) => h.featured);

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
                $540K - $912K
              </p>
            </div>
            <div className="text-lg font-medium">
              You get: <span className="text-primary">One person. One rate.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SevenHats;
