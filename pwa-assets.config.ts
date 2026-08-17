import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// The preset pads maskable/apple icons with white; match the app background instead.
const background = '#0a0a0a';

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { fit: 'contain', background } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { fit: 'contain', background } },
  },
  images: ['public/icon.svg'],
});
