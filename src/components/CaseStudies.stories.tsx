import type { Meta, StoryObj } from "@storybook/react";
import { CaseStudies } from "./CaseStudies";

const meta: Meta<typeof CaseStudies> = {
  title: "Sections/CaseStudies",
  component: CaseStudies,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Case studies section with detailed work history and PDF request modal.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CaseStudies>;

export const Default: Story = {};
