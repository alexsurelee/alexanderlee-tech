import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublishedPost, type PublishedBlogPost } from './post';

export type PublishedPost = CollectionEntry<'blog'> & { data: PublishedBlogPost };

// All public consumers share this publication boundary, including in development.
export async function getPublishedPosts(): Promise<PublishedPost[]> {
  return (await getCollection('blog')).filter(isPublishedPost).sort(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );
}
