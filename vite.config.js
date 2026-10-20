import { stampPlugin } from './scripts/stamp.mjs';

const page = (p) => new URL(p, import.meta.url).pathname;

export default {
  base: '/portfolio/',
  plugins: [stampPlugin()],
  build: { rollupOptions: { input: { index: page('./index.html'), gallery: page('./gallery/index.html') } } },
};
