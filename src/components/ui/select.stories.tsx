import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "./label";

const meta: Meta<typeof Select> = {
  title: "Molecules/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="service">Service Interest</Label>
      <Select>
        <SelectTrigger id="service">
          <SelectValue placeholder="Select a service area..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ai-ops">AI Operations & Agent Swarms</SelectItem>
          <SelectItem value="fractional-cpo">Fractional CPO / Product Leadership</SelectItem>
          <SelectItem value="series-a-prep">Series A / Fundraise Prep</SelectItem>
          <SelectItem value="technical-pm">Technical PM Work</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const ServiceOptions: Story = {
  render: () => {
    const serviceOptions = [
      { value: "ai-ops", label: "AI Operations & Agent Swarms", description: "Automate workflows with AI agents" },
      { value: "fractional-cpo", label: "Fractional CPO / Product Leadership", description: "Strategy + execution in one" },
      { value: "series-a-prep", label: "Series A / Fundraise Prep", description: "Investor materials, data rooms, metrics" },
      { value: "technical-pm", label: "Technical PM Work", description: "SQL, Python, APIs — not just slides" },
      { value: "product-strategy", label: "Product Strategy & Roadmapping", description: "PRDs, roadmaps, prioritization" },
      { value: "data-analytics", label: "Data & Analytics", description: "KPIs, retention curves, dashboards" },
      { value: "team-ops", label: "Team & Project Management", description: "Sprints, planning, team scaling" },
      { value: "just-browsing", label: "Just exploring / Not sure yet", description: "No pressure, just curious" },
    ];

    return (
      <div className="space-y-2 w-[350px]">
        <Label>What are you looking for help with?</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a service area..." />
          </SelectTrigger>
          <SelectContent>
            {serviceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This helps me understand how I can best help you.
        </p>
      </div>
    );
  },
};
