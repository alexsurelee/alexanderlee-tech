"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { useCombobox, type ComboboxOption } from "./use-combobox";
import styles from "./combobox.module.css";

type ComboboxProps<T> = {
  /** Accessible label for the search input. */
  label: string;
  placeholder?: string;
  query: string;
  onQueryChange: (query: string) => void;
  options: ComboboxOption<T>[];
  onSelect: (option: ComboboxOption<T>) => void;
  onSubmit?: (query: string) => void;
  onClose?: () => void;
  renderOption: (value: T, state: { active: boolean }) => ReactNode;
  /** Shown in place of the listbox when there are no options. */
  emptyState?: ReactNode;
  autoFocus?: boolean;
  className?: string;
};

function resultCountLabel(count: number): string {
  if (count === 0) return "No results";
  return `${count} result${count === 1 ? "" : "s"}`;
}

export function Combobox<T>({
  label,
  placeholder,
  query,
  onQueryChange,
  options,
  onSelect,
  onSubmit,
  onClose,
  renderOption,
  emptyState,
  autoFocus = false,
  className,
}: ComboboxProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { activeIndex, getInputProps, getListboxProps, getOptionProps } =
    useCombobox<T>({ query, onQueryChange, options, onSelect, onSubmit, onClose });

  useEffect(() => {
    if (autoFocus) {
      // preventScroll avoids nudging the page when the panel opens, which would
      // otherwise slide the hover trigger out from under the pointer.
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [autoFocus]);

  const hasResults = options.length > 0;

  return (
    <div className={clsx(styles.combobox, className)}>
      <input
        {...getInputProps()}
        ref={inputRef}
        type="text"
        className={styles.input}
        aria-label={label}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
      />

      {hasResults ? (
        <ul {...getListboxProps()} className={styles.listbox}>
          {options.map((option, index) => {
            const active = index === activeIndex;
            return (
              <li
                key={option.id}
                {...getOptionProps(index)}
                className={clsx(styles.option, active && styles.optionActive)}
                data-active={active ? "" : undefined}
              >
                {renderOption(option.value, { active })}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.empty} role="presentation">
          {emptyState}
        </div>
      )}

      <div role="status" aria-live="polite" className={styles.srOnly}>
        {resultCountLabel(options.length)}
      </div>
    </div>
  );
}
