import type { UserEvent } from "@testing-library/user-event";

/** Mirrors TanStack Hotkeys `detectPlatform()` for jsdom (darwin → linux/Control). */
function usesMetaMod(): boolean {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();
  return platform.includes("mac") || userAgent.includes("mac");
}

/** Presses the cross-platform Mod+K chord TanStack registers as `Mod+K`. */
export async function pressModK(user: UserEvent) {
  if (usesMetaMod()) {
    await user.keyboard("{Meta>}k{/Meta}");
    return;
  }
  await user.keyboard("{Control>}k{/Control}");
}
