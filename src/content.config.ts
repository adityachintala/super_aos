import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    minutes: z.number(),
    prerequisites: z.array(z.string()).default([]),
    objectives: z.array(z.string()).default([]),
  }),
});

// The short "Summary" of each lesson, kept in its own file so that it can be shown both at the
// end of the lesson and on the revision notes page. The file name is the lesson id.
const summaries = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/summaries' }),
  schema: z.object({}),
});

export const collections = { lessons, summaries };
