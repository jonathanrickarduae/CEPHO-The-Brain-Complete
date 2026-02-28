import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { Badge } from "./badge";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is the card content area. It can contain any content.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const MetricCard: Story = {
  render: () => (
    <Card className="w-64">
      <CardHeader className="pb-2">
        <CardDescription>Total Tasks</CardDescription>
        <CardTitle className="text-3xl">142</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">+12% this week</Badge>
      </CardContent>
    </Card>
  ),
};

export const StatusCard: Story = {
  render: () => (
    <Card className="w-72 border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">AI Agent Status</CardTitle>
          <Badge variant="default" className="bg-green-500/20 text-green-400">
            Active
          </Badge>
        </div>
        <CardDescription>Chief of Staff Agent</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Processing 3 pending tasks. Last active 2 minutes ago.
        </p>
      </CardContent>
    </Card>
  ),
};
