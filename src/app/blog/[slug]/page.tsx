import { notFound } from "next/navigation";
import { BaseLayout } from "@/app/components/base-layout/base-layout";
import { Title } from "@/app/components/text/title";
import { formatPostDate, getPost, posts } from "@/app/lib/posts";
import styles from "./post.module.css";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <BaseLayout>
      <article className={styles.post}>
        <Title>{post.title}</Title>
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
        <p>{post.summary}</p>
      </article>
    </BaseLayout>
  );
}
