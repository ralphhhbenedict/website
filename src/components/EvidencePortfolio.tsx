import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Image, Video, Link, Download, Eye, Star, Calendar, Tag, TrendingUp, Code, Users, Database, Brain } from "lucide-react";
export const EvidencePortfolio = () => {
  const evidenceItems = [{
    id: 1,
    title: "AI Model Integration Architecture",
    type: "Document",
    category: "AI/ML",
    date: "2023-08-15",
    description: "Comprehensive documentation of AI model integration for personalized student experience at Princeton Review",
    tags: ["AI", "Machine Learning", "Architecture", "Product Strategy"],
    impact: "15% reduction in student prep time",
    verified: true,
    fileType: "pdf",
    icon: <Brain className="w-4 h-4" />
  }, {
    id: 2,
    title: "IAM Integration Project Dashboard",
    type: "Dashboard",
    category: "Product Management",
    date: "2023-06-20",
    description: "Interactive dashboard showing IAM integration results and KPIs",
    tags: ["IAM", "Security", "Integration", "Analytics"],
    impact: "30% reduction in support calls",
    verified: true,
    fileType: "html",
    icon: <Database className="w-4 h-4" />
  }, {
    id: 3,
    title: "React & Atomic Design Implementation",
    type: "Code Portfolio",
    category: "Technical",
    date: "2023-04-10",
    description: "Frontend modernization project showcasing React implementation with Atomic Design principles",
    tags: ["React", "Frontend", "Atomic Design", "UI/UX"],
    impact: "400% improvement in development speed",
    verified: true,
    fileType: "github",
    icon: <Code className="w-4 h-4" />
  }, {
    id: 4,
    title: "Team Leadership Testimonials",
    type: "Testimonials",
    category: "Leadership",
    date: "2023-09-01",
    description: "LinkedIn recommendations and testimonials from team members and stakeholders",
    tags: ["Leadership", "Management", "Team Building", "Communication"],
    impact: "5 direct reports managed successfully",
    verified: true,
    fileType: "link",
    icon: <Users className="w-4 h-4" />
  }, {
    id: 5,
    title: "Assessment Engine Architecture V3",
    type: "Technical Spec",
    category: "Product Architecture",
    date: "2022-12-05",
    description: "Technical specification for the third iteration of assessment engine supporting adaptive testing",
    tags: ["Assessment", "Architecture", "Testing", "Scalability"],
    impact: "Supports 70% adaptive testing",
    verified: true,
    fileType: "pdf",
    icon: <FileText className="w-4 h-4" />
  }, {
    id: 6,
    title: "Product Strategy Presentation",
    type: "Presentation",
    category: "Strategy",
    date: "2023-03-15",
    description: "Strategic presentation on AI integration roadmap and business impact",
    tags: ["Strategy", "AI", "Roadmap", "Business Impact"],
    impact: "Board approval for AI initiatives",
    verified: true,
    fileType: "pptx",
    icon: <TrendingUp className="w-4 h-4" />
  }];
  const categories = [{
    name: "All",
    count: evidenceItems.length
  }, {
    name: "AI/ML",
    count: evidenceItems.filter(item => item.category === "AI/ML").length
  }, {
    name: "Product Management",
    count: evidenceItems.filter(item => item.category === "Product Management").length
  }, {
    name: "Technical",
    count: evidenceItems.filter(item => item.category === "Technical").length
  }, {
    name: "Leadership",
    count: evidenceItems.filter(item => item.category === "Leadership").length
  }];
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "html":
        return <Code className="w-4 h-4" />;
      case "github":
        return <Code className="w-4 h-4" />;
      case "link":
        return <Link className="w-4 h-4" />;
      case "pptx":
        return <Image className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };
  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return "destructive";
      case "html":
        return "primary";
      case "github":
        return "secondary";
      case "link":
        return "warning";
      case "pptx":
        return "success";
      default:
        return "secondary";
    }
  };
  return <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Evidence Portfolio Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">24</div>
              <div className="text-sm text-muted-foreground">Total Evidence Items</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-success">22</div>
              <div className="text-sm text-muted-foreground">Verified Items</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-warning">5</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-accent">92%</div>
              <div className="text-sm text-muted-foreground">Verification Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => <Badge key={category.name} variant="outline" className="cursor-pointer hover:bg-muted/50">
            {category.name} ({category.count})
          </Badge>)}
      </div>

      {/* Evidence Items */}
      <div className="grid gap-4">
        {evidenceItems.map(item => <Card key={item.id} className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.verified && <Badge variant="success" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>}
                        <Badge variant={getFileTypeColor(item.fileType) as any} className="text-xs">
                          {getFileTypeIcon(item.fileType)}
                          {item.fileType.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        {item.category}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, tagIndex) => <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>)}
                    </div>
                    
                    {item.impact && <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                        <p className="text-sm font-medium text-success">Impact: {item.impact}</p>
                      </div>}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  
                  
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Upload More Evidence */}
      <Card className="shadow-sm border-border/50 border-dashed">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Add More Evidence</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload additional portfolio items, project documentation, or testimonials to strengthen your profile
              </p>
            </div>
            <Button>
              Upload Evidence
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
};