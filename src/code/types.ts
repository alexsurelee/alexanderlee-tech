export interface Snippet {
  source: string;
  language?: string;
  meta?: string;
}

export interface HighlightedLine {
  text: string;
  kind: "added" | "removed" | "context";
  highlighted: boolean;
  indent: number;
  tokens: { content: string; style: string }[];
}
export interface HighlightedSnippet {
  language: string;
  title: string;
  copy: string;
  lines: HighlightedLine[];
}
export type CodeExampleProps = { id: string } & (
  | {
      kind: "standalone";
      snippet: HighlightedSnippet;
      snippets?: never;
      label?: never;
      defaultLanguage?: never;
    }
  | {
      kind: "file";
      snippets: HighlightedSnippet[];
      label: string;
      snippet?: never;
      defaultLanguage?: never;
    }
  | {
      kind: "language";
      snippets: HighlightedSnippet[];
      label: string;
      defaultLanguage?: string;
      snippet?: never;
    }
);
