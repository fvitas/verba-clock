package com.verba.clock.widget;

import android.graphics.Bitmap;

/**
 * The procedural half of src/finishes/catalog.ts. Nine of the sixteen finishes are not gradients
 * at all — the web grows them from SVG feTurbulence mapped through a palette ramp, which is what
 * makes steel look brushed and rust look oxidised. Skia has no turbulence primitive, so the same
 * shape is generated here: fractal value noise through the identical piecewise-linear ramp.
 *
 * Frequencies are the catalog's own baseFrequency values — cycles per user unit on its 900-unit
 * tile. Every material's structure is low-frequency (3-8 cycles) and survives at widget size;
 * the grain and brushing layers are far finer than a widget pixel and land as soft noise instead
 * of crisp speckle. Octaves below a pixel are skipped, since they would only cost time.
 */
final class Textures {
    private static final float TILE = 900f;
    /** Bilinear value noise clusters tighter around its mean than Perlin does; widen to match. */
    private static final float CONTRAST = 1.3f;
    /** Turning each octave off-axis hides the lattice that bilinear noise would otherwise show. */
    private static final float OCTAVE_TURN = 31f;
    /**
     * Below a pixel per cycle the noise is sampled faster than it can be interpolated, so it
     * arrives as uniform randomness — already wider than Perlin, and it needs narrowing rather
     * than the widening interpolated noise wants. This is what keeps grain from turning to grit.
     */
    private static final float GRAIN_CONTRAST = 0.7f;

    /** One feTurbulence call: frequency per axis, octaves, seed, and the tile's rotation. */
    static final class Noise {
        private final float freqX;
        private final float freqY;
        private final int octaves;
        private final int seed;
        private final float rotate;
        private final boolean turbulence;

        Noise(float freqX, float freqY, int octaves, int seed, float rotate, boolean turbulence) {
            this.freqX = freqX;
            this.freqY = freqY;
            this.octaves = octaves;
            this.seed = seed;
            this.rotate = rotate;
            this.turbulence = turbulence;
        }
    }

    /** feColorMatrix + feComponentTransfer: one noise channel read through a colour ramp. */
    static Bitmap palette(int width, int height, Noise spec, int[] ramp) {
        float[] field = field(width, height, spec);
        int[] pixels = new int[field.length];
        for (int i = 0; i < field.length; i++) {
            pixels[i] = 0xFF000000 | ramp(ramp, field[i]);
        }
        return Bitmap.createBitmap(pixels, width, height, Bitmap.Config.ARGB_8888);
    }

    /** A flat colour whose alpha comes off the noise — the catalog's cloud and speck layers. */
    static Bitmap wash(int width, int height, Noise spec, int rgb, float[] alphas) {
        float[] field = field(width, height, spec);
        int[] pixels = new int[field.length];
        for (int i = 0; i < field.length; i++) {
            int alpha = Math.round(table(alphas, field[i]) * 255f);
            pixels[i] = (alpha << 24) | rgb;
        }
        return Bitmap.createBitmap(pixels, width, height, Bitmap.Config.ARGB_8888);
    }

    private Textures() {}

    private static float[] field(int width, int height, Noise spec) {
        float cyclesX = spec.freqX * TILE;
        float cyclesY = spec.freqY * TILE;
        int octaves = octaves(spec.octaves, Math.max(cyclesX, cyclesY), Math.max(width, height));
        double radians = Math.toRadians(spec.rotate);
        float cos = (float) Math.cos(radians);
        float sin = (float) Math.sin(radians);
        float contrast = Math.max(cyclesX, cyclesY) >= Math.max(width, height) / 2f
            ? GRAIN_CONTRAST
            : CONTRAST;
        // Streaked finishes must keep their direction, so only isotropic noise gets turned
        boolean turn = spec.freqX == spec.freqY;
        float[] turnCos = new float[octaves];
        float[] turnSin = new float[octaves];
        for (int octave = 0; octave < octaves; octave++) {
            double angle = Math.toRadians(turn ? OCTAVE_TURN * octave : 0);
            turnCos[octave] = (float) Math.cos(angle);
            turnSin[octave] = (float) Math.sin(angle);
        }

        float[] out = new float[width * height];
        float mean = 0;
        for (int y = 0; y < height; y++) {
            float v = (float) y / height;
            for (int x = 0; x < width; x++) {
                float u = (float) x / width;
                float sx = spec.rotate == 0 ? u : u * cos - v * sin;
                float sy = spec.rotate == 0 ? v : u * sin + v * cos;
                float sum = 0;
                float total = 0;
                float amplitude = 1;
                float step = 1;
                for (int octave = 0; octave < octaves; octave++) {
                    float ox = (sx * turnCos[octave] - sy * turnSin[octave]) * cyclesX * step;
                    float oy = (sx * turnSin[octave] + sy * turnCos[octave]) * cyclesY * step;
                    float n = noise(ox, oy, spec.seed + octave * 101);
                    sum += amplitude * (spec.turbulence ? Math.abs(2 * n - 1) : n);
                    total += amplitude;
                    amplitude *= 0.5f;
                    step *= 2;
                }
                float value = sum / total;
                out[y * width + x] = value;
                mean += value;
            }
        }

        // Stretch about the field's own mean, not about 0.5: folding for turbulence pulls the mean
        // well below centre, and stretching about centre would then drag the whole material dark
        mean /= out.length;
        for (int i = 0; i < out.length; i++) {
            out[i] = clamp(mean + (out[i] - mean) * contrast);
        }
        return out;
    }

    /** Octaves whose cycles fall below two pixels add nothing a widget can show. */
    private static int octaves(int wanted, float cycles, int side) {
        int limit = 1;
        while (limit < wanted && cycles * (1 << limit) < side / 2f) limit++;
        return limit;
    }

    private static float noise(float x, float y, int seed) {
        int x0 = (int) Math.floor(x);
        int y0 = (int) Math.floor(y);
        float fx = smooth(x - x0);
        float fy = smooth(y - y0);
        float top = lerp(hash(x0, y0, seed), hash(x0 + 1, y0, seed), fx);
        float bottom = lerp(hash(x0, y0 + 1, seed), hash(x0 + 1, y0 + 1, seed), fx);
        return lerp(top, bottom, fy);
    }

    private static float hash(int x, int y, int seed) {
        int h = x * 374_761_393 + y * 668_265_263 + seed * 1_274_126_177;
        h = (h ^ (h >>> 13)) * 1_274_126_177;
        return ((h ^ (h >>> 16)) & 0xFFFFFF) / (float) 0xFFFFFF;
    }

    private static float smooth(float t) {
        return t * t * (3 - 2 * t);
    }

    private static float lerp(float a, float b, float t) {
        return a + (b - a) * t;
    }

    private static float clamp(float v) {
        return v < 0 ? 0 : v > 1 ? 1 : v;
    }

    /** feComponentTransfer type='table': the value indexes a piecewise-linear list of stops. */
    private static float table(float[] values, float v) {
        float position = clamp(v) * (values.length - 1);
        int index = Math.min((int) position, values.length - 2);
        return lerp(values[index], values[index + 1], position - index);
    }

    private static int ramp(int[] colors, float v) {
        float position = clamp(v) * (colors.length - 1);
        int index = Math.min((int) position, colors.length - 2);
        float t = position - index;
        int from = colors[index];
        int to = colors[index + 1];
        int r = Math.round(lerp((from >> 16) & 0xFF, (to >> 16) & 0xFF, t));
        int g = Math.round(lerp((from >> 8) & 0xFF, (to >> 8) & 0xFF, t));
        int b = Math.round(lerp(from & 0xFF, to & 0xFF, t));
        return (r << 16) | (g << 8) | b;
    }
}
