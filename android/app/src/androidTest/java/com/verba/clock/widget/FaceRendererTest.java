package com.verba.clock.widget;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Rect;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * Renders on-device because Canvas, Typeface and gradients only exist on Android. Also dumps
 * composites to the app's files dir so a face can be eyeballed without a home screen.
 */
@RunWith(AndroidJUnit4.class)
public class FaceRendererTest {
    private final Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();

    @Test
    public void litsTheEnglishFaceAtThreeOClock() {
        FaceData.Moment moment = moment("en", 15, 0);
        // IT IS THREE OCLOCK — coordinates from src/clock/languages/en.ts
        assertTrue(moment.isLit(0, 0) && moment.isLit(0, 1));
        assertTrue(moment.isLit(0, 3) && moment.isLit(0, 4));
        assertTrue(moment.isLit(5, 6) && moment.isLit(5, 10));
        assertTrue(moment.isLit(9, 5) && moment.isLit(9, 10));
        assertFalse(moment.isLit(3, 0));
    }

    @Test
    public void dropsTheItIsWordsWhenTurnedOff() {
        FaceData.Moment moment = new FaceData.Moment(language("en"), 15, 0, false);
        assertFalse(moment.isLit(0, 0));
        assertTrue(moment.isLit(5, 6));
    }

    @Test
    public void bucketsMinutesIntoFives() {
        assertEquals(litCount("en", 10, 5), litCount("en", 10, 9));
        assertTrue(litCount("en", 10, 5) != litCount("en", 10, 10));
    }

    @Test
    public void drawsLitLetters() {
        Bitmap face = render("en", "deep-black", 320);
        assertEquals(320, face.getWidth());
        assertEquals(320, face.getHeight());
        assertTrue("expected lit white letters", countBright(face) > 100);
    }

    /** The letters must stay square whatever the widget's shape, or they read as stretched. */
    @Test
    public void keepsTheFaceSquareAndTheSurfaceShaped() {
        Bitmap face = render("en", "deep-black", 2_000);
        assertEquals(448, face.getWidth());
        assertEquals(448, face.getHeight());

        Bitmap surface = FaceRenderer.renderSurface(Finishes.byId("deep-black"), 800, 400);
        assertEquals(256, surface.getWidth());
        assertEquals(128, surface.getHeight());
    }

    /**
     * The grid is 88% of the square — the app's 82cqmin opened up a little for a widget — so the
     * face keeps a margin instead of running letters to the edge. Checked at 5% to leave the
     * glow room; the ink itself starts around 7%.
     */
    @Test
    public void insetsTheGridFromTheEdges() {
        Bitmap face = render("en", "deep-black", 400);
        for (int y = 0; y < face.getHeight(); y++) {
            for (int x = 0; x < 20; x++) {
                assertEquals("ink in the left margin", 0, face.getPixel(x, y));
                assertEquals("ink in the right margin", 0, face.getPixel(face.getWidth() - 1 - x, y));
            }
        }
    }

    @Test
    public void drawsEveryFinishAndFace() {
        for (Finishes.Finish finish : Finishes.ALL) {
            assertTrue(render("en", finish.id, 240).getWidth() > 0);
            assertTrue(FaceRenderer.renderSurface(finish, 240, 240).getWidth() > 0);
        }
        for (String id : new String[] { "de", "he", "ar", "ja", "ru", "el" }) {
            assertTrue(render(id, "deep-black", 240).getWidth() > 0);
        }
    }

    @Test
    public void dumpsSampleFaces() throws IOException {
        // Internal storage: scoped storage hides /sdcard/Android/data from the adb shell user,
        // but `run-as` can read this
        File dir = context.getFilesDir();
        for (String[] sample : new String[][] {
            { "en", "deep-black" }, { "en", "white-pepper" }, { "de", "rust" }, { "ar", "desert" },
        }) {
            Bitmap composite = Bitmap.createBitmap(384, 384, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(composite);
            canvas.drawBitmap(FaceRenderer.renderSurface(Finishes.byId(sample[1]), 384, 384),
                null, new Rect(0, 0, 384, 384), null);
            canvas.drawBitmap(render(sample[0], sample[1], 384), 0, 0, null);
            try (FileOutputStream out = new FileOutputStream(
                new File(dir, "face-" + sample[0] + "-" + sample[1] + ".png"))) {
                composite.compress(Bitmap.CompressFormat.PNG, 100, out);
            }
        }
    }

    private FaceData.Language language(String id) {
        return FaceData.get(context).language(id);
    }

    private FaceData.Moment moment(String id, int hour, int minute) {
        return new FaceData.Moment(language(id), hour, minute, true);
    }

    private int litCount(String id, int hour, int minute) {
        FaceData.Moment moment = moment(id, hour, minute);
        int count = 0;
        for (int row = 0; row < moment.language.rows.length; row++) {
            for (int col = 0; col < FaceData.STRIDE; col++) {
                if (moment.isLit(row, col)) count++;
            }
        }
        return count;
    }

    private Bitmap render(String languageId, String finishId, int side) {
        return FaceRenderer.renderFace(context, moment(languageId, 10, 35),
            Finishes.byId(finishId), side);
    }

    private static int countBright(Bitmap bitmap) {
        int count = 0;
        for (int y = 0; y < bitmap.getHeight(); y++) {
            for (int x = 0; x < bitmap.getWidth(); x++) {
                if ((bitmap.getPixel(x, y) & 0xFF) > 0xE0) count++;
            }
        }
        return count;
    }
}
