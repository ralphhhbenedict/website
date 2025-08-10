import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Plus } from "lucide-react";
export const FitScoreMatrix = () => {
  const dimensions = [{
    name: "Product Strategy & Road-mapping",
    resumeOnly: 9.5,
    linkedin: 9.5,
    saxecap: 9.5,
    vendor: 9.6,
    rag: 9.6,
    netChange: 0.1
  }, {
    name: "Stakeholder / Consulting Fit",
    resumeOnly: 8.0,
    linkedin: 8.5,
    saxecap: 9.0,
    vendor: 9.5,
    rag: 9.5,
    netChange: 1.5
  }, {
    name: "AI / ML Fluency",
    resumeOnly: 7.0,
    linkedin: 7.5,
    saxecap: 8.8,
    vendor: 8.8,
    rag: 9.3,
    netChange: 2.3
  }, {
    name: "Dashboard / BI",
    resumeOnly: 7.5,
    linkedin: 7.5,
    saxecap: 9.0,
    vendor: 9.2,
    rag: 9.2,
    netChange: 1.7
  }, {
    name: "Data-Engineering Concepts",
    resumeOnly: 7.0,
    linkedin: 7.0,
    saxecap: 8.2,
    vendor: 8.4,
    rag: 8.7,
    netChange: 1.7
  }, {
    name: "Privacy / Security",
    resumeOnly: 8.5,
    linkedin: 9.0,
    saxecap: 9.0,
    vendor: 9.0,
    rag: 9.0,
    netChange: 0.5
  }, {
    name: "Communication & Docs",
    resumeOnly: 10,
    linkedin: 10,
    saxecap: 10,
    vendor: 10,
    rag: 10,
    netChange: 0
  }, {
    name: "Team & Culture Fit",
    resumeOnly: 9.0,
    linkedin: 9.0,
    saxecap: 9.0,
    vendor: 9.0,
    rag: 9.0,
    netChange: 0
  }];
  const getScoreColor = (score: number) => {
    if (score >= 9.5) return "text-success";
    if (score >= 8.5) return "text-primary";
    if (score >= 7.5) return "text-warning";
    return "text-destructive";
  };
  const getChangeColor = (change: number) => {
    if (change > 1.5) return "text-success";
    if (change > 0.5) return "text-primary";
    if (change > 0) return "text-warning";
    return "text-muted-foreground";
  };
  return <Card className="shadow-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Skills Matrix</span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">Progression over the years and by project.</div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 pr-4 font-medium">Dimension</th>
                <th className="text-center px-2 py-3 font-medium">2018-2020</th>
                <th className="text-center px-2 py-3 font-medium">2020-2022</th>
                <th className="text-center px-2 py-3 font-medium">First AI Project</th>
                <th className="text-center px-2 py-3 font-medium">React + Vite Migration</th>
                <th className="text-center px-2 py-3 font-medium">LLM Orchestration</th>
                <th className="text-center pl-2 py-3 font-medium">Currently</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dim, index) => <tr key={index} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-4 pr-4 font-medium">{dim.name}</td>
                  <td className="text-center px-2 py-4">{dim.resumeOnly}</td>
                  <td className="text-center px-2 py-4">{dim.linkedin}</td>
                  <td className="text-center px-2 py-4">{dim.saxecap}</td>
                  <td className="text-center px-2 py-4">{dim.vendor}</td>
                  <td className={`text-center px-2 py-4 font-semibold ${getScoreColor(dim.rag)}`}>
                    {dim.rag}
                  </td>
                  <td className={`text-center pl-2 py-4 font-semibold ${getChangeColor(dim.netChange)}`}>
                    {dim.netChange > 0 ? `+${dim.netChange}` : dim.netChange || '—'}
                  </td>
                </tr>)}
              <tr className="border-t-2 border-primary/20 bg-primary/5">
                <td className="py-4 pr-4 font-bold">Overall (weighted)</td>
                <td className="text-center px-2 py-4 font-semibold">8.5</td>
                <td className="text-center px-2 py-4 font-semibold">9.1</td>
                <td className="text-center px-2 py-4 font-semibold">9.4</td>
                <td className="text-center px-2 py-4 font-semibold">9.6</td>
                <td className="text-center px-2 py-4 font-bold text-success text-lg">9.7</td>
                <td className="text-center pl-2 py-4 font-bold text-success">9.7/10</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-2">
          {[{
          label: "Excellent (9.5+)",
          color: "success"
        }, {
          label: "Strong (8.5-9.4)",
          color: "primary"
        }, {
          label: "Good (7.5-8.4)",
          color: "warning"
        }, {
          label: "Needs Improvement (<7.5)",
          color: "destructive"
        }].map(item => <Badge key={item.label} variant={item.color as any} className="text-xs">
              {item.label}
            </Badge>)}
        </div>
      </CardContent>
    </Card>;
};