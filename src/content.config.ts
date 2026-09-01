import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// for blog posts
const blog = defineCollection({
    loader: glob({
        base: "./src/content/blog",
        pattern: "**/*.{md,mdx}",
    }),

    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
    }),
});

// for project cards and their content
const projects = defineCollection({
    loader: glob({
        base: "./src/content/projects",
        pattern: "**/*.{md,mdx}",
    }),

    schema: z.object({
        title: z.string(),
        description: z.string(),
        technologies: z.array(z.string()).default([]),

        status: z.enum(["Ongoing", "Completed", "Paused", "Archived", "Deprecated"]),
        type: z.string(),

        featured: z.boolean().default(false),
        order: z.number(),

        repoUrl: z.string().url().optional(),
        demoUrl: z.string().url().optional(),
        writeupUrl: z.string().optional(),

        startDate: z.string().regex(/^\d{4}-\d{2}$/).optional(),
        endDate: z.string().regex(/^\d{4}-\d{2}$/).optional(),

    }),
});

export const collections = { blog, projects };