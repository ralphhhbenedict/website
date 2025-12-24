import type { Meta, StoryObj } from "@storybook/react";
import { SevenHats } from "./SevenHats";

const meta: Meta<typeof SevenHats> = {
  title: "Sections/SevenHats",
  component: SevenHats,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `The 7 Hats section showcasing different roles and their market rates.

## Features
- **7 role cards** with deliverables and market rates
- **Portfolio previews** with Figma/FigJam embeds and PDF viewer
- **Request PDF modal** for lead capture
- **Zoom blocking** to protect portfolio content

## Portfolio Items (Product Manager)
- E2E Product Artifact (Figma embed)
- 18-Month Platform Overhaul (FigJam embed)
- 19-Page Technical PRD (PDF viewer)

## Mixpanel Events
- \`Portfolio Item Selected\` - dropdown selection
- \`Portfolio Preview Opened\` - view button clicked
- \`Portfolio Zoom Attempted\` - pinch/keyboard zoom blocked
- \`Portfolio PDF Requested\` - form submitted
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SevenHats>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Full SevenHats section with portfolio dropdown and preview modals.",
      },
    },
  },
};
