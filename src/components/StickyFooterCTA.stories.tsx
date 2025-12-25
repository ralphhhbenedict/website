import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StickyFooterCTA } from "./StickyFooterCTA";

const meta: Meta<typeof StickyFooterCTA> = {
  title: "Molecules/StickyFooterCTA",
  component: StickyFooterCTA,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `Sticky footer CTA bar that appears after user scrolls past a threshold.

## Behavior
- Appears after scrolling past configurable percentage (default 30%)
- Can be dismissed (persists in sessionStorage)
- Slides in from bottom with animation

## Props
- \`showAfterScroll\`: Percentage (0-100) before showing
- \`onCtaClick\`: Callback when CTA button clicked

## Mixpanel Events
- \`Sticky CTA Shown\` - bar appears
- \`Sticky CTA Clicked\` - user clicks CTA
- \`Sticky CTA Dismissed\` - user closes bar
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    showAfterScroll: {
      control: { type: "range", min: 0, max: 100, step: 5 },
      description: "Scroll percentage before showing",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StickyFooterCTA>;

// Scrollable content wrapper
const ScrollableWrapper = ({
  showAfterScroll,
  onCtaClick,
}: {
  showAfterScroll: number;
  onCtaClick?: () => void;
}) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    onCtaClick?.();
  };

  return (
    <div className="min-h-[200vh] p-8">
      <div className="sticky top-4 z-40 bg-background/80 backdrop-blur p-4 rounded-lg border mb-8">
        <h2 className="text-xl font-bold">Sticky Footer CTA Demo</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Scroll down {showAfterScroll}% to see the sticky bar appear
        </p>
        {clicked && (
          <p className="text-green-600 font-medium mt-2">CTA was clicked!</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => {
            sessionStorage.removeItem("sticky_cta_dismissed");
            window.location.reload();
          }}
        >
          Reset dismissed state
        </Button>
      </div>

      {/* Scroll markers */}
      {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((percent) => (
        <div
          key={percent}
          className="py-8 border-t"
          style={{ marginTop: `${percent * 0.8}vh` }}
        >
          <span
            className={`text-sm font-medium ${
              percent <= showAfterScroll ? "text-muted-foreground" : "text-primary"
            }`}
          >
            {percent}% scrolled
            {percent === showAfterScroll && " ← CTA appears here"}
          </span>
        </div>
      ))}

      <StickyFooterCTA showAfterScroll={showAfterScroll} onCtaClick={handleClick} />
    </div>
  );
};

export const Default: Story = {
  render: () => <ScrollableWrapper showAfterScroll={30} />,
  parameters: {
    docs: {
      description: {
        story: "Default: appears after 30% scroll. Scroll down to see the sticky bar.",
      },
    },
  },
};

export const EarlyTrigger: Story = {
  render: () => <ScrollableWrapper showAfterScroll={10} />,
  parameters: {
    docs: {
      description: {
        story: "Aggressive: appears after just 10% scroll for maximum visibility.",
      },
    },
  },
};

export const LateTrigger: Story = {
  render: () => <ScrollableWrapper showAfterScroll={70} />,
  parameters: {
    docs: {
      description: {
        story: "Conservative: appears after 70% scroll, only for engaged users.",
      },
    },
  },
};

// Isolated bar preview (no scroll needed)
export const BarOnly: Story = {
  render: () => (
    <div className="p-8">
      <p className="text-muted-foreground mb-4">
        Isolated view of the sticky bar (normally hidden until scroll trigger):
      </p>
      <div className="relative h-20 border rounded-lg overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Ready to work together? Let's talk.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="secondary">
                  Get in Touch
                </Button>
                <button className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors">
                  <span className="text-sm">✕</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Static preview of the bar component without scroll behavior.",
      },
    },
  },
};
