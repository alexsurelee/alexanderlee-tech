export type FootnoteId = string;
export interface Footnote { readonly id: FootnoteId; readonly number: number }
export interface FootnoteReference { readonly id: string; readonly noteId: FootnoteId }
export interface ArticleFootnotes {
 readonly notes: readonly Footnote[];
 readonly references: readonly FootnoteReference[];
}
export function selectVisibleFootnotes(article: ArticleFootnotes, visible: ReadonlySet<string>, permanentVisible: boolean): readonly Footnote[] {
 if (permanentVisible) return [];
 const ids = new Set(article.references.filter(ref => visible.has(ref.id)).map(ref => ref.noteId));
 return article.notes.filter(note => ids.has(note.id)).sort((a,b) => a.number - b.number);
}
