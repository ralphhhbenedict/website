import type { Meta, StoryObj } from "@storybook/react";
import { HowIWork } from "./HowIWork";

const meta: Meta<typeof HowIWork> = {
  title: "Sections/HowIWork",
  component: HowIWork,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "How I Work section explaining engagement process and methodology.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HowIWork>;

export const Default: Story = {};
