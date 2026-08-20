package com.verba.clock.widget;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

/**
 * The app pushes its settings JSON here on every change (WidgetBridgePlugin). Android needs no
 * App Group — the widget runs in the same package, so plain SharedPreferences do.
 */
public final class WidgetSettings {
    private static final String PREFS = "verba_widget";
    private static final String KEY = "settings";

    public final String languageId;
    public final String finishId;
    public final boolean showItIs;

    public static void store(Context context, String json) {
        prefs(context).edit().putString(KEY, json).apply();
    }

    public static WidgetSettings load(Context context) {
        return new WidgetSettings(prefs(context).getString(KEY, null));
    }

    private WidgetSettings(String json) {
        JSONObject parsed = parse(json);
        languageId = parsed.optString("languageId", "en");
        finishId = parsed.optString("finishId", "deep-black");
        showItIs = parsed.optBoolean("showItIs", true);
    }

    private static JSONObject parse(String json) {
        if (json != null) {
            try {
                return new JSONObject(json);
            } catch (org.json.JSONException ignored) {
                // Fall through to app defaults rather than leaving the widget blank
            }
        }
        return new JSONObject();
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
