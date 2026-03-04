import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./progress";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 60,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Full: Story = {
  args: {
    value: 100,
  },
};

export const Quarter: Story = {
  args: {
    value: 25,
  },
};

export const ThreeQuarters: Story = {
  args: {
    value: 75,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      <div className="flex justify-between text-sm">
        <span>Project Progress</span>
        <span>67%</span>
      </div>
      <Progress value={67} />
    </div>
  ),
};
