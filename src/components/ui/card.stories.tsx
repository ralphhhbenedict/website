import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Building2, Clock, DollarSign, CheckCircle2 } from "lucide-react";

const meta: Meta<typeof Card> = {
  title: "Molecules/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const CaseStudyCard: Story = {
  render: () => (
    <Card className="w-[500px] shadow-sm border-border/50 ring-2 ring-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">ComplyAI</CardTitle>
                <Badge variant="outline">AdTech</Badge>
                <Badge variant="default">Most Recent</Badge>
              </div>
              <p className="text-primary font-medium mt-1">Fractional Product Manager</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  6 months
                </span>
                <span>Series A Prep</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {["Q4 Roadmap: 4 milestones, 20 initiatives", "Found root cause of data issues", "Deployed 30 AI agents"].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-500 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>Value delivered: $185K-$425K</span>
          </div>
          <Button size="sm">Request PDF</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const ServiceCard: Story = {
  render: () => (
    <Card className="w-[250px] shadow-sm border-border/50 hover:shadow-md transition-shadow">
      <CardContent className="p-5 text-center">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <h4 className="font-semibold mt-3">AI Operations Architect</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Agent swarms + deep IC work
        </p>
      </CardContent>
    </Card>
  ),
};

export const GradientCard: Story = {
  render: () => (
    <Card className="w-[400px] shadow-sm border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
      <CardContent className="p-6 text-center">
        <p className="text-lg">
          I do both: <span className="font-semibold">the strategy</span> AND{" "}
          <span className="font-semibold">the systems to scale it</span>.
        </p>
      </CardContent>
    </Card>
  ),
};
