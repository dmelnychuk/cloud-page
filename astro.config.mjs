// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  vite: {
    define: {
      'import.meta.env.POSTMARK_API_KEY': JSON.stringify(process.env.POSTMARK_API_KEY),
    },
  },
  site: "https://www.denmelnychuk.com",
  integrations: [mdx(), sitemap()],
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    platformProxy: {
      enabled: true,
    },
  }),
});
