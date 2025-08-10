import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Code, 
  Database, 
  Users, 
  Shield, 
  Zap,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export const SkillsBreakdown = () => {
  const skillCategories = {
    soft: [
      { name: "Leadership & Team Building", level: 9.5, verified: true },
      { name: "Cross-functional Collaboration", level: 9.8, verified: true },
      { name: "Strategic Thinking", level: 9.2, verified: true },
      { name: "Problem Solving", level: 9.0, verified: true },
      { name: "Communication", level: 10, verified: true },
      { name: "Mentoring & Coaching", level: 8.8, verified: true }
    ],
    technical: [
      { name: "Product Strategy & Roadmapping", level: 9.6, verified: true },
      { name: "SQL & Database Design", level: 8.7, verified: true },
      { name: "Data Pipeline Architecture", level: 8.4, verified: true },
      { name: "ML/AI Model Integration", level: 8.8, verified: true },
      { name: "API Design & Integration", level: 8.2, verified: false },
      { name: "Analytics & BI Dashboards", level: 9.2, verified: true }
    ],
    tools: [
      { name: "Figma", level: 9.0, verified: true },
      { name: "Jira & Confluence", level: 9.5, verified: true },
      { name: "Mixpanel & Analytics", level: 8.8, verified: true },
      { name: "Snowflake", level: 8.5, verified: true },
      { name: "dbt", level: 8.2, verified: false },
      { name: "React & Frontend", level: 7.8, verified: true },
      { name: "Python", level: 7.5, verified: false },
      { name: "Postman", level: 8.0, verified: true }
    ],
    frameworks: [
      { name: "Agile/Scrum", level: 9.8, verified: true },
      { name: "Design Thinking", level: 9.2, verified: true },
      { name: "Jobs-to-be-Done (JTBD)", level: 9.0, verified: true },
      { name: "Atomic Design", level: 8.5, verified: true },
      { name: "Design Systems", level: 8.8, verified: true },
      { name: "Lean Startup", level: 8.7, verified: true }
    ]
  };

  const getSkillColor = (level: number) => {
    if (level >= 9.5) return "success";
    if (level >= 8.5) return "primary";
    if (level >= 7.5) return "warning";
    return "destructive";
  };

  const renderSkillCard = (title: string, icon: React.ReactNode, skills: any[]) => (
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
          <Badge variant="outline" className="ml-auto">
            {skills.filter(s => s.verified).length}/{skills.length} verified
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{skill.name}</span>
                {skill.verified ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-warning" />
                )}
              </div>
              <Badge variant={getSkillColor(skill.level) as any} className="text-xs">
                {skill.level}/10
              </Badge>
            </div>
            <Progress value={skill.level * 10} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Skills Overview */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Skills Analysis Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-success">47</div>
              <div className="text-sm text-muted-foreground">Skills Verified</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">8.9</div>
              <div className="text-sm text-muted-foreground">Avg. Skill Level</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-warning">5</div>
              <div className="text-sm text-muted-foreground">Skills to Improve</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-accent">12</div>
              <div className="text-sm text-muted-foreground">Domain Expertise</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSkillCard(
          "Soft Skills", 
          <Users className="w-5 h-5 text-primary" />, 
          skillCategories.soft
        )}
        
        {renderSkillCard(
          "Technical Skills", 
          <Brain className="w-5 h-5 text-primary" />, 
          skillCategories.technical
        )}
        
        {renderSkillCard(
          "Tools & Platforms", 
          <Code className="w-5 h-5 text-primary" />, 
          skillCategories.tools
        )}
        
        {renderSkillCard(
          "Frameworks & Methodologies", 
          <Zap className="w-5 h-5 text-primary" />, 
          skillCategories.frameworks
        )}
      </div>

      {/* Skill Gaps Analysis */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span>Skill Gap Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-semibold text-destructive mb-2">Critical Gaps</h4>
                <ul className="text-sm space-y-1">
                  <li>• Advanced ML Operations (7.5 → 9.0 target)</li>
                  <li>• Cloud Infrastructure (6.8 → 8.5 target)</li>
                </ul>
              </div>
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <h4 className="font-semibold text-warning mb-2">Growth Areas</h4>
                <ul className="text-sm space-y-1">
                  <li>• Python Programming (7.5 → 8.5 target)</li>
                  <li>• dbt Data Modeling (8.2 → 9.0 target)</li>
                  <li>• API Architecture (8.2 → 9.0 target)</li>
                </ul>
              </div>
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <h4 className="font-semibold text-success mb-2">Strengths</h4>
                <ul className="text-sm space-y-1">
                  <li>• Product Strategy (9.6/10)</li>
                  <li>• Team Leadership (9.8/10)</li>
                  <li>• Cross-functional Collaboration (9.8/10)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};