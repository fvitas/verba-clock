package com.verba.clock.widget;

import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.RadialGradient;
import android.graphics.Shader;

/**
 * Native port of src/finishes/catalog.ts, matching ios/App/VerbaWidgets/Finishes.swift.
 * The SVG noise grain is dropped — invisible at widget sizes. Radial accents survive.
 */
public final class Finishes {
    public static final Finish[] ALL = {
        linear("deep-black", "Deep Black", true, 0.15f,
            stops(0x0A0A0C, 0, 0x050506, 60, 0x070709, 100)),
        linear("stainless-steel", "Stainless Steel", false, 0.3f,
            stops(0xC2C5C9, 0, 0xB0B3B7, 50, 0x9EA2A7, 100)),
        new Finish("black-pepper", "Black Pepper", true, 0.16f,
            stops(0x0A0A0C, 0, 0x050506, 60, 0x070709, 100),
            new Accent[] { new Accent(0x1E1E24, 0.3f, 0f, 0.6f) }),
        linear("grey-pepper", "Grey Pepper", true, 0.22f,
            stops(0x5E6165, 0, 0x4C4F53, 100)),
        linear("white-pepper", "White Pepper", false, 0.25f,
            stops(0xECEAE5, 0, 0xDEDBD4, 100)),
        linear("red-pepper", "Red Pepper", true, 0.2f,
            stops(0x7D1F24, 0, 0x641419, 100)),
        linear("hazelnut", "Hazelnut", false, 0.25f,
            stops(0xAD9161, 0, 0x8C714A, 60, 0x9F8355, 100)),
        new Finish("rust", "Rust", true, 0.22f,
            stops(0x3A1A0B, 0, 0x4F2410, 50, 0x2B1308, 100),
            new Accent[] {
                new Accent(0xA04E1A, 0.25f, 0.2f, 0.55f),
                new Accent(0x6D3315, 0.7f, 0.65f, 0.5f),
            }),
        new Finish("vintage-copper", "Vintage Copper", true, 0.22f,
            stops(0x15514C, 0, 0x27897D, 50, 0x0F3230, 100),
            new Accent[] { new Accent(0x4FB3A4, 0.3f, 0.25f, 0.55f) }),
        new Finish("waves", "Waves", true, 0.22f,
            stops(0x274B89, 0, 0x4F77B3, 50, 0x0F1A32, 100),
            new Accent[] { new Accent(0x8FB1D8, 0.3f, 0.25f, 0.55f) }),
        linear("gold", "Gold", false, 0.28f,
            stops(0xD4AF37, 0, 0xF0D878, 30, 0xC69F2E, 55, 0xE8CC60, 80, 0xB8922A, 100)),
        linear("silver-gold", "Silver & Gold", false, 0.28f,
            stops(0xA49C84, 0, 0xBDB59D, 50, 0x8A836A, 100)),
        linear("platinum", "Platinum", true, 0.3f,
            stops(0xBCB5A8, 0, 0xD2CCC0, 40, 0xA29A8C, 100)),
        linear("moon-gold", "Moon Gold", false, 0.28f,
            stops(0xCDAC7E, 0, 0xDBBD90, 40, 0xAB8759, 100)),
        linear("metamorphite", "Metamorphite", true, 0.2f,
            stops(0x22262A, 0, 0x16181B, 50, 0x0B0D0F, 100)),
        new Finish("desert", "Desert", false, 0.3f,
            stops(0xE8DBC6, 0, 0xF0E6D4, 50, 0xDCCCB4, 100),
            new Accent[] { new Accent(0xF7F0E1, 0.25f, 0.2f, 0.65f) }),
    };

    public static Finish byId(String id) {
        for (Finish finish : ALL) {
            if (finish.id.equals(id)) return finish;
        }
        return ALL[0];
    }

    private Finishes() {}

    private static Finish linear(String id, String name, boolean light, float stencilOpacity, Stops stops) {
        return new Finish(id, name, light, stencilOpacity, stops, new Accent[0]);
    }

    /** Flat (rgb, position-percent) pairs, in gradient order. */
    private static Stops stops(int... pairs) {
        int count = pairs.length / 2;
        int[] colors = new int[count];
        float[] positions = new float[count];
        for (int i = 0; i < count; i++) {
            colors[i] = 0xFF000000 | pairs[i * 2];
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

    /** A radial highlight over the base gradient: centre in unit coords, radius as a size fraction. */
    private static final class Accent {
        final int color;
        final float x;
        final float y;
        final float radius;

        Accent(int color, float x, float y, float radius) {
            this.color = 0xFF000000 | color;
            this.x = x;
            this.y = y;
            this.radius = radius;
        }
    }

    public static final class Finish {
        public final String id;
        public final String name;
        /** Light letters on a dark surface; false means dark letters on a light one. */
        public final boolean light;
        public final float stencilOpacity;

        private final Stops base;
        private final Accent[] accents;

        Finish(String id, String name, boolean light, float stencilOpacity, Stops base, Accent[] accents) {
            this.id = id;
            this.name = name;
            this.light = light;
            this.stencilOpacity = stencilOpacity;
            this.base = base;
            this.accents = accents;
        }

        public int litColor() {
            return light ? Color.WHITE : 0xFF181614;
        }

        public int stencilColor() {
            int alpha = Math.round(stencilOpacity * 255f);
            return (alpha << 24) | (light ? 0xFFFFFF : 0x000000);
        }

        /** Base gradient, top-left to bottom-right like the web's 135deg. */
        public Shader surface(int width, int height) {
            return new LinearGradient(0, 0, width, height, base.colors, base.positions, Shader.TileMode.CLAMP);
        }

        public int accentCount() {
            return accents.length;
        }

        public Shader accent(int index, int width, int height) {
            Accent it = accents[index];
            float radius = Math.max(width, height) * it.radius;
            return new RadialGradient(
                it.x * width, it.y * height, radius,
                new int[] { it.color, it.color & 0x00FFFFFF }, null, Shader.TileMode.CLAMP
            );
        }
    }
}
