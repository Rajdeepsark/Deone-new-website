import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { iconNames } from "./icons";

// A "What's included" card as phones show it: its place in the list (from 1), its
// height there, and optionally another label. `full` takes the height its column has
// left over beside a taller one.
const phoneCard = z.object({
  card: z.number().int().min(1),
  size: z.enum(["short", "tall", "full"]),
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
        // The security section's own pieces. `tab` is the tab in view; without it the
        // accent is used. `box` is the feature boxes and `boxLine` the line around the
        // box in focus (any CSS colour, e.g. transparent for none); without it the line is
        // the accent at 40%. `icon` is the feature icons' background, any CSS background;
        // without it they fade from the accent, as on Prestige. `iconInk` is the colour of
        // the drawing on them; without it that is the pale sand.
        security: section
          .extend({
            tab: hex.optional(),
            box: hex.optional(),
            boxLine: z.string().optional(),
            icon: z.string().optional(),
            iconInk: hex.optional(),
          })
          .optional(),
        // Phones show this section on a background of its own; without `backgroundPhone`
        // they use `background` too.
        included: section.extend({ backgroundPhone: z.string().optional() }).optional(),
        details: section.optional(),
        accent: hex.optional(), // slider marker and, unless set under security, its tab, box line and icons
        night: hex.optional(), // hero, quote and closing banner backdrops
      })
      .default({}),
    hero: z.object({
      eyebrow: z.string().default("Suite"),
      body: z.string().optional(),
      image: z.string(),
      imageAlt: z.string(),
      // Which part of the picture phones keep in view, as a CSS background-position.
      // Wide screens show the picture's full width.
      imagePosition: z.string().default("29.6% center"),
      // Any CSS background laid over the picture, such as the scrim and tint the design
      // file gives. Leave it out for a picture that needs none.
      overlay: z.string().optional(),
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
      // Which top corner of the last picture is rounded on wide screens. The first
      // picture's is the right one and the middle picture has both; `left` makes the last
      // mirror the first.
      lastCorner: z.enum(["left", "right"]).default("right"),
      items: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          image: z.string().optional(),
          imageAlt: z.string(),
          // Where "Learn more" goes. Without it the item has no link.
          href: z.string().optional(),
        }),
      ),
    }),
    quote: z.object({
      text: z.string(),
      image: z.string().optional(),
      imageAlt: z.string().default(""),
      // Which part of the picture phones keep in view, as a CSS object-position.
      // Wide screens show the picture's middle.
      imagePosition: z.string().default("34% top"),
    }),
    security: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      subtext: z.string(),
      tabs: z
        .array(
          z.object({
            label: z.string(),
            // The heading shown above the tabs while this one is chosen. Without them
            // the section's own headline and subtext stay.
            headline: z.string().optional(),
            subtext: z.string().optional(),
            image: z.string().optional(),
            imageAlt: z.string().default(""),
            // Where the picture sits in the 1512px design frame, in px.
            imagePlacement: z
              .object({ left: z.number(), top: z.number(), width: z.number() })
              .optional(),
            // The picture in motion, such as the card turning once around: `frames`
            // pictures in `folder`, named 000.webp, 001.webp and so on, which
            // scripts/import-sequence.mjs makes from a render. The page scrolls through
            // them. The first one is the picture until then, in place of `image`.
            sequence: z
              .object({ folder: z.string(), frames: z.number().int().min(2) })
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
          // A `full` card is a column to itself, as tall as the columns beside it.
          size: z.enum(["square", "tall", "full"]),
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
