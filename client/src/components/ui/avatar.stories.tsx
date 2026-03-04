import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackInitials: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JR</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackBrokenImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://broken-image-url.invalid/photo.jpg" alt="User" />
      <AvatarFallback>US</AvatarFallback>
    </Avatar>
  ),
};

export const MultipleAvatars: Story = {
  render: () => (
    <div className="flex gap-2">
      <Avatar>
        <AvatarFallback>A1</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>B2</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>C3</AvatarFallback>
      </Avatar>
    </div>
  ),
};
