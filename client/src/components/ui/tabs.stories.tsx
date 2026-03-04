import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground p-4">
          Overview content goes here.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-sm text-muted-foreground p-4">
          Analytics content goes here.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-muted-foreground p-4">
          Settings content goes here.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm p-4">Account settings panel.</p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm p-4">Password change panel.</p>
      </TabsContent>
    </Tabs>
  ),
};
