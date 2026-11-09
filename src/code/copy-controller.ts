export function enhanceCopyButton(
  block: HTMLElement,
  copy: (value: string) => Promise<void>,
  window: Window & typeof globalThis,
) {
  const button = block.querySelector<HTMLButtonElement>("[data-code-copy]");
  const status = block.querySelector<HTMLElement>("[data-copy-status]");
  const source = block.dataset.codeSource;
  if (!button || !status || source === undefined) return;
  let reset: number | undefined;
  button.hidden = false;
  button.addEventListener("click", async () => {
    window.clearTimeout(reset);
    try {
      await copy(decodeURIComponent(source));
      button.textContent = "Copied";
      status.textContent = "Copied to clipboard";
    } catch {
      button.textContent = "Retry";
      status.textContent =
        "Copy failed. Select the code and copy it manually, or retry.";
    }
    reset = window.setTimeout(() => {
      button.textContent = "Copy";
      status.textContent = "";
    }, 3000);
  });
  block.dataset.copyReady = "";
}
