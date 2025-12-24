import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta: Meta<typeof Checkbox> = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    checked: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {},
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">Checked by default</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled" disabled />
        <Label htmlFor="disabled" className="text-muted-foreground">Disabled unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <Label htmlFor="disabled-checked" className="text-muted-foreground">Disabled checked</Label>
      </div>
    </div>
  ),
};

export const CaseStudySelection: Story = {
  render: () => (
    <div className="space-y-3">
      <Label>Select Case Studies *</Label>
      {[
        { company: "ComplyAI", industry: "AdTech", duration: "6 months" },
        { company: "Resume.ai", industry: "AI/SaaS", duration: "18 months" },
        { company: "The Princeton Review", industry: "EdTech", duration: "8+ years" },
      ].map((study) => (
        <div key={study.company} className="flex items-center space-x-3">
          <Checkbox id={study.company} defaultChecked={study.company === "ComplyAI"} />
          <label
            htmlFor={study.company}
            className="text-sm font-medium leading-none cursor-pointer"
          >
            {study.company} ({study.industry}) — {study.duration}
          </label>
        </div>
      ))}
    </div>
  ),
};
