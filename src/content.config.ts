import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const diaries = defineCollection({
  // ★パスに "src/" を追加する
  loader: glob({ pattern: '**/*.md', base: './src/content/diaries' }),
  schema: z.object({
    title: z.string(),
    date: z.string(), // または z.date()
  }),
});

export const collections = { diaries };