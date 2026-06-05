import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { BlogSearch } from "./blog-search";

/** Matches `useOpenIntent` default in blog-search. */
const OPEN_INTENT_DELAY = 120;

const meta = {
  title: "Components/BlogSearch",
  component: BlogSearch,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/blog" },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    current: { control: "boolean" },
  },
} satisfies Meta<typeof BlogSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: { current: false },
};

export const Current: Story = {
  args: { current: true },
};

export const Open: Story = {
  args: { current: false },
  parameters: {
    chromatic: { delay: 200 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = await canvas.findByRole("link", { name: "Blog" });
    const root = link.parentElement;

    if (!root) {
      throw new Error("Expected BlogSearch root container");
    }

    // pointerenter does not bubble; hover the root, not the link.
    // fireEvent does not reliably trigger React handlers in Storybook's browser.
    await userEvent.hover(root);

    await waitFor(
      () => {
        expect(
          canvas.getByRole("combobox", { name: "Search blog posts" }),
        ).toBeInTheDocument();
      },
      { timeout: OPEN_INTENT_DELAY + 500 },
    );
  },
};

export const Playground: Story = {
  args: { current: false },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};
