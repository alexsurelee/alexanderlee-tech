import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Title } from "@/app/components/text/title";
import { BaseLayout } from "./base-layout";

const meta = {
  title: "Components/BaseLayout",
  component: BaseLayout,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BaseLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Title>Page title</Title>
        <p>A short paragraph of sample content inside the main column.</p>
      </>
    ),
  },
};

export const WithSideSlots: Story = {
  args: {
    left: <p className="meta">Left sidebar</p>,
    right: <p className="meta">Right sidebar</p>,
    children: (
      <>
        <Title>Page title</Title>
        <p>Main column with side gutters and dividers.</p>
      </>
    ),
  },
};

export const LongPage: Story = {
  args: {
    children: (
      <>
        <Title>Long page</Title>
        {Array.from({ length: 8 }, (_, index) => (
          <section key={index}>
            <Title TagName="h2" size="h2">
              Section {index + 1}
            </Title>
            <p>
              Enough copy to exercise vertical scroll and gutter layout across
              multiple sections.
            </p>
          </section>
        ))}
      </>
    ),
  },
};
