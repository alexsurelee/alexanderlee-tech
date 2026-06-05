import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useRef, useState } from "react";
import { CommandPalette } from "./command-palette";

type HarnessProps = {
  initiallyOpen?: boolean;
};

function CommandPaletteHarness({ initiallyOpen = false }: HarnessProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
        Open palette
      </button>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        returnFocusRef={triggerRef}
      />
    </>
  );
}

const meta = {
  title: "Components/CommandPalette",
  component: CommandPaletteHarness,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    initiallyOpen: { control: "boolean" },
  },
} satisfies Meta<typeof CommandPaletteHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: { initiallyOpen: false },
};

export const Open: Story = {
  args: { initiallyOpen: true },
  parameters: {
    chromatic: { delay: 300 },
  },
};

export const Filtered: Story = {
  args: { initiallyOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByRole("combobox", {
      name: "Search pages and blog posts",
    });

    await userEvent.clear(input);
    await userEvent.type(input, "react");

    await waitFor(() => {
      expect(canvas.getByText("Blog posts")).toBeInTheDocument();
      expect(
        canvas.getByRole("option", {
          name: /Building a Typewriter Effect in React/i,
        }),
      ).toBeInTheDocument();
    });
  },
};

export const Empty: Story = {
  args: { initiallyOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByRole("combobox", {
      name: "Search pages and blog posts",
    });

    await userEvent.clear(input);
    await userEvent.type(input, "quantum-flux-no-match");

    await waitFor(() => {
      expect(
        canvas.getByText('No results for “quantum-flux-no-match”.'),
      ).toBeInTheDocument();
    });
  },
};

export const MobileOpen: Story = {
  args: { initiallyOpen: true },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    chromatic: { delay: 300 },
  },
};

export const Playground: Story = {
  args: { initiallyOpen: false },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};
