import type { Meta, StoryObj } from "@storybook/react";
import { SevenHats } from "./SevenHats";

const meta: Meta<typeof SevenHats> = {
  title: "Sections/SevenHats",
  component: SevenHats,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "The 7 Hats section showcasing different roles and their market rates.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SevenHats>;

export const Default: Story = {};
