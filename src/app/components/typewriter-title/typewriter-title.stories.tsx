import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { INTRO_KEY, TypewriterTitle } from "./typewriter-title";

const meta = {
  title: "Components/TypewriterTitle",
  component: TypewriterTitle,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof TypewriterTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstVisit: Story = {
  decorators: [
    (Story) => {
      sessionStorage.clear();
      return <Story />;
    },
  ],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export const ReturningVisit: Story = {
  decorators: [
    (Story) => {
      sessionStorage.setItem(INTRO_KEY, "true");
      return <Story />;
    },
  ],
};
