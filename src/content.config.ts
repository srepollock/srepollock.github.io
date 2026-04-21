// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const work = defineCollection({
    loader: glob({ pattern: "**/*.mdx", base: "./src/content/work" }),
    schema: z.object({
        title: z.string(),
        company: z.string(),
        role: z.string(),
        dates: z.string(),
        summary: z.string(),
        stack: z.array(z.string()),
        outcome: z.array(z.string()),
        order: z.number().default(99),
        draft: z.boolean().default(false),
    }),
});

export const collections = { work };
