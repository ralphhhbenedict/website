import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, TrendingUp, FileText, Award, Target, Brain, Database, Code, Users, Download, Share, Star, ArrowRight, CheckCircle, AlertCircle, Lightbulb, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { FitScoreMatrix } from "./FitScoreMatrix";
import { SkillsBreakdown } from "./SkillsBreakdown";
import { CareerTimeline } from "./CareerTimeline";
import { EvidencePortfolio } from "./EvidencePortfolio";
const ProfileDashboard = () => {
  const [profileImage, setProfileImage] = useState<string>("/lovable-uploads/92e488ca-c88e-4f62-919a-3d3b616ea6f0.png");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="relative group">
                <Avatar className="h-20 w-20 ring-4 ring-primary/20 cursor-pointer" onClick={triggerFileInput}>
                  <AvatarImage src={profileImage} alt="Ralph Bautista" />
                  <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-accent text-primary-foreground">RB</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center" onClick={triggerFileInput}>
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Ralph Bautista</h1>
                <p className="text-lg text-muted-foreground">Previously: Senior Director of Product
Currently: Consulting with startups</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>New York City, NY</span>
                  <span>•</span>
                  <span>rbbautista312@gmail.com</span>
                  <span>•</span>
                  <span>(310) 291-3650</span>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  
                  
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share Profile
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50">
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
                      <Badge variant={item.color as any} className="mt-1">
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
    </div>;
};
export default ProfileDashboard;