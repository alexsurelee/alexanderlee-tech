import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { Combobox, type ComboboxOption } from "../index";

type Fruit = { name: string };

const FRUITS = ["apple", "apricot", "banana", "cherry"];

function optionsFor(query: string): ComboboxOption<Fruit>[] {
  const normalized = query.trim().toLowerCase();
  return FRUITS.filter((name) =>
    normalized === "" ? true : name.includes(normalized),
  ).map((name) => ({ id: name, value: { name } }));
}

function Harness({
  onSelect = () => {},
  onSubmit = () => {},
  onClose = () => {},
}: {
  onSelect?: (option: ComboboxOption<Fruit>) => void;
  onSubmit?: (query: string) => void;
  onClose?: () => void;
}) {
  const [query, setQuery] = useState("");
  return (
    <Combobox<Fruit>
      label="Search fruit"
      query={query}
      onQueryChange={setQuery}
      options={optionsFor(query)}
      onSelect={onSelect}
      onSubmit={onSubmit}
      onClose={onClose}
      emptyState={<>No fruit found</>}
      renderOption={(fruit) => <span>{fruit.name}</span>}
      autoFocus
    />
  );
}

describe("Combobox", () => {
  afterEach(() => {
    cleanup();
  });

  it("exposes combobox and listbox semantics", () => {
    render(<Harness />);

    const input = screen.getByRole("combobox", { name: "Search fruit" });
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute(
      "aria-controls",
      screen.getByRole("listbox").id,
    );
  });

  it("renders every option for an empty query", () => {
    render(<Harness />);

    expect(screen.getAllByRole("option")).toHaveLength(FRUITS.length);
  });

  it("filters options as the user types", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole("combobox"), "ap");

    const labels = screen.getAllByRole("option").map((o) => o.textContent);
    expect(labels).toEqual(["apple", "apricot"]);
  });

  it("renders the empty state for a no-match query", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole("combobox"), "zzz");

    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No fruit found")).toBeInTheDocument();
  });

  it("moves the active option with arrow keys and exposes it via aria", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const input = screen.getByRole("combobox");
    expect(input).not.toHaveAttribute("aria-activedescendant");

    await user.keyboard("{ArrowDown}");
    const firstOption = screen.getAllByRole("option")[0];
    expect(input).toHaveAttribute("aria-activedescendant", firstOption.id);
    expect(firstOption).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowDown}");
    const secondOption = screen.getAllByRole("option")[1];
    expect(input).toHaveAttribute("aria-activedescendant", secondOption.id);
  });

  it("jumps to first and last with Home/End", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const input = screen.getByRole("combobox");
    const options = screen.getAllByRole("option");

    await user.keyboard("{End}");
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      options[options.length - 1].id,
    );

    await user.keyboard("{Home}");
    expect(input).toHaveAttribute("aria-activedescendant", options[0].id);
  });

  it("selects the active option on Enter", async () => {
    const onSelect = vi.fn();
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Harness onSelect={onSelect} onSubmit={onSubmit} />);

    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].value).toEqual({ name: "apple" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the query on Enter when no option is active", async () => {
    const onSelect = vi.fn();
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Harness onSelect={onSelect} onSubmit={onSubmit} />);

    await user.type(screen.getByRole("combobox"), "ban");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("ban");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("prevents the default mousedown so pressing an option keeps input focus", () => {
    render(<Harness />);

    const option = screen.getAllByRole("option")[0];
    const event = createEvent.mouseDown(option);
    fireEvent(option, event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("selects an option on click", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Harness onSelect={onSelect} />);

    await user.click(screen.getByText("cherry"));

    expect(onSelect.mock.calls[0][0].value).toEqual({ name: "cherry" });
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Harness onClose={onClose} />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("announces the result count politely", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(`${FRUITS.length} results`);

    await user.type(screen.getByRole("combobox"), "ap");
    expect(status).toHaveTextContent("2 results");
  });
});
