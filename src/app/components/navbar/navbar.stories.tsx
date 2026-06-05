import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Navbar } from "./navbar";

type NavbarStoryArgs = {
  pathname: string;
};

const meta = {
  title: "Components/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    pathname: {
      control: "select",
      options: ["/", "/blog", "/uses"],
    },
  },
  args: {
    pathname: "/",
  },
  decorators: [
    (Story, { args }) => {
      const { pathname } = args as NavbarStoryArgs;
      return (
        <div
          key={pathname}
          style={{ padding: "1.5rem clamp(1.25rem, 4vw, 2.5rem)" }}
        >
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  args: { pathname: "/" },
  parameters: {
    nextjs: { navigation: { pathname: "/" } },
  },
};

export const Blog: Story = {
  args: { pathname: "/blog" },
  parameters: {
    nextjs: { navigation: { pathname: "/blog" } },
  },
};

export const Uses: Story = {
  args: { pathname: "/uses" },
  parameters: {
    nextjs: { navigation: { pathname: "/uses" } },
  },
};

export const Mobile: Story = {
  args: { pathname: "/" },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    nextjs: { navigation: { pathname: "/" } },
  },
};

export const MobilePaletteOpen: Story = {
  args: { pathname: "/" },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    chromatic: { delay: 300 },
    nextjs: { navigation: { pathname: "/" } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Menu" }));

    await waitFor(() => {
      expect(
        canvas.getByRole("dialog", { name: "Command menu" }),
      ).toBeInTheDocument();
    });
  },
};

export const DesktopPaletteOpen: Story = {
  args: { pathname: "/" },
  parameters: {
    chromatic: { delay: 300 },
    nextjs: { navigation: { pathname: "/" } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.keyboard("{Meta>}k{/Meta}");

    await waitFor(() => {
      expect(
        canvas.getByRole("dialog", { name: "Command menu" }),
      ).toBeInTheDocument();
    });
  },
};

export const Playground: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  beforeEach: (context) => {
    const pathname = (context.args as NavbarStoryArgs).pathname;
    context.parameters.nextjs = {
      ...context.parameters.nextjs,
      appDirectory: true,
      navigation: { pathname },
    };
  },
};
