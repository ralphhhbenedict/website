import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PortfolioPreviewModal, PortfolioItem } from "./PortfolioPreviewModal";

const portfolioItems: Record<string, PortfolioItem> = {
  figma: {
    label: "E2E Product Artifact",
    embedUrl:
      "https://www.figma.com/embed?embed_host=share&hide-ui=1&url=https://www.figma.com/design/mB1trxPIqaiTxEhF8zlY1N/Portfolio?node-id=157-179539",
    caption: "End-to-end product documentation showing user flows, wireframes, and design specs",
    type: "figma",
  },
  figjam: {
    label: "18-Month Platform Overhaul",
    embedUrl:
      "https://www.figma.com/embed?embed_host=share&hide-ui=1&url=https://www.figma.com/board/kMYjjnxIcGmplWQLAuuHp3/Guarantee-Automation-Final-Workflow?node-id=0-1",
    caption: "Complex workflow diagram mapping 18-month platform migration with dependencies",
    type: "figjam",
  },
  miro: {
    label: "Discovery & Alignment",
    embedUrl:
      "https://miro.com/app/live-embed/uXjVJXoD4XQ=/?embedMode=view_only_without_ui&moveToViewport=-3259,-1205,8804,6682&embedId=970812397963",
    caption: "Strategic pitch board with competitive analysis, market positioning, and go-to-market strategy",
    type: "miro",
  },
  pdf: {
    label: "19-Page Technical PRD (sensitive info redacted)",
    embedUrl: "/portfolio/Guarantee_Automation_PRD.pdf#toolbar=0&navpanes=0&scrollbar=0",
    caption: "Technical product requirements document with architecture diagrams and API specs",
    type: "pdf",
  },
};

const meta: Meta<typeof PortfolioPreviewModal> = {
  title: "Molecules/PortfolioPreviewModal",
  component: PortfolioPreviewModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `Portfolio preview modal with Figma, FigJam, Miro, and PDF embeds.

## Features
- **Multiple embed types**: Figma, FigJam, Miro boards, PDFs
- **Zoom blocking**: Prevents pinch/keyboard zoom to protect content
- **Lead capture form**: Request PDF triggers form
- **Miro cropping**: Hides Miro UI controls

## Embed Types
| Type | Interaction | Notes |
|------|-------------|-------|
| Figma | View only | pointerEvents: none |
| FigJam | View only | pointerEvents: none |
| Miro | View only | Cropped to hide controls |
| PDF | Scrollable | Full interaction |

## Storybook Controls
- \`portfolioItem\`: Select different embed types
- \`miroCrop\`: Adjust Miro cropping (extraWidth, extraHeight)
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    hatTitle: { control: "text" },
    miroCrop: {
      control: "object",
      description: "Miro iframe crop settings to hide UI controls",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PortfolioPreviewModal>;

// Interactive wrapper component
const ModalWrapper = ({
  portfolioItem,
  hatTitle,
  miroCrop,
}: {
  portfolioItem: PortfolioItem;
  hatTitle: string;
  miroCrop?: { extraWidth: number; extraHeight: number };
}) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <PortfolioPreviewModal
        open={open}
        onOpenChange={setOpen}
        portfolioItem={portfolioItem}
        hatTitle={hatTitle}
        miroCrop={miroCrop}
      />
    </div>
  );
};

export const FigmaEmbed: Story = {
  render: () => (
    <ModalWrapper portfolioItem={portfolioItems.figma} hatTitle="Product Manager" />
  ),
  parameters: {
    docs: {
      description: {
        story: "Figma design embed with view-only mode (pointerEvents: none).",
      },
    },
  },
};

export const FigJamEmbed: Story = {
  render: () => (
    <ModalWrapper portfolioItem={portfolioItems.figjam} hatTitle="Product Manager" />
  ),
  parameters: {
    docs: {
      description: {
        story: "FigJam board embed showing workflow diagrams.",
      },
    },
  },
};

export const MiroEmbed: Story = {
  render: () => (
    <ModalWrapper
      portfolioItem={portfolioItems.miro}
      hatTitle="Product Manager"
      miroCrop={{ extraWidth: 70, extraHeight: 80 }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Miro board with cropped iframe to hide UI controls. Adjust miroCrop to tune positioning.",
      },
    },
  },
};

export const MiroCustomCrop: Story = {
  render: () => (
    <ModalWrapper
      portfolioItem={portfolioItems.miro}
      hatTitle="Product Manager"
      miroCrop={{ extraWidth: 100, extraHeight: 100 }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Miro board with increased crop values (100px each) for more aggressive UI hiding.",
      },
    },
  },
};

export const PDFEmbed: Story = {
  render: () => (
    <ModalWrapper portfolioItem={portfolioItems.pdf} hatTitle="Product Manager" />
  ),
  parameters: {
    docs: {
      description: {
        story: "PDF viewer with scroll enabled. Note: PDF file must exist at /portfolio/Guarantee_Automation_PRD.pdf",
      },
    },
  },
};

// All embeds comparison
export const AllEmbedTypes: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const openModal = (type: string) => {
      setSelected(type);
      setOpen(true);
    };

    return (
      <div className="p-8 space-y-4">
        <h2 className="text-xl font-bold mb-4">Select Embed Type to Test</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => openModal("figma")}>
            Figma Design
          </Button>
          <Button variant="outline" onClick={() => openModal("figjam")}>
            FigJam Board
          </Button>
          <Button variant="outline" onClick={() => openModal("miro")}>
            Miro Board
          </Button>
          <Button variant="outline" onClick={() => openModal("pdf")}>
            PDF Document
          </Button>
        </div>
        {selected && (
          <PortfolioPreviewModal
            open={open}
            onOpenChange={setOpen}
            portfolioItem={portfolioItems[selected]}
            hatTitle="Product Manager"
          />
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive story to switch between all embed types.",
      },
    },
  },
};
