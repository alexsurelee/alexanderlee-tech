"use client";

import { useCallback, useId, useState } from "react";

export type ComboboxOption<T> = {
  /** Stable, unique key used for both React keys and the ARIA option id. */
  id: string;
  value: T;
};

type UseComboboxParams<T> = {
  query: string;
  onQueryChange: (query: string) => void;
  options: ComboboxOption<T>[];
  onSelect: (option: ComboboxOption<T>) => void;
  /** Fires on Enter when no option is active (e.g. submit to a results page). */
  onSubmit?: (query: string) => void;
  /** Fires on Escape so the host can close and restore focus. */
  onClose?: () => void;
};

type InputProps = {
  role: "combobox";
  "aria-expanded": true;
  "aria-controls": string;
  "aria-autocomplete": "list";
  "aria-activedescendant": string | undefined;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

type ListboxProps = {
  role: "listbox";
  id: string;
};

type OptionProps = {
  id: string;
  role: "option";
  "aria-selected": boolean;
  onPointerMove: () => void;
  onMouseDown: (event: React.MouseEvent) => void;
  onClick: () => void;
};

type UseCombobox = {
  activeIndex: number;
  getInputProps: () => InputProps;
  getListboxProps: () => ListboxProps;
  getOptionProps: (index: number) => OptionProps;
};

const NO_ACTIVE_OPTION = -1;

/** Maps a navigation key to the next active index, wrapping at the ends. */
function nextActiveIndex(
  key: string,
  current: number,
  lastIndex: number,
): number | null {
  switch (key) {
    case "ArrowDown":
      return current >= lastIndex ? 0 : current + 1;
    case "ArrowUp":
      return current <= 0 ? lastIndex : current - 1;
    case "Home":
      return 0;
    case "End":
      return lastIndex;
    default:
      return null;
  }
}

/**
 * Headless combobox behavior: active-option tracking, the full keyboard model
 * (Up/Down, Home/End, Enter, Escape, type-to-filter), and ARIA combobox/listbox
 * wiring via prop getters. Routing- and data-agnostic; the host supplies the
 * already-filtered `options` and handles selection/submission.
 */
export function useCombobox<T>({
  query,
  onQueryChange,
  options,
  onSelect,
  onSubmit,
  onClose,
}: UseComboboxParams<T>): UseCombobox {
  const listboxId = useId();
  const optionIdPrefix = useId();
  const [activeIndex, setActiveIndex] = useState(NO_ACTIVE_OPTION);

  const optionDomId = useCallback(
    (index: number) => `${optionIdPrefix}-option-${index}`,
    [optionIdPrefix],
  );

  const lastIndex = options.length - 1;
  const clampedActive =
    activeIndex > lastIndex ? NO_ACTIVE_OPTION : activeIndex;

  const handleEnter = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const active = options[clampedActive];
      if (active) {
        event.preventDefault();
        onSelect(active);
      } else {
        onSubmit?.(query);
      }
    },
    [clampedActive, onSelect, onSubmit, options, query],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key === "Enter") {
        handleEnter(event);
        return;
      }
      if (options.length === 0) return;
      const next = nextActiveIndex(event.key, clampedActive, lastIndex);
      if (next === null) return;
      event.preventDefault();
      setActiveIndex(next);
    },
    [clampedActive, handleEnter, lastIndex, onClose, options.length],
  );

  // Reset the highlight here (not in an effect) so a fresh result set starts
  // with no active option and Enter submits until the user arrows in.
  const handleQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setActiveIndex(NO_ACTIVE_OPTION);
      onQueryChange(event.target.value);
    },
    [onQueryChange],
  );

  const getInputProps = useCallback(
    (): InputProps => ({
      role: "combobox",
      "aria-expanded": true,
      "aria-controls": listboxId,
      "aria-autocomplete": "list",
      "aria-activedescendant":
        clampedActive >= 0 ? optionDomId(clampedActive) : undefined,
      value: query,
      onChange: handleQueryChange,
      onKeyDown: handleKeyDown,
    }),
    [clampedActive, handleKeyDown, handleQueryChange, listboxId, optionDomId, query],
  );

  const getListboxProps = useCallback(
    (): ListboxProps => ({ role: "listbox", id: listboxId }),
    [listboxId],
  );

  const getOptionProps = useCallback(
    (index: number): OptionProps => ({
      id: optionDomId(index),
      role: "option",
      "aria-selected": index === clampedActive,
      onPointerMove: () => setActiveIndex(index),
      // Keep focus on the input so selecting an option doesn't blur it (which
      // would let a host close-on-blur fire before the click registers).
      onMouseDown: (event) => event.preventDefault(),
      onClick: () => {
        const option = options[index];
        if (option) onSelect(option);
      },
    }),
    [clampedActive, onSelect, optionDomId, options],
  );

  return { activeIndex: clampedActive, getInputProps, getListboxProps, getOptionProps };
}
