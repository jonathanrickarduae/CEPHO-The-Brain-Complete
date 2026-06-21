import type { Meta, StoryObj } from "@storybook/react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "./empty";
import { Button } from "./button";

const meta: Meta<typeof Empty> = {
  title: "UI/Empty",
  component: Empty,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Empty>;

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your search or filters to find what you are looking for.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const NoProjects: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Create your first project to get started with CEPHO.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Create Project</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const NoTasks: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No tasks</EmptyTitle>
        <EmptyDescription>
          You have no tasks assigned. Enjoy the quiet!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};
