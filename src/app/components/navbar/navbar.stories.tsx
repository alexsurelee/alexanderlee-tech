import type { Meta, StoryObj } from "@storybook/nextjs-vite";
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
        <div key={pathname}>
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
