// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE_URL } from "./src/consts.ts";
import { isNoindexRoute } from "./src/utils/seo.ts";

export default defineConfig({
  site: SITE_URL,
  // Brand fonts. Astro emits the @font-face rules, hashes the files, and
  // generates metric-matched fallbacks. The cssVariable of each family is
  // consumed by --primary-family / --secondary-family in src/styles/base.css.
  fonts: [
    {
      provider: fontProviders.local(),
      name: "General Sans",
      cssVariable: "--font-general-sans",
      fallbacks: ["sans-serif"],
      options: {
        variants: [
          {
            // Variable font: the wght axis runs 200–700.
            weight: "200 700",
            style: "normal",
            src: ["./src/assets/fonts/GeneralSans-Variable.woff2"],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Boska",
      cssVariable: "--font-boska",
      fallbacks: ["serif"],
      options: {
        variants: [
          {
            // Only the italic cut is part of the brand set.
            weight: 400,
            style: "italic",
            src: ["./src/assets/fonts/Boska-Italic.woff2"],
          },
        ],
      },
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => !isNoindexRoute(new URL(page).pathname),
    }),
  ],
});
