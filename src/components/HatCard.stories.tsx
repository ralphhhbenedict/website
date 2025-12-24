import type { Meta, StoryObj } from "@storybook/react";
import { Target, Database, Code, TrendingUp } from "lucide-react";
import { HatCard } from "./HatCard";
import { PortfolioItem } from "./PortfolioPreviewModal";

const samplePortfolioItems: PortfolioItem[] = [
  {
    label: "E2E Product Artifact",
    embedUrl:
      "https://www.figma.com/embed?embed_host=share&hide-ui=1&url=https://www.figma.com/design/mB1trxPIqaiTxEhF8zlY1N/Portfolio?node-id=157-179539",
    caption: "End-to-end product documentation showing user flows, wireframes, and design specs",
    type: "figma",
  },
  {
    label: "18-Month Platform Overhaul",
    embedUrl:
      "https://www.figma.com/embed?embed_host=share&hide-ui=1&url=https://www.figma.com/board/kMYjjnxIcGmplWQLAuuHp3/Guarantee-Automation-Final-Workflow?node-id=0-1",
    caption: "Complex workflow diagram mapping 18-month platform migration with dependencies",
    type: "figjam",
  },
  {
    label: "Discovery & Alignment",
    embedUrl:
      "https://miro.com/app/live-embed/uXjVJXoD4XQ=/?embedMode=view_only_without_ui&moveToViewport=-3259,-1205,8804,6682&embedId=970812397963",
    caption: "Strategic pitch board with competitive analysis, market positioning, and go-to-market strategy",
    type: "miro",
  },
  {
    label: "19-Page Technical PRD (sensitive info redacted)",
    embedUrl: "/portfolio/Guarantee_Automation_PRD.pdf#toolbar=0&navpanes=0&scrollbar=0",
    caption: "Technical product requirements document with architecture diagrams and API specs",
    type: "pdf",
  },
];

const meta: Meta<typeof HatCard> = {
  title: "Molecules/HatCard",
  component: HatCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `Hat card showing role, deliverables, market rate, and portfolio dropdown.

## Features
- **Role info**: Title, subtitle, icon, deliverables
- **Market rate badge**: Shows salary range
- **Portfolio dropdown**: Select + View button
- **Coming Soon state**: When no portfolio items

## Interactions
1. Select portfolio item from dropdown
2. Click "View" to open preview modal
3. Mixpanel tracks: Portfolio Item Selected, Portfolio Preview Opened
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
    marketRate: { control: "text" },
    color: {
      control: "select",
      options: ["primary", "success", "warning", "destructive", "secondary"],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HatCard>;

export const WithPortfolio: Story = {
  args: {
    title: "Product Manager",
    subtitle: "Director -> Sr. Director",
    icon: Target,
    color: "primary",
    deliverables: [
      "30+ Products/Features shipped",
      "50+ PRDs written",
      "100+ user interviews",
    ],
    marketRate: "$180K-$400K",
    portfolioItems: samplePortfolioItems,
  },
  parameters: {
    docs: {
      description: {
        story: "Hat card with portfolio dropdown. Select an item and click View to test the modal.",
      },
    },
  },
};

export const ComingSoon: Story = {
  args: {
    title: "Data Analyst",
    icon: Database,
    color: "success",
    deliverables: ["90+ SQL queries", "Retention curves", "KPI frameworks"],
    marketRate: "$60K-$90K",
    portfolioItems: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: "Hat card without portfolio items shows 'Portfolio Coming Soon' message.",
      },
    },
  },
};

export const TechnicalPM: Story = {
  args: {
    title: "Technical PM",
    icon: Code,
    color: "warning",
    deliverables: [
      "607 Python scripts",
      "20+ automated workflows",
      "API integrations",
    ],
    marketRate: "$72K-$120K",
    portfolioItems: undefined,
  },
};

export const StrategyConsultant: Story = {
  args: {
    title: "Strategy Consultant",
    icon: TrendingUp,
    color: "destructive",
    deliverables: [
      "$700K pre-seed raise",
      "Series A prep",
      "$28.8M revenue impact",
    ],
    marketRate: "$120K-$240K",
    portfolioItems: undefined,
  },
};

// Grid layout story
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-[1000px]">
      <HatCard
        title="Product Manager"
        subtitle="Director -> Sr. Director"
        icon={Target}
        color="primary"
        deliverables={[
          "30+ Products/Features shipped",
          "50+ PRDs written",
          "100+ user interviews",
        ]}
        marketRate="$180K-$400K"
        portfolioItems={samplePortfolioItems}
      />
      <HatCard
        title="Data Analyst"
        icon={Database}
        color="success"
        deliverables={["90+ SQL queries", "Retention curves", "KPI frameworks"]}
        marketRate="$60K-$90K"
      />
      <HatCard
        title="Technical PM"
        icon={Code}
        color="warning"
        deliverables={[
          "607 Python scripts",
          "20+ automated workflows",
          "API integrations",
        ]}
        marketRate="$72K-$120K"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Grid layout showing multiple hat cards together.",
      },
    },
  },
};
