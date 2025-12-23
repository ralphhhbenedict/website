import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

const meta: Meta<typeof Tabs> = {
  title: "Molecules/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="p-4">Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="p-4">Content for Tab 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="p-4">Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  ),
};

export const ProfileTabs: Story = {
  render: () => (
    <Tabs defaultValue="case-studies" className="w-[600px]">
      <TabsList className="w-full bg-muted/50">
        <TabsTrigger value="case-studies" className="data-[state=active]:bg-card">
          Case Studies
        </TabsTrigger>
        <TabsTrigger value="seven-hats" className="data-[state=active]:bg-card">
          The 7 Hats
        </TabsTrigger>
        <TabsTrigger value="how-i-work" className="data-[state=active]:bg-card">
          How I Work
        </TabsTrigger>
      </TabsList>
      <TabsContent value="case-studies">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Case Studies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              3 detailed case studies with achievements and value delivered.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="seven-hats">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>The 7 Hats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              7 roles I've worn with market rates: $540K-$912K total value.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="how-i-work">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>How I Work</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The 18-minute story: 30 AI agents, 4,593 files consolidated.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};
