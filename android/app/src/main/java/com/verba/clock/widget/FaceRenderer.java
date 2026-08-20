package com.verba.clock.widget;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Typeface;

/**
 * Draws a face into Bitmaps for RemoteViews. Android has no declarative widget text grid that can
 * do per-letter glow or gradient surfaces, so the face is canvas-drawn — the pixel-level sibling
 * of ClockFace.tsx and ios/App/VerbaWidgets/FaceViews.swift.
 *
 * The letter bitmap is always square, standing in for the web face's square query container: the
 * grid is 82% of the side and the type 4.2%, exactly the app's 82cqmin / 4.2cqmin. The widget
 * scales it with fitCenter, so those proportions survive any widget shape and the letters can
 * never stretch. The surface gradient is a separate, cheaper bitmap that does fill the frame.
 */
public final class FaceRenderer {
    /** RemoteViews bitmaps ride a Binder transaction; keep both well inside it. */
    private static final int MAX_FACE_SIDE = 448;
    private static final int MAX_SURFACE_SIDE = 256;

    // Proportions of the square container, from ClockFace.tsx (82cqmin / 4.2cqmin / 74.5cqmin),
    // opened up ~7% together: a widget has no app chrome around it, so the app's margin reads as
    // too much there. Scaled as a set, so the type stays the same fraction of a cell as in the app.
    private static final float GRID_WIDTH = 0.88f;
    private static final float FONT = 0.045f;
    private static final float WORD_GRID_HEIGHT = 0.8f;
    /** text-shadow: 0 0 0.4em — the glow radius is relative to the type, not the cell. */
    private static final float GLOW = 0.4f;
    private static final float GLOW_ALPHA = 0.55f;
    // Dark letters get the app's tighter, darker halo instead; a white glow would grey them out
    private static final float DARK_GLOW = 0.2f;
    private static final float DARK_GLOW_ALPHA = 0.4f;

    private static Typeface typeface;

    /** The finish itself, drawn at the widget's own aspect ratio to fill the frame. */
    public static Bitmap renderSurface(Finishes.Finish finish, int width, int height) {
        float scale = Math.min(1f, (float) MAX_SURFACE_SIDE / Math.max(width, height));
        int w = Math.max(1, Math.round(width * scale));
        int h = Math.max(1, Math.round(height * scale));

        Bitmap bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        finish.drawSurface(bitmap);
        return bitmap;
    }

    /** The letters alone, transparent behind them, in a square the widget centres and scales. */
    public static Bitmap renderFace(Context context, FaceData.Moment moment, Finishes.Finish finish,
                                    int side) {
        int size = Math.max(1, Math.min(MAX_FACE_SIDE, side));
        Bitmap bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);

        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setTypeface(typefaceFor(context, moment.language));
        paint.setTextSize(size * FONT);
        if (moment.language.wordGrid) {
            drawWordGrid(canvas, paint, moment, finish, size);
        } else {
            drawMatrix(canvas, paint, moment, finish, size);
        }
        return bitmap;
    }

    private FaceRenderer() {}

    private static void drawMatrix(Canvas canvas, Paint paint, FaceData.Moment moment,
                                   Finishes.Finish finish, int size) {
        int cols = FaceData.STRIDE;
        int rows = moment.language.rows.length;
        // Square cells, like the web grid's aspect-square spans
        float cell = Math.min(size * GRID_WIDTH / cols, (float) size / rows);
        float left = (size - cell * cols) / 2f;
        float top = (size - cell * rows) / 2f;
        boolean rtl = "rtl".equals(moment.language.dir);
        float baselineOffset = baselineOffset(paint);

        for (int row = 0; row < rows; row++) {
            float centerY = top + cell * (row + 0.5f);
            for (int col = 0; col < cols; col++) {
                String text = moment.language.cellText(row, col);
                if (text.isEmpty()) continue;
                int slot = rtl ? cols - 1 - col : col;
                drawCell(canvas, paint, text, left + cell * (slot + 0.5f), centerY + baselineOffset,
                    moment.isLit(row, col), finish);
            }
        }
    }

    /**
     * Word-grid faces (Arabic): rows hold whole words, justified edge to edge inside the same
     * 82% × 74.5% box the web face uses. No tracking — letter-spacing breaks cursive joining.
     */
    private static void drawWordGrid(Canvas canvas, Paint paint, FaceData.Moment moment,
                                     Finishes.Finish finish, int size) {
        int rows = moment.language.rows.length;
        float gridWidth = size * GRID_WIDTH;
        float gridHeight = size * WORD_GRID_HEIGHT;
        boolean rtl = "rtl".equals(moment.language.dir);
        float lineHeight = paint.getFontSpacing();
        float left = (size - gridWidth) / 2f;
        float top = (size - gridHeight) / 2f;
        float rowGap = rows > 1 ? (gridHeight - lineHeight * rows) / (rows - 1) : 0;
        float baselineOffset = baselineOffset(paint);

        for (int row = 0; row < rows; row++) {
            float centerY = top + row * (lineHeight + rowGap) + lineHeight / 2f;
            int slots = moment.language.columns(row);
            float[] widths = new float[slots];
            float used = 0;
            for (int slot = 0; slot < slots; slot++) {
                widths[slot] = paint.measureText(moment.language.cellText(row, slot));
                used += widths[slot];
            }
            float slotGap = slots > 1 ? (gridWidth - used) / (slots - 1) : 0;
            float x = left + (slots > 1 ? 0 : (gridWidth - used) / 2f);
            for (int slot = 0; slot < slots; slot++) {
                int index = rtl ? slots - 1 - slot : slot;
                drawCell(canvas, paint, moment.language.cellText(row, index),
                    x + widths[index] / 2f, centerY + baselineOffset,
                    moment.isLit(row, index), finish);
                x += widths[index] + slotGap;
            }
        }
    }

    private static void drawCell(Canvas canvas, Paint paint, String text, float centerX,
                                 float baseline, boolean lit, Finishes.Finish finish) {
        paint.setColor(lit ? finish.litColor() : finish.stencilColor());
        if (!lit) {
            paint.clearShadowLayer();
        } else if (finish.light) {
            paint.setShadowLayer(paint.getTextSize() * GLOW, 0, 0,
                withAlpha(0xFFFFFF, GLOW_ALPHA));
        } else {
            paint.setShadowLayer(paint.getTextSize() * DARK_GLOW, 0, 0,
                withAlpha(0x000000, DARK_GLOW_ALPHA));
        }
        canvas.drawText(text, centerX - paint.measureText(text) / 2f, baseline, paint);
    }

    /**
     * DINish covers Latin, Cyrillic and Greek. An asset Typeface has no fallback chain, so a face
     * it can't cover (Hebrew, Arabic, CJK) would draw tofu — hand those to the system family,
     * which does cascade. iOS gets this for free from CoreText.
     */
    private static Typeface typefaceFor(Context context, FaceData.Language language) {
        Paint probe = new Paint();
        probe.setTypeface(verbaTypeface(context));
        for (String row : language.rows) {
            for (int i = 0; i < row.length(); i++) {
                String glyph = row.substring(i, i + 1);
                if (!" ".equals(glyph) && !probe.hasGlyph(glyph)) return Typeface.DEFAULT;
            }
        }
        return probe.getTypeface();
    }

    private static synchronized Typeface verbaTypeface(Context context) {
        if (typeface == null) {
            typeface = Typeface.createFromAsset(context.getAssets(), "DINish-Medium.ttf");
        }
        return typeface;
    }

    private static int withAlpha(int rgb, float alpha) {
        return (Math.round(alpha * 255f) << 24) | rgb;
    }

    /** Distance from a cell's vertical centre to the baseline that centres the glyphs in it. */
    private static float baselineOffset(Paint paint) {
        Paint.FontMetrics metrics = paint.getFontMetrics();
        return -(metrics.ascent + metrics.descent) / 2f;
    }
}
