package com.verba.clock.widget;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Reads FaceData.json, precomputed by scripts/export-face-data.ts: 24h x 12 five-minute
 * buckets per language. The TS phrase engine stays the single source of truth — Java only
 * looks states up, exactly like the iOS widget's FaceData.swift.
 */
public final class FaceData {
    /** Lit cells are keyed row * STRIDE + col, matching the iOS widget's cell hash. */
    public static final int STRIDE = 11;

    private static FaceData instance;

    private final Language[] languages;

    public static synchronized FaceData get(Context context) {
        if (instance == null) instance = new FaceData(read(context, "FaceData.json"));
        return instance;
    }

    public Language language(String id) {
        for (Language language : languages) {
            if (language.id.equals(id)) return language;
        }
        return languages[0];
    }

    private FaceData(String json) {
        try {
            JSONArray array = new JSONObject(json).getJSONArray("languages");
            languages = new Language[array.length()];
            for (int i = 0; i < languages.length; i++) {
                languages[i] = new Language(array.getJSONObject(i));
            }
        } catch (JSONException error) {
            throw new IllegalStateException("FaceData.json is malformed", error);
        }
    }

    private static String read(Context context, String asset) {
        try (InputStream stream = context.getAssets().open(asset)) {
            ByteArrayOutputStream out = new ByteArrayOutputStream(stream.available());
            byte[] chunk = new byte[8192];
            for (int read; (read = stream.read(chunk)) != -1; ) out.write(chunk, 0, read);
            return out.toString(StandardCharsets.UTF_8.name());
        } catch (IOException error) {
            throw new IllegalStateException("missing asset " + asset, error);
        }
    }

    public static final class Language {
        public final String id;
        public final String name;
        public final String[] rows;
        /** "rtl" for faces whose column 0 is the rightmost cell (Hebrew, Arabic). */
        public final String dir;
        /**
         * "word" for faces whose rows hold space-separated whole words and whose coords index
         * word slots instead of letter columns (Arabic — cursive script has no letter cells).
         */
        public final boolean wordGrid;

        private final Map<String, String> cellOverrides = new HashMap<>();
        private final Word[] words;
        private final int[][] itIs;
        private final int[][] phrase;
        private final String[][] slots;

        Language(JSONObject json) throws JSONException {
            id = json.getString("id");
            name = json.getString("name");
            dir = json.optString("dir", null);
            wordGrid = "word".equals(json.optString("layout", null));

            JSONArray rowsJson = json.getJSONArray("rows");
            rows = new String[rowsJson.length()];
            slots = new String[rows.length][];
            for (int row = 0; row < rows.length; row++) {
                rows[row] = rowsJson.getString(row);
                slots[row] = wordGrid ? rows[row].split(" ") : null;
            }

            JSONObject overrides = json.optJSONObject("cellOverrides");
            if (overrides != null) {
                for (java.util.Iterator<String> keys = overrides.keys(); keys.hasNext(); ) {
                    String key = keys.next();
                    cellOverrides.put(key, overrides.getString(key));
                }
            }

            JSONArray wordsJson = json.getJSONArray("words");
            words = new Word[wordsJson.length()];
            for (int i = 0; i < words.length; i++) {
                JSONObject word = wordsJson.getJSONObject(i);
                words[i] = new Word(word.getInt("r"), word.getInt("s"), word.getInt("e"));
            }

            JSONArray statesJson = json.getJSONArray("states");
            itIs = new int[statesJson.length()][];
            phrase = new int[statesJson.length()][];
            for (int i = 0; i < statesJson.length(); i++) {
                JSONObject state = statesJson.getJSONObject(i);
                itIs[i] = indices(state.getJSONArray("i"));
                phrase[i] = indices(state.getJSONArray("p"));
            }
        }

        public int columns(int row) {
            return wordGrid ? slots[row].length : rows[row].length();
        }

        /** Per-cell display text, honouring apostrophe overrides (e.g. Italian L'). */
        public String cellText(int row, int col) {
            if (wordGrid) return col < slots[row].length ? slots[row][col] : "";
            String override = cellOverrides.get(row + ":" + col);
            if (override != null) return override;
            return col < rows[row].length() ? rows[row].substring(col, col + 1) : "";
        }

        private static int[] indices(JSONArray array) throws JSONException {
            int[] result = new int[array.length()];
            for (int i = 0; i < result.length; i++) result[i] = array.getInt(i);
            return result;
        }
    }

    private static final class Word {
        final int row;
        final int start;
        final int end;

        Word(int row, int start, int end) {
            this.row = row;
            this.start = start;
            this.end = end;
        }
    }

    /** A resolved moment on a face: which cells are lit. */
    public static final class Moment {
        public final Language language;
        private final boolean[] lit;

        public Moment(Language language, int hour, int minute, boolean showItIs) {
            this.language = language;
            this.lit = new boolean[language.rows.length * STRIDE];
            int state = hour * 12 + minute / 5;
            if (showItIs) light(language.itIs[state]);
            light(language.phrase[state]);
        }

        public boolean isLit(int row, int col) {
            int cell = row * STRIDE + col;
            return cell < lit.length && lit[cell];
        }

        private void light(int[] indices) {
            for (int index : indices) {
                Word word = language.words[index];
                for (int col = word.start; col <= word.end; col++) lit[word.row * STRIDE + col] = true;
            }
        }
    }
}
