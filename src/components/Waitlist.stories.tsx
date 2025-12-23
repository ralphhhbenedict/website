import type { Meta, StoryObj } from "@storybook/react";
import Waitlist from "./Waitlist";

const meta: Meta<typeof Waitlist> = {
  title: "Components/Waitlist",
  component: Waitlist,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Waitlist>;

export const Default: Story = {};
