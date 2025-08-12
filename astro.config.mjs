// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()]
  });