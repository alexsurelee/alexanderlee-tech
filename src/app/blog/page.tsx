import { TransitionLink } from "@/app/components/transition-link";
import { BaseLayout } from "@/app/components/base-layout/base-layout";
import { formatPostDate, searchPosts } from "@/app/lib/posts";
import styles from "./blog.module.css";

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = firstParam(q);
  const trimmed = query.trim();
  const results = searchPosts(query);

  return (
    <BaseLayout>
      <h1>Blog</h1>
      {trimmed ? (
        <p className={styles.summary}>
          {results.length} result{results.length === 1 ? "" : "s"} for{" "}
          <span className={styles.query}>“{trimmed}”</span>
        </p>
      ) : null}

      {results.length === 0 ? (
        <p className={styles.empty} role="status">
          No posts match <span className={styles.query}>“{trimmed}”</span>. Try a
          different search.
        </p>
      ) : (
        <ul className={styles.list}>
          {results.map((post) => (
            <li key={post.slug} className={styles.item}>
              <TransitionLink
                href={`/blog/${post.slug}`}
                className={styles.postLink}
              >
                <h2 className={styles.title}>{post.title}</h2>
              </TransitionLink>
              <p>{post.summary}</p>
              <div className={styles.metaRow}>
                <span className="meta">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                </span>
                <ul className={styles.tags}>
                  {post.tags.map((tag) => (
                    <li key={tag} className="tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </BaseLayout>
  );
}
