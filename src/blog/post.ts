import { z } from 'astro/zod';

// Reject absent/null dates rather than coercing them to an epoch timestamp.
const date = z.union([z.string().min(1), z.date()]).pipe(z.coerce.date());
const fields = {
  title: z.string(),
  description: z.string(),
  createdDate: date,
  updatedDate: date.optional(),
};

export const blogPostSchema = z.discriminatedUnion('status', [
  z.object({
    ...fields,
    status: z.literal('draft'),
    publishedDate: z.never().optional(),
  }),
  z.object({
    ...fields,
    status: z.literal('published'),
    publishedDate: date,
  }),
]).superRefine((post, context) => {
  if (post.status === 'published' && post.publishedDate < post.createdDate) {
    context.addIssue({
      code: 'custom', path: ['publishedDate'],
      message: 'Publication cannot precede creation.',
    });
  }
  const latest = post.status === 'published' ? post.publishedDate : post.createdDate;
  if (post.updatedDate && post.updatedDate < latest) {
    context.addIssue({
      code: 'custom', path: ['updatedDate'],
      message: 'An update cannot precede creation or publication.',
    });
  }
});

export type BlogPost = z.infer<typeof blogPostSchema>;
export type DraftBlogPost = Extract<BlogPost, { status: 'draft' }>;
export type PublishedBlogPost = Extract<BlogPost, { status: 'published' }>;

export function isPublishedPost<T extends { data: BlogPost }>(
  post: T,
): post is T & { data: PublishedBlogPost } {
  return post.data.status === 'published';
}
