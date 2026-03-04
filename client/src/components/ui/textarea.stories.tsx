import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    rows: { control: { type: "number", min: 2, max: 20 } },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Type your message here...",
  },
};

export const WithValue: Story = {
  args: {
    value: "This is a pre-filled textarea with some content.",
    readOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "This field is disabled",
    disabled: true,
  },
};

export const Tall: Story = {
  args: {
    placeholder: "Tall textarea for long-form content...",
    rows: 8,
  },
};
