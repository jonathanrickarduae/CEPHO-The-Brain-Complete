import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

const meta: Meta<typeof ScrollArea> = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const tags = [
  "React",
  "TypeScript",
  "Tailwind",
  "Vite",
  "tRPC",
  "Drizzle",
  "Supabase",
  "PostgreSQL",
  "OpenAI",
  "Sentry",
  "Storybook",
  "Vitest",
  "Playwright",
  "ESLint",
  "Prettier",
  "Husky",
  "GitHub Actions",
  "Render",
  "Winston",
  "pgvector",
];

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {tags.map(tag => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="shrink-0 rounded-md border p-4 w-32 text-center text-sm"
          >
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
