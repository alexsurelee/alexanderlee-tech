import type { Meta, StoryObj } from "@storybook/nextjs-vite";
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
  render: () => (
    <BaseLayout>
      <h1>Page title</h1>
      <p>A short paragraph of sample content inside the main column.</p>
    </BaseLayout>
  ),
};

export const LongPage: Story = {
  render: () => (
    <BaseLayout>
      <h1>Long page</h1>
      {Array.from({ length: 8 }, (_, index) => (
        <section key={index}>
          <h2>Section {index + 1}</h2>
          <p>
            Enough copy to exercise vertical scroll and gutter layout across
            multiple sections.
          </p>
        </section>
      ))}
    </BaseLayout>
  ),
};
