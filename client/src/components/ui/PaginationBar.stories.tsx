import type { Meta, StoryObj } from "@storybook/react";
import { PaginationBar } from "./PaginationBar";
import type { UsePaginationReturn } from "@/hooks/usePagination";

const meta: Meta<typeof PaginationBar> = {
  title: "UI/PaginationBar",
  component: PaginationBar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PaginationBar>;

function makePagination(page: number, totalPages: number): UsePaginationReturn {
  return {
    page,
    limit: 20,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    goToPage: (p: number) => console.log("Go to page:", p),
    nextPage: () => console.log("Next page"),
    prevPage: () => console.log("Prev page"),
    setLimit: () => {},
    reset: () => {},
    offset: (page - 1) * 20,
  };
}

export const FirstPage: Story = {
  render: () => (
    <PaginationBar pagination={makePagination(1, 10)} total={200} />
  ),
};

export const MiddlePage: Story = {
  render: () => (
    <PaginationBar pagination={makePagination(5, 10)} total={200} />
  ),
};

export const LastPage: Story = {
  render: () => (
    <PaginationBar pagination={makePagination(10, 10)} total={200} />
  ),
};

export const SinglePage: Story = {
  render: () => (
    <PaginationBar pagination={makePagination(1, 1)} total={5} />
  ),
};

export const ManyPages: Story = {
  render: () => (
    <PaginationBar pagination={makePagination(25, 100)} total={2000} />
  ),
};
