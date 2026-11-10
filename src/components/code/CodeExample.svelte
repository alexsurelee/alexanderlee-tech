<script lang="ts">
  import { onMount } from "svelte";
  import type { CodeExampleProps, HighlightedSnippet } from "../../code/types";
  import { selectLanguage } from "../../code/language";
  import { preferredLanguage } from "../../code/preference";

  let props: CodeExampleProps = $props();
  const blocks = $derived(
    props.kind === "standalone" ? [props.snippet] : props.snippets,
  );
  let ready = $state(false);
  let fileIndex = $state(0);
  const selected = $derived(
    props.kind === "language" && ready
      ? selectLanguage(
          blocks.map((block) => block.language),
          $preferredLanguage,
          props.defaultLanguage,
        )
      : fileIndex,
  );
  let root: HTMLDivElement;
  let height = $state(0);
  type CopyState = {
    outcome: "idle" | "copied" | "failed";
    attempt: number;
    timer?: ReturnType<typeof setTimeout>;
  };
  let copies = $state<Record<number, CopyState>>({});
  const copyFeedback = {
    idle: { label: "Copy", message: "" },
    copied: { label: "Copied", message: "Copied to clipboard" },
    failed: {
      label: "Retry",
      message: "Copy failed. Select the code and copy it manually, or retry.",
    },
  };
  let alive = false;

  function measure() {
    if (alive && props.kind !== "standalone")
      height = Math.max(height, root.getBoundingClientRect().height);
  }
  $effect(() => {
    if (!ready) return;
    selected; // Measure after Svelte renders each newly selected panel.
    measure();
  });
  onMount(() => {
    alive = true;
    ready = true;
    const resize =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    resize?.observe(root);
    return () => {
      alive = false;
      resize?.disconnect();
      Object.values(copies).forEach((copy) => clearTimeout(copy.timer));
    };
  });
  function choose(index: number) {
    if (props.kind === "language") preferredLanguage.set(blocks[index].language);
    else fileIndex = index;
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
    copies[index] ??= { outcome: "idle", attempt: 0 };
    const state = copies[index];
    const attempt = ++state.attempt;
    clearTimeout(state.timer);
    let outcome: CopyState["outcome"] = "copied";
    try {
      await navigator.clipboard.writeText(block.copy);
    } catch {
      outcome = "failed";
    }
    if (!alive || state.attempt !== attempt) return;
    state.outcome = outcome;
    state.timer = setTimeout(() => {
      state.outcome = "idle";
      state.timer = undefined;
    }, 3000);
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
  {@const feedback = copyFeedback[copies[index]?.outcome ?? "idle"]}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (The role becomes tabpanel with the focusable state after mounting.) -->
  <section class="code-block" data-code-block data-language={block.language} data-title={block.title} id={`${props.id}-panel-${index}`} role={ready && props.kind !== 'standalone' ? 'tabpanel' : undefined} tabindex={ready && props.kind !== 'standalone' ? 0 : undefined} aria-labelledby={ready && props.kind !== 'standalone' ? `${props.id}-tab-${index}` : undefined} hidden={ready && props.kind !== 'standalone' && selected !== index}>
   <div class="code-toolbar"><span class="code-title">{block.title}</span><button type="button" data-code-copy hidden={!ready} onclick={() => copy(block, index)}>{feedback.label}</button><span class="sr-only" role="status" data-copy-status>{feedback.message}</span></div>
   <pre><code>{#each block.lines as line, lineIndex}<span class={`code-line ${line.kind}${line.highlighted ? ' highlighted' : ''}`} style={`--indent:${line.indent}ch`}><span class="code-marker" aria-hidden="true">{line.kind === 'added' ? '+' : line.kind === 'removed' ? '−' : ' '}</span>{#if line.kind !== 'context'}<span class="sr-only">{line.kind}: </span>{/if}{#each line.tokens as token}<span style={token.style}>{token.content}</span>{/each}{lineIndex < block.lines.length - 1 ? '\n' : ''}</span>{/each}</code></pre>
  </section>
 {/each}
</div>
