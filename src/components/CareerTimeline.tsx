import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  TrendingUp, 
  Award, 
  Users, 
  Target,
  Building,
  MapPin
} from "lucide-react";

export const CareerTimeline = () => {
  const positions = [
    {
      company: "The Princeton Review",
      role: "Senior Director of Product, AI & Initiative Projects",
      period: "March 2022 - Present",
      location: "New York City, NY",
      type: "Current",
      achievements: [
        "Led Identity & Access Management (IAM) integrations resulting in 30% reduction on support call volumes",
        "Lead AI model integration for personalized user experience with 15% student prep time reduction",
        "Modernized front-end framework with REACT and Atomic Design principles",
        "Managed 3 product managers, 1 product designer, and 1 junior product manager"
      ],
      skills: ["Product Strategy", "AI/ML Integration", "Team Leadership", "IAM", "React"],
      impact: "High",
      progression: "Leadership"
    },
    {
      company: "The Princeton Review",
      role: "Director of Product, Student Dashboard, Assessment Engine, Customer Service Tool",
      period: "July 2019 - February 2022",
      location: "New York City, NY",
      type: "Promotion",
      achievements: [
        "Built third iteration of Assessment Engine powering 30% traditional and 70% adaptive testing",
        "Identified workflow inefficiencies and implemented optimizations with 400% improvement on project turn-around time"
      ],
      skills: ["Assessment Systems", "Workflow Optimization", "Data Analytics"],
      impact: "High",
      progression: "Management"
    },
    {
      company: "The Princeton Review",
      role: "Product Manager, AET-Online Content",
      period: "November 2018 - June 2019",
      location: "New York City, NY",
      type: "Role Change",
      achievements: [
        "Managed all proprietary content with slew of tools like CMS, CDN and Assessment Engine Tool",
        "Maintained 6,000 content objects across 31 different test types spanning High School to Graduate level"
      ],
      skills: ["Content Management", "CMS Systems", "Product Management"],
      impact: "Medium",
      progression: "IC"
    },
    {
      company: "Tutor.com",
      role: "Product Coordinator",
      period: "March 2016 - October 2018",
      location: "New York City, NY",
      type: "Entry",
      achievements: [
        "Assisted the Director of Product on low to mid LOE projects",
        "Gained foundational product management experience"
      ],
      skills: ["Project Coordination", "Product Support"],
      impact: "Low",
      progression: "Entry Level"
    }
  ];

  const education = [
    {
      institution: "UC Riverside",
      degree: "Bachelor of Arts in Psychology",
      period: "August 2012",
      location: "Riverside, CA"
    }
  ];

  const certifications = [
    {
      name: "The Web Developer Bootcamp: MEAN Stack",
      provider: "Udemy.com",
      year: "2018"
    },
    {
      name: "The Advanced Web Developer Bootcamp: React/Redux",
      provider: "Udemy.com", 
      year: "2022"
    },
    {
      name: "AI for Everyone",
      provider: "Deeplearning.ai (Coursera c/o Andrew Ng)",
      year: "2023"
    }
  ];

  const getProgressionColor = (type: string) => {
    switch (type) {
      case "Current": return "success";
      case "Promotion": return "primary";
      case "Role Change": return "warning";
      case "Entry": return "secondary";
      default: return "secondary";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "text-success";
      case "Medium": return "text-warning";
      case "Low": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Career Arc Analysis */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Career Arc Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <Award className="w-8 h-8 text-success mx-auto" />
              <div className="text-2xl font-bold text-success">6.5</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
            <div className="text-center space-y-2">
              <Users className="w-8 h-8 text-primary mx-auto" />
              <div className="text-2xl font-bold text-primary">5+</div>
              <div className="text-sm text-muted-foreground">Team Members Led</div>
            </div>
            <div className="text-center space-y-2">
              <Target className="w-8 h-8 text-warning mx-auto" />
              <div className="text-2xl font-bold text-warning">3</div>
              <div className="text-sm text-muted-foreground">Promotions</div>
            </div>
            <div className="text-center space-y-2">
              <Building className="w-8 h-8 text-accent mx-auto" />
              <div className="text-2xl font-bold text-accent">2</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">Career Progression Assessment</h4>
            <p className="text-sm text-foreground/80">
              <strong>Above Average Progression:</strong> Demonstrates strong career trajectory with consistent promotions 
              and increasing responsibility. Moved from Product Coordinator to Senior Director in 6 years, showing 
              exceptional growth rate and leadership potential.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Professional Experience Timeline */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Professional Experience</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {positions.map((position, index) => (
              <div key={index} className="relative">
                {index !== positions.length - 1 && (
                  <div className="absolute left-4 top-16 bottom-0 w-0.5 bg-border"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full bg-${getProgressionColor(position.type)} flex items-center justify-center flex-shrink-0 mt-1`}>
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{position.role}</h3>
                          <p className="text-primary font-medium">{position.company}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{position.period}</span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {position.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={getProgressionColor(position.type) as any}>
                            {position.type}
                          </Badge>
                          <span className={`text-sm font-medium ${getImpactColor(position.impact)}`}>
                            {position.impact} Impact
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="font-medium text-sm mb-2">Key Achievements:</h4>
                        <ul className="space-y-1">
                          {position.achievements.map((achievement, achIndex) => (
                            <li key={achIndex} className="text-sm text-foreground/80 flex items-start">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {position.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education & Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent>
            {education.map((edu, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold">{edu.degree}</h3>
                <p className="text-primary">{edu.institution}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{edu.period}</span>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {edu.location}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Certifications & Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="space-y-1">
                  <h4 className="font-medium text-sm">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground">{cert.provider} • {cert.year}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};