import type { Meta, StoryObj } from "@storybook/react";
import { CaseStudies } from "./CaseStudies";

const meta: Meta<typeof CaseStudies> = {
  title: "Components/CaseStudies",
  component: CaseStudies,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof CaseStudies>;

export const Default: Story = {};
