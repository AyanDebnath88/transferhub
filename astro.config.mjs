import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
export default defineConfig({
  site: 'https://transferhub.club',
  integrations: [tailwind()],
  output: 'static',
});
