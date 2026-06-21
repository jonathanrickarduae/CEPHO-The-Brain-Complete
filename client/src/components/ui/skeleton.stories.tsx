import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-[250px]" />,
};

export const CardSkeleton: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4 border rounded-lg w-[300px]">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 mt-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex flex-col gap-1 flex-1">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  ),
};

export const TableRowSkeleton: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-full">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  ),
};
