<script lang="ts">
  import { onMount, tick } from "svelte";
  import type { CodeExampleProps, HighlightedSnippet } from "../../code/types";
  import { selectLanguage } from "../../code/language";
  import { languagePreference } from "../../code/preference";
  let props: CodeExampleProps = $props();
  const blocks = $derived(
    props.kind === "standalone" ? [props.snippet] : props.snippets,
  );
  let ready = $state(false);
  let selected = $state(0);
  let root: HTMLDivElement;
  let height = $state(0);
  let messages = $state<Record<number, string>>({});
  let labels = $state<Record<number, string>>({});
  const attempts = new Map<number, number>();
  const timers = new Map<number, ReturnType<typeof setTimeout>>();
  let alive = false;
  let preference: ReturnType<typeof languagePreference>;
  async function measure() {
    await tick();
    if (alive && props.kind !== "standalone")
      height = Math.max(height, root.getBoundingClientRect().height);
  }
  function select(index: number) {
    selected = index;
    void measure();
  }
  onMount(() => {
    alive = true;
    let unsubscribe = () => {};
    if (props.kind === "language") {
      preference = languagePreference();
      const sync = (value?: string) =>
        select(
          selectLanguage(
            blocks.map((b) => b.language),
            value,
            props.kind === "language" ? props.defaultLanguage : undefined,
          ),
        );
      sync(preference.get());
      unsubscribe = preference.subscribe(sync);
    }
    ready = true;
    void measure();
    const resize =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(() => void measure());
    resize?.observe(root);
    return () => {
      alive = false;
      unsubscribe();
      resize?.disconnect();
      timers.forEach(clearTimeout);
      attempts.clear();
    };
  });
  function choose(index: number) {
    if (props.kind === "language") preference.set(blocks[index].language);
    else select(index);
  }
  function keydown(event: KeyboardEvent, index: number) {
    const positions: Record<string, number> = {
      ArrowRight: (index + 1) % blocks.length,
      ArrowLeft: (index + blocks.length - 1) % blocks.length,
      Home: 0,
      End: blocks.length - 1,
    };
    const next = positions[event.key];
    if (next === undefined) return;
    event.preventDefault();
    choose(next);
    const tab = root.querySelectorAll<HTMLButtonElement>("[role=tab]")[next];
    tab.focus();
    tab.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }
  async function copy(block: HighlightedSnippet, index: number) {
    const attempt = (attempts.get(index) ?? 0) + 1;
    attempts.set(index, attempt);
    clearTimeout(timers.get(index));
    let success = true;
    try {
      await navigator.clipboard.writeText(block.copy);
    } catch {
      success = false;
    }
    if (!alive || attempts.get(index) !== attempt) return;
    labels[index] = success ? "Copied" : "Retry";
    messages[index] = success
      ? "Copied to clipboard"
      : "Copy failed. Select the code and copy it manually, or retry.";
    timers.set(
      index,
      setTimeout(() => {
        labels[index] = "Copy";
        messages[index] = "";
      }, 3000),
    );
  }
</script>

<div bind:this={root} class:code-group={props.kind !== 'standalone'} data-code-example data-code-group={props.kind === 'standalone' ? undefined : props.kind} data-code-ready={ready && props.kind !== 'standalone' ? '' : undefined} style:min-height={height ? `${height}px` : undefined}>
 {#if props.kind !== 'standalone'}
  <div class="code-tabs" role="tablist" aria-label={props.label} hidden={!ready}>
   {#each blocks as block, index}
    <button type="button" role="tab" id={`${props.id}-tab-${index}`} aria-controls={`${props.id}-panel-${index}`} aria-selected={ready && selected === index} tabindex={ready && selected === index ? 0 : -1} onclick={() => choose(index)} onkeydown={event => keydown(event, index)}>{block.title}</button>
   {/each}
  </div>
 {/if}
 {#each blocks as block, index}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (The role becomes tabpanel with the focusable state after mounting.) -->
  <section class="code-block" data-code-block data-language={block.language} data-title={block.title} id={`${props.id}-panel-${index}`} role={ready && props.kind !== 'standalone' ? 'tabpanel' : undefined} tabindex={ready && props.kind !== 'standalone' ? 0 : undefined} aria-labelledby={ready && props.kind !== 'standalone' ? `${props.id}-tab-${index}` : undefined} hidden={ready && props.kind !== 'standalone' && selected !== index}>
   <div class="code-toolbar"><span class="code-title">{block.title}</span><button type="button" data-code-copy hidden={!ready} onclick={() => copy(block, index)}>{labels[index] ?? 'Copy'}</button><span class="sr-only" role="status" data-copy-status>{messages[index] ?? ''}</span></div>
   <pre><code>{#each block.lines as line, lineIndex}<span class={`code-line ${line.kind}${line.highlighted ? ' highlighted' : ''}`} style={`--indent:${line.indent}ch`}><span class="code-marker" aria-hidden="true">{line.kind === 'added' ? '+' : line.kind === 'removed' ? '−' : ' '}</span>{#if line.kind !== 'context'}<span class="sr-only">{line.kind}: </span>{/if}{#each line.tokens as token}<span style={token.style}>{token.content}</span>{/each}{lineIndex < block.lines.length - 1 ? '\n' : ''}</span>{/each}</code></pre>
  </section>
 {/each}
</div>
