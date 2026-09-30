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

// A CSS hex colour, e.g. #f3e4da.
const hex = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "a hex colour like #f3e4da");

// One section of a suite page: any CSS `background` (a colour, or gradients straight from
// the design file) and `ink`, the colour of its words and lines.
const section = z.object({ background: z.string().optional(), ink: hex.optional() });

const suites = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/suites" }),
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    // The suite's colours, section by section. Anything left out keeps the Prestige look,
    // whose values are in src/styles/global.css (the --suite-* variables).
    theme: z
      .object({
        pictures: section.optional(),
        benefits: section.optional(),
        security: section.optional(),
        // Phones show this section on a background of its own; without `backgroundPhone`
        // they use `background` too.
        included: section.extend({ backgroundPhone: z.string().optional() }).optional(),
        details: section.optional(),
        accent: hex.optional(), // active tab, slider marker, feature icons
        night: hex.optional(), // hero, quote and closing banner backdrops
      })
      .default({}),
    hero: z.object({
      eyebrow: z.string().default("Suite"),
      image: z.string(),
      imageAlt: z.string(),
      // Which part of the picture phones keep in view, as a CSS background-position.
      // Wide screens show the picture's full width.
      imagePosition: z.string().default("29.6% center"),
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
    // The closing banner that leads on to another suite.
    next: z
      .object({
        eyebrow: z.string().default("Suite"),
        name: z.string(),
        ctaLabel: z.string().default("Discover"),
        href: z.string().default("#"),
        image: z.string().optional(),
        imageAlt: z.string().default(""),
        // The wall colour phones fade the picture into at the top.
        color: hex.default("#3a2d22"),
      })
      .optional(),
  }),
});

export const collections = { suites };
