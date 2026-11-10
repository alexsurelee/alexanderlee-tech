import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublishedPost, type PublishedBlogPost } from './post';

export type PublishedPost = CollectionEntry<'blog'> & { data: PublishedBlogPost };

// RSS and production pages always use this publication boundary.
export async function getPublishedPosts(): Promise<PublishedPost[]> {
  return (await getCollection('blog')).filter(isPublishedPost).sort(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );
}

// Only the development server includes drafts in pages and listings.
export async function getVisiblePosts(): Promise<CollectionEntry<'blog'>[]> {
  if (!import.meta.env.DEV) return getPublishedPosts();
  return (await getCollection('blog')).sort(
    (a, b) => (b.data.publishedDate ?? b.data.createdDate).valueOf()
      - (a.data.publishedDate ?? a.data.createdDate).valueOf(),
  );
}
