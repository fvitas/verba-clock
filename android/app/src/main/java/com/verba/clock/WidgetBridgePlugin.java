package com.verba.clock;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.verba.clock.widget.VerbaWidgetProvider;
import com.verba.clock.widget.WidgetSettings;

/** Android twin of ios/App/App/WidgetBridgePlugin.swift: hands the app's settings to the widget. */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {
    @PluginMethod
    public void syncSettings(PluginCall call) {
        String settings = call.getString("settings");
        if (settings == null) {
            call.reject("settings is required");
            return;
        }
        WidgetSettings.store(getContext(), settings);
        VerbaWidgetProvider.refresh(getContext());
        call.resolve();
    }
}
