import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "Atoms/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/images/profile.png" alt="Ralph Bautista" />
      <AvatarFallback>RB</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src="/images/profile.png" alt="Small" />
        <AvatarFallback className="text-xs">RB</AvatarFallback>
      </Avatar>
      <Avatar className="h-12 w-12">
        <AvatarImage src="/images/profile.png" alt="Medium" />
        <AvatarFallback>RB</AvatarFallback>
      </Avatar>
      <Avatar className="h-16 w-16">
        <AvatarImage src="/images/profile.png" alt="Large" />
        <AvatarFallback className="text-lg">RB</AvatarFallback>
      </Avatar>
      <Avatar className="h-24 w-24">
        <AvatarImage src="/images/profile.png" alt="XLarge" />
        <AvatarFallback className="text-2xl">RB</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const WithRing: Story = {
  render: () => (
    <Avatar className="h-24 w-24 ring-4 ring-primary/20">
      <AvatarImage src="/images/profile.png" alt="Ralph Bautista" className="object-cover object-center" />
      <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-accent text-primary-foreground">
        RB
      </AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-primary text-primary-foreground">AB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
          RB
        </AvatarFallback>
      </Avatar>
    </div>
  ),
};
