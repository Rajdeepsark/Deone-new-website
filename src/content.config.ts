import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const suites = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/suites" }),
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    hero: z.object({
      eyebrow: z.string().default("Suite"),
      image: z.string(),
      imageAlt: z.string(),
    }),
    pictures: z.object({
      headline: z.string(),
      subtext: z.string(),
      gallery: z
        .array(
          z.object({
            image: z.string(),
            alt: z.string().default(""),
          }),
        )
        .length(4),
      slides: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
            image: z.string(),
            imageAlt: z.string(),
          }),
        )
        .min(1),
    }),
    benefits: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      items: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          image: z.string().optional(),
          imageAlt: z.string(),
          href: z.string().default("#"),
        }),
      ),
    }),
    quote: z.object({
      text: z.string(),
      image: z.string().optional(),
      imageAlt: z.string().default(""),
    }),
    included: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      subtext: z.string(),
      items: z.array(
        z.object({
          label: z.string().optional(),
          size: z.enum(["square", "tall"]),
          image: z.string().optional(),
          imageAlt: z.string(),
        }),
      ),
    }),
    details: z.object({
      headline: z.string(),
      subtext: z.string(),
      groups: z.array(
        z.object({
          title: z.string(),
          icon: z.enum(["card", "coin", "connect", "travel", "wellness", "diamond"]),
          items: z.array(z.string()),
        }),
      ),
    }),
  }),
});

export const collections = { suites };
