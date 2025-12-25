import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExitIntentPopup } from "./ExitIntentPopup";

const meta: Meta<typeof ExitIntentPopup> = {
  title: "Molecules/ExitIntentPopup",
  component: ExitIntentPopup,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `Exit intent popup that triggers when user moves cursor to close the tab.

## Behavior
- Detects mouse leaving viewport through the top (y < 50px)
- Only triggers after configurable delay (default 5s)
- Only shows once per session (sessionStorage)
- Skips if user already has email in localStorage

## Mixpanel Events
- \`Exit Intent Triggered\` - popup shown
- \`Exit Intent Dismissed\` - closed without submitting
- \`Form Started\` (exit_intent)
- \`Form Success\` (exit_intent)
- \`Email Captured\` (source: exit_intent)

## Data Storage
- Email saved to \`waitlist\` table in Supabase
- Email cached in localStorage for form prefill
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ExitIntentPopup>;

// Manual trigger wrapper for Storybook testing
const ManualTriggerWrapper = ({ delay }: { delay: number }) => {
  const [forceShow, setForceShow] = useState(false);

  return (
    <div className="p-8 min-h-[400px]">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Exit Intent Popup Demo</h2>
        <p className="text-muted-foreground">
          In production, this popup triggers when the user moves their cursor toward the browser's close button.
        </p>
        <p className="text-sm text-muted-foreground">
          Delay: {delay}ms before detection starts
        </p>

        <div className="border rounded-lg p-4 bg-muted/50">
          <p className="font-medium mb-2">Test in Storybook:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Move your cursor to the very top of this iframe</li>
            <li>The popup should appear after {delay / 1000}s delay</li>
            <li>Or click the button below to manually trigger</li>
          </ol>
        </div>

        <Button onClick={() => {
          sessionStorage.removeItem("exit_intent_shown");
          localStorage.removeItem("ralphhhbenedict_email");
          window.location.reload();
        }}>
          Reset & Reload (clear session flags)
        </Button>
      </div>

      <ExitIntentPopup delay={delay} />
    </div>
  );
};

export const Default: Story = {
  render: () => <ManualTriggerWrapper delay={5000} />,
  parameters: {
    docs: {
      description: {
        story: "Default configuration with 5 second delay before exit intent detection activates.",
      },
    },
  },
};

export const QuickTrigger: Story = {
  render: () => <ManualTriggerWrapper delay={1000} />,
  parameters: {
    docs: {
      description: {
        story: "1 second delay - useful for testing. Move cursor to top of iframe quickly.",
      },
    },
  },
};

export const InstantTrigger: Story = {
  render: () => <ManualTriggerWrapper delay={0} />,
  parameters: {
    docs: {
      description: {
        story: "No delay - triggers immediately on mouse leave. Good for testing the popup UI.",
      },
    },
  },
};
