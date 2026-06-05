import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useOpenIntent } from "../use-open-intent";

const DELAY = 120;

describe("useOpenIntent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens after the delay on sustained hover", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() => useOpenIntent({ delay: DELAY, onOpen }));

    act(() => result.current.handlers.onPointerEnter());

    act(() => vi.advanceTimersByTime(DELAY - 1));
    expect(onOpen).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("cancels when the pointer leaves before the delay", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() => useOpenIntent({ delay: DELAY, onOpen }));

    act(() => result.current.handlers.onPointerEnter());
    act(() => vi.advanceTimersByTime(DELAY - 10));
    act(() => result.current.handlers.onPointerLeave());
    act(() => vi.advanceTimersByTime(DELAY));

    expect(onOpen).not.toHaveBeenCalled();
  });

  it("opens after the delay on sustained focus", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() => useOpenIntent({ delay: DELAY, onOpen }));

    act(() => result.current.handlers.onFocus());
    act(() => vi.advanceTimersByTime(DELAY));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("cancels when focus is lost before the delay", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() => useOpenIntent({ delay: DELAY, onOpen }));

    act(() => result.current.handlers.onFocus());
    act(() => vi.advanceTimersByTime(DELAY - 10));
    act(() => result.current.handlers.onBlur());
    act(() => vi.advanceTimersByTime(DELAY));

    expect(onOpen).not.toHaveBeenCalled();
  });

  it("cancels imperatively via the returned cancel", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() => useOpenIntent({ delay: DELAY, onOpen }));

    act(() => result.current.handlers.onPointerEnter());
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(DELAY));

    expect(onOpen).not.toHaveBeenCalled();
  });
});
