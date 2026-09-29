import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { iconNames } from "./icons";

// A "What's included" card as phones show it: its place in the list (from 1), its
// height there, and optionally another label.
const phoneCard = z.object({
  card: z.number().int().min(1),
  size: z.enum(["short", "tall"]),
  label: z.string().optional(),
});

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
    security: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      subtext: z.string(),
      tabs: z
        .array(
          z.object({
            label: z.string(),
            image: z.string().optional(),
            imageAlt: z.string().default(""),
            // Where the picture sits in the 1512px design frame, in px.
            imagePlacement: z
              .object({ left: z.number(), top: z.number(), width: z.number() })
              .optional(),
            features: z
              .array(
                z.object({
                  icon: z.enum(iconNames),
                  title: z.string(),
                  description: z.string(),
                  // The picture to show while this feature is in focus.
                  image: z.string().optional(),
                }),
              )
              .min(1),
          }),
        )
        .min(1),
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
      // Which cards phones show, in two columns, and how tall each is there.
      phone: z.object({ left: z.array(phoneCard), right: z.array(phoneCard) }).optional(),
    }),
    details: z.object({
      headline: z.string(),
      subtext: z.string(),
      groups: z.array(
        z.object({
          title: z.string(),
          icon: z.enum(iconNames),
          items: z.array(z.string()),
        }),
      ),
    }),
  }),
});

export const collections = { suites };
