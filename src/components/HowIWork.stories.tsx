import type { Meta, StoryObj } from "@storybook/react";
import { HowIWork } from "./HowIWork";

const meta: Meta<typeof HowIWork> = {
  title: "Components/HowIWork",
  component: HowIWork,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof HowIWork>;

export const Default: Story = {};
