package com.verba.clock.widget;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.DashPathEffect;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RadialGradient;
import android.graphics.Shader;

/**
 * Native port of src/finishes/catalog.ts. Each finish is the same stack of layers the web CSS
 * builds, in the same paint order: a gradient or a procedural material, then any highlight, then
 * any sheen or grain on top. CSS lists background layers topmost-first, so its order is reversed
 * here. The materials themselves are generated rather than approximated — see {@link Textures}.
 */
public final class Finishes {
    // Palettes are the catalog's mottle() ramps, unchanged
    private static final int[] STEEL = { 0x9A9EA3, 0xA8ACB0, 0xB4B7BB, 0xBFC2C6 };
    private static final int[] RUST = {
        0x120804, 0x1E0D06, 0x2B1308, 0x3A1A0B, 0x4F2410, 0x6D3315, 0xA04E1A, 0xD97A28,
    };
    private static final int[] COPPER = { 0x0F3230, 0x15514C, 0x27897D, 0x4FB3A4, 0x8FD8C8, 0xC9E8DD };
    private static final int[] WAVES = { 0x0F1A32, 0x062460, 0x274B89, 0x4F77B3, 0x8FB1D8, 0xC9DCE8 };
    private static final int[] SILVER_GOLD = { 0x6D6650, 0x8A836A, 0xA49C84, 0xBDB59D, 0xD2CCB6 };
    private static final int[] PLATINUM = { 0x847C6E, 0xA29A8C, 0xBCB5A8, 0xD2CCC0, 0xE8E4DA };
    private static final int[] MOON_GOLD = { 0xAB8759, 0xBD9A6C, 0xCDAC7E, 0xDBBD90, 0xE8CFA4 };
    private static final int[] SLATE = { 0x0B0D0F, 0x131518, 0x1A1D20, 0x22262A, 0x31363C };
    private static final int[] SAND = { 0xC9B596, 0xDCCCB4, 0xE8DBC6, 0xF0E6D4, 0xF7F0E1 };

    public static final Finish[] ALL = {
        finish("deep-black", "Deep Black", true, 0.15f,
            gradient(0x0A0A0C, 0, 0x050506, 60, 0x070709, 100)),
        finish("stainless-steel", "Stainless Steel", false, 0.3f,
            mottle(fractal(0.006f, 0.55f, 3, 7), STEEL),
            sheen(0x1FFFFFFF, 0, 0x0A000000, 40, 0x17FFFFFF, 65, 0x12000000, 100)),
        finish("black-pepper", "Black Pepper", true, 0.16f,
            gradient(0x0A0A0C, 0, 0x050506, 60, 0x070709, 100),
            accent(0x732C2C34, 0.3f, 0f, 0.6f),
            grain(0.12f, 41)),
        finish("grey-pepper", "Grey Pepper", true, 0.22f,
            gradient(0x5E6165, 0, 0x4C4F53, 100),
            grain(0.18f, 43)),
        finish("white-pepper", "White Pepper", false, 0.25f,
            gradient(0xECEAE5, 0, 0xDEDBD4, 100),
            grain(0.12f, 47)),
        finish("red-pepper", "Red Pepper", true, 0.2f,
            gradient(0x7D1F24, 0, 0x641419, 100),
            grain(0.15f, 53)),
        finish("hazelnut", "Hazelnut", false, 0.25f,
            gradient(0xAD9161, 0, 0x8C714A, 60, 0x9F8355, 100),
            accent(0x38FFF0D2, 0.3f, 0.1f, 0.6f),
            grain(0.07f, 59)),
        finish("rust", "Rust", true, 0.22f,
            mottle(fractal(0.006f, 0.006f, 6, 11), RUST),
            grain(0.14f, 61)),
        finish("vintage-copper", "Vintage Copper", true, 0.22f,
            mottle(turbulent(0.007f, 5, 5), COPPER),
            grain(0.1f, 67)),
        finish("waves", "Waves", true, 0.22f,
            mottle(fractal(0.005f, 0.005f, 5, 5), WAVES),
            grain(0.1f, 71)),
        finish("gold", "Gold", false, 0.28f,
            gradient(0xD4AF37, 0, 0xF0D878, 30, 0xC69F2E, 55, 0xE8CC60, 80, 0xB8922A, 100),
            grain(0.08f, 73)),
        finish("silver-gold", "Silver & Gold", false, 0.28f,
            mottle(fractal(0.009f, 0.009f, 6, 13), SILVER_GOLD),
            grain(0.08f, 79)),
        finish("platinum", "Platinum", true, 0.3f,
            mottle(fractal(0.005f, 0.005f, 5, 21), PLATINUM),
            grain(0.07f, 83)),
        finish("moon-gold", "Moon Gold", false, 0.28f,
            mottle(fractal(0.006f, 0.006f, 5, 9), MOON_GOLD),
            grain(0.07f, 89)),
        finish("metamorphite", "Metamorphite", true, 0.2f,
            mottle(rotated(0.003f, 0.014f, 4, 9, -35f), SLATE),
            grain(0.15f, 97)),
        finish("desert", "Desert", false, 0.3f,
            mottle(fractal(0.55f, 0.55f, 3, 8), SAND),
            wash(fractal(0.006f, 0.006f, 4, 31), 0xC0A069, new float[] { 0, 0.02f, 0.08f, 0.18f, 0.3f }),
            wash(fractal(0.4f, 0.4f, 3, 17), 0x7A5C34, new float[] { 0, 0, 0, 0, 0.12f, 0.26f }),
            veins()),
    };

    public static Finish byId(String id) {
        for (Finish finish : ALL) {
            if (finish.id.equals(id)) return finish;
        }
        return ALL[0];
    }

    private Finishes() {}

    /** One stacked layer of a surface, painted in declaration order. */
    private interface Layer {
        void draw(Canvas canvas, int width, int height);
    }

    private static Finish finish(String id, String name, boolean light, float stencilOpacity,
                                Layer... layers) {
        return new Finish(id, name, light, stencilOpacity, layers);
    }

    /** Opaque colours, top-left to bottom-right like the web's 135deg. */
    private static Layer gradient(int... pairs) {
        return linear(stops(pairs, true));
    }

    /** The same, keeping the alpha it was given — a translucent gloss over a material. */
    private static Layer sheen(int... pairs) {
        return linear(stops(pairs, false));
    }

    private static Layer linear(Stops stops) {
        return (canvas, width, height) -> {
            Paint paint = fill();
            paint.setShader(new LinearGradient(0, 0, width, height,
                stops.colors, stops.positions, Shader.TileMode.CLAMP));
            canvas.drawRect(0, 0, width, height, paint);
        };
    }

    /** A radial highlight: centre in unit coords, radius as a fraction of the longer side. */
    private static Layer accent(int argb, float x, float y, float radius) {
        return (canvas, width, height) -> {
            Paint paint = fill();
            paint.setShader(new RadialGradient(x * width, y * height,
                Math.max(width, height) * radius,
                new int[] { argb, argb & 0x00FFFFFF }, null, Shader.TileMode.CLAMP));
            canvas.drawRect(0, 0, width, height, paint);
        };
    }

    private static Layer mottle(Textures.Noise noise, int[] palette) {
        return (canvas, width, height) ->
            canvas.drawBitmap(Textures.palette(width, height, noise, palette), 0, 0, null);
    }

    private static Layer wash(Textures.Noise noise, int rgb, float[] alphas) {
        return (canvas, width, height) ->
            canvas.drawBitmap(Textures.wash(width, height, noise, rgb, alphas), 0, 0, null);
    }

    /**
     * The catalog's noise() overlay. Its alpha is as random as its colour, so it does not just add
     * speckle — it pulls the surface toward mid-grey, by opacity x 0.5 x (127 - base). That lift is
     * why the app's dark finishes read lighter than their gradients alone, and dropping it as
     * "invisible grain" is what made every dark finish here come out too dark. Its own frequency is
     * far finer than a widget pixel, so it lands as per-pixel randomness whatever value it started
     * from; only the mean and the spread survive the trip.
     */
    private static Layer grain(float opacity, int seed) {
        return wash(fractal(0.6f, 0.6f, 3, seed), 0x7F7F7F, new float[] { 0, opacity });
    }

    /**
     * Desert's veins, traced from the QLOCKTWO reference in catalog.ts. Drawn in the catalog's
     * 900-unit space and stretched to the surface, which is what its SVG does with
     * preserveAspectRatio='none'. The displacement filter that frays them has no Skia equivalent.
     */
    private static Layer veins() {
        return (canvas, width, height) -> {
            Path vein = path(495, -20, new float[] { 440, 180, 370, 330, 300, 470, 240, 590, 160, 720, 70, 880 });
            Path vein2 = path(-20, 160, new float[] { 120, 120, 260, 90, 400, 70 });
            Path vein3 = path(830, -20, new float[] { 800, 120, 760, 240, 690, 400 });
            Path debris1 = line(370, 330, 430, 380, 470, 400);
            Path debris2 = line(240, 590, 300, 640, 330, 670);

            // A hairline of the catalog's tile lands under a pixel here and would vanish into the
            // launcher's upscale, so no stroke is allowed thinner than one bitmap pixel
            float hairline = 900f / Math.min(width, height);

            canvas.save();
            canvas.scale(width / 900f, height / 900f);
            stroke(canvas, vein, 0xA5804D, 16f, 0.12f, false, hairline);
            stroke(canvas, vein, 0xB08E58, 8f, 0.3f, false, hairline);
            stroke(canvas, vein, 0x7D5C34, 3.5f, 0.6f, false, hairline);
            stroke(canvas, vein, 0x6F5230, 1.4f, 0.55f, true, hairline);
            stroke(canvas, debris1, 0x85643C, 1.8f, 0.4f, false, hairline);
            stroke(canvas, debris2, 0x85643C, 1.6f, 0.38f, false, hairline);
            stroke(canvas, vein2, 0xA5804D, 5f, 0.2f, false, hairline);
            stroke(canvas, vein2, 0x85643C, 1.8f, 0.4f, false, hairline);
            stroke(canvas, vein3, 0xA5804D, 4f, 0.18f, false, hairline);
            stroke(canvas, vein3, 0x85643C, 1.6f, 0.35f, false, hairline);
            canvas.restore();
        };
    }

    private static Path path(float x, float y, float[] cubics) {
        Path path = new Path();
        path.moveTo(x, y);
        for (int i = 0; i < cubics.length; i += 6) {
            path.cubicTo(cubics[i], cubics[i + 1], cubics[i + 2], cubics[i + 3],
                cubics[i + 4], cubics[i + 5]);
        }
        return path;
    }

    private static Path line(float... points) {
        Path path = new Path();
        path.moveTo(points[0], points[1]);
        for (int i = 2; i < points.length; i += 2) path.lineTo(points[i], points[i + 1]);
        return path;
    }

    private static void stroke(Canvas canvas, Path path, int rgb, float width, float opacity,
                               boolean dashed, float hairline) {
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeCap(Paint.Cap.ROUND);
        paint.setStrokeWidth(Math.max(width, hairline));
        paint.setColor((Math.round(opacity * 255f) << 24) | rgb);
        if (dashed) paint.setPathEffect(new DashPathEffect(new float[] { 3, 5 }, 0));
        canvas.drawPath(path, paint);
    }

    private static Paint fill() {
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        // Near-black gradients band visibly on this surface without it
        paint.setDither(true);
        return paint;
    }

    private static Textures.Noise fractal(float freqX, float freqY, int octaves, int seed) {
        return new Textures.Noise(freqX, freqY, octaves, seed, 0f, false);
    }

    private static Textures.Noise turbulent(float freq, int octaves, int seed) {
        return new Textures.Noise(freq, freq, octaves, seed, 0f, true);
    }

    private static Textures.Noise rotated(float freqX, float freqY, int octaves, int seed,
                                          float degrees) {
        return new Textures.Noise(freqX, freqY, octaves, seed, degrees, false);
    }

    /** Flat (colour, position-percent) pairs, in gradient order. */
    private static Stops stops(int[] pairs, boolean opaque) {
        int count = pairs.length / 2;
        int[] colors = new int[count];
        float[] positions = new float[count];
        for (int i = 0; i < count; i++) {
            colors[i] = opaque ? 0xFF000000 | pairs[i * 2] : pairs[i * 2];
            positions[i] = pairs[i * 2 + 1] / 100f;
        }
        return new Stops(colors, positions);
    }

    private static final class Stops {
        final int[] colors;
        final float[] positions;

        Stops(int[] colors, float[] positions) {
            this.colors = colors;
            this.positions = positions;
        }
    }

    public static final class Finish {
        public final String id;
        public final String name;
        /** Light letters on a dark surface; false means dark letters on a light one. */
        public final boolean light;
        public final float stencilOpacity;

        private final Layer[] layers;

        Finish(String id, String name, boolean light, float stencilOpacity, Layer[] layers) {
            this.id = id;
            this.name = name;
            this.light = light;
            this.stencilOpacity = stencilOpacity;
            this.layers = layers;
        }

        public int litColor() {
            return light ? Color.WHITE : 0xFF181614;
        }

        public int stencilColor() {
            int alpha = Math.round(stencilOpacity * 255f);
            return (alpha << 24) | (light ? 0xFFFFFF : 0x000000);
        }

        public void drawSurface(Bitmap bitmap) {
            Canvas canvas = new Canvas(bitmap);
            for (Layer layer : layers) layer.draw(canvas, bitmap.getWidth(), bitmap.getHeight());
        }
    }
}
