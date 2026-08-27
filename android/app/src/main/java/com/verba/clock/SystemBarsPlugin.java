package com.verba.clock;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** The theme pins white glyphs (styles.xml); light fronts need dark ones, set per finish at runtime. */
@CapacitorPlugin(name = "SystemBars")
public class SystemBarsPlugin extends Plugin {
    @PluginMethod
    public void setGlyphs(PluginCall call) {
        boolean dark = Boolean.TRUE.equals(call.getBoolean("dark", false));
        getActivity().runOnUiThread(() -> {
            WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(
                getActivity().getWindow(), getActivity().getWindow().getDecorView());
            bars.setAppearanceLightNavigationBars(dark);
            bars.setAppearanceLightStatusBars(dark);
            call.resolve();
        });
    }
}
