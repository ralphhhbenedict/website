import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },
    disabled: {
      control: "boolean",
    },
    placeholder: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
    type: "text",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="john@company.com" />
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="search" placeholder="Search..." />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <Input placeholder="Default" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="With value" defaultValue="Hello World" />
    </div>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <div className="bg-slate-900 p-4 rounded-lg">
      <Input
        placeholder="Enter your email"
        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
      />
    </div>
  ),
};
