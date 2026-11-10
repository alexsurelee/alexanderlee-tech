import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { blogPostSchema } from './blog/post';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => blogPostSchema.and(z.object({
    heroImage: image().optional(),
  })),
});

export const collections = { blog };
