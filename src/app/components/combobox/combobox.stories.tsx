import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { useState } from "react";
import { Combobox, type ComboboxOption } from "./index";

type Fruit = { name: string };

const FRUITS = ["apple", "apricot", "banana", "cherry"];

function optionsFor(query: string): ComboboxOption<Fruit>[] {
  const normalized = query.trim().toLowerCase();
  return FRUITS.filter((name) =>
    normalized === "" ? true : name.includes(normalized),
  ).map((name) => ({ id: name, value: { name } }));
}

type HarnessProps = {
  label?: string;
  placeholder?: string;
  query?: string;
};

function ComboboxHarness({
  label = "Search fruit",
  placeholder,
  query: initialQuery = "",
}: HarnessProps) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <Combobox<Fruit>
      label={label}
      placeholder={placeholder}
      query={query}
      onQueryChange={setQuery}
      options={optionsFor(query)}
      onSelect={fn()}
      onSubmit={fn()}
      onClose={fn()}
      emptyState={<>No fruit found</>}
      renderOption={(fruit) => <span>{fruit.name}</span>}
      autoFocus
    />
  );
}

const meta = {
  title: "Components/Combobox",
  component: ComboboxHarness,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    query: { control: "text" },
    label: { control: "text" },
    placeholder: { control: "text" },
  },
} satisfies Meta<typeof ComboboxHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { query: "" },
};

export const Filtered: Story = {
  args: { query: "ap" },
};

export const Empty: Story = {
  args: { query: "zzz" },
};

export const Interactive: Story = {
  args: {
    label: "Search fruit",
    placeholder: "Type to filter…",
    query: "",
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};
