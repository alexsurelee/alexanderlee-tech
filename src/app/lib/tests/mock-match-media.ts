import { vi } from "vitest";
import { NAV_WIDE_QUERY } from "@/app/lib/nav-breakpoint";

export function mockMatchMedia(wide: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === NAV_WIDE_QUERY ? wide : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
