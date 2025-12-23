import type { Meta, StoryObj } from "@storybook/react";
import { SevenHats } from "./SevenHats";

const meta: Meta<typeof SevenHats> = {
  title: "Components/SevenHats",
  component: SevenHats,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof SevenHats>;

export const Default: Story = {};
