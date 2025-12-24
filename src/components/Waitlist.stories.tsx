import type { Meta, StoryObj } from "@storybook/react";
import Waitlist from "./Waitlist";

const meta: Meta<typeof Waitlist> = {
  title: "Sections/Waitlist",
  component: Waitlist,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Waitlist signup section with email capture and services overview.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Waitlist>;

export const Default: Story = {};
